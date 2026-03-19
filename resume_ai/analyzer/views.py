from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db import IntegrityError

from .models import Resume, JobProfile
from .serializers import (
    UserRegisterSerializer,
    ResumeSerializer,
    ResumeUploadSerializer,
    JobMatchRequestSerializer,
    JobProfileSerializer,
)
from .services import (
    extract_text_from_pdf,
    extract_skills,
    extract_skills_from_job_description,
    match_score,
    missing_skills,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """User signup. Returns user id and username (use JWT login to get tokens)."""
    try:
        serializer = UserRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = serializer.save()
        except IntegrityError as e:
            if "username" in str(e).lower() or "unique" in str(e).lower():
                return Response(
                    {"username": ["A user with that username already exists."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            raise
        return Response(
            {"id": user.id, "username": user.username, "message": "User created. Please login."},
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {"detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        files = request.FILES.getlist("files")
        if not files:
            serializer = ResumeUploadSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            files = [serializer.validated_data["file"]]

        created = []
        failed = []
        for file in files:
            if not file.name.lower().endswith(".pdf"):
                failed.append({"filename": file.name, "error": "Only PDF files are supported."})
                continue

            text = extract_text_from_pdf(file)
            skills = extract_skills(text)
            resume = Resume.objects.create(
                user=request.user,
                original_filename=file.name,
                extracted_text=text,
                skills=skills,
            )
            created.append(ResumeSerializer(resume).data)

        return Response(
            {
                "uploaded_count": len(created),
                "failed_count": len(failed),
                "uploaded": created,
                "failed": failed,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST,
        )


class ResumeListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


class ResumeDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


class JobProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active = JobProfile.objects.filter(user=request.user, is_active=True).first()
        if not active:
            return Response(
                {"job_profile": None, "message": "No active job description. Add one to start screening resumes."},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"job_profile": JobProfileSerializer(active).data},
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        title = (request.data.get("title") or "Active Job Description").strip()
        description = (request.data.get("description") or "").strip()
        if not description:
            return Response({"description": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        JobProfile.objects.filter(user=request.user, is_active=True).update(is_active=False)
        job = JobProfile.objects.create(
            user=request.user,
            title=title,
            description=description,
            is_active=True,
        )
        return Response(
            {"job_profile": JobProfileSerializer(job).data, "message": "Job description saved as active."},
            status=status.HTTP_201_CREATED,
        )


class JobMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        req = JobMatchRequestSerializer(data=request.data)
        if not req.is_valid():
            return Response(req.errors, status=status.HTTP_400_BAD_REQUEST)

        provided_description = req.validated_data.get("job_description")
        if provided_description:
            current = JobProfile.objects.filter(user=request.user, is_active=True).first()
            if current:
                current.description = provided_description
                current.save(update_fields=["description", "updated_at"])
                active_job = current
            else:
                active_job = JobProfile.objects.create(
                    user=request.user,
                    title="Active Job Description",
                    description=provided_description,
                    is_active=True,
                )
        else:
            active_job = JobProfile.objects.filter(user=request.user, is_active=True).first()

        if not active_job:
            return Response(
                {
                    "job_profile": None,
                    "ranked_candidates": [],
                    "message": "No active job description. Add one to screen resumes.",
                },
                status=status.HTTP_200_OK,
            )

        job_skills = extract_skills_from_job_description(active_job.description)
        resumes = list(Resume.objects.filter(user=request.user))
        if not resumes:
            return Response(
                {
                    "job_profile": JobProfileSerializer(active_job).data,
                    "total_resumes": 0,
                    "ranked_candidates": [],
                    "message": "Upload resumes to start ranking compatibility.",
                },
                status=status.HTTP_200_OK,
            )

        ranked = []
        for resume in resumes:
            resume_skills = resume.skills
            score = match_score(resume_skills, job_skills)
            missing = missing_skills(resume_skills, job_skills)
            suggestions = []
            if missing:
                suggestions.append(f"Missing key skills: {', '.join(missing[:5])}.")
            if score < 70:
                suggestions.append("Lower compatibility. Consider shortlist hold and manual review.")

            ranked.append(
                {
                    "resume_id": resume.id,
                    "resume_name": resume.original_filename,
                    "uploaded_at": resume.created_at,
                    "match_score": score,
                    "skills_found": resume_skills,
                    "missing_skills": missing,
                    "suggestions": suggestions,
                }
            )

        ranked.sort(key=lambda item: item["match_score"], reverse=True)
        for idx, item in enumerate(ranked, start=1):
            item["rank"] = idx

        return Response(
            {
                "job_profile": JobProfileSerializer(active_job).data,
                "total_resumes": len(ranked),
                "ranked_candidates": ranked,
                "message": "Candidates ranked by compatibility against the active job description.",
            },
            status=status.HTTP_200_OK,
        )


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Dashboard for recruiter workflow."""
        latest = Resume.objects.filter(user=request.user).first()
        active_job = JobProfile.objects.filter(user=request.user, is_active=True).first()
        resumes_count = Resume.objects.filter(user=request.user).count()

        if not latest:
            return Response(
                {
                    "has_resume": False,
                    "resumes_count": resumes_count,
                    "active_job_profile": JobProfileSerializer(active_job).data if active_job else None,
                    "resume": None,
                    "skills_found": [],
                    "message": "Upload candidate resumes to start screening.",
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "has_resume": True,
                "resumes_count": resumes_count,
                "active_job_profile": JobProfileSerializer(active_job).data if active_job else None,
                "resume": ResumeSerializer(latest).data,
                "skills_found": latest.skills,
                "message": "Set an active job description in Match, then rank all uploaded resumes.",
            },
            status=status.HTTP_200_OK,
        )
