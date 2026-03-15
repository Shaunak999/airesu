from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db import IntegrityError

from .models import Resume
from .serializers import (
    UserRegisterSerializer,
    ResumeSerializer,
    ResumeUploadSerializer,
    JobMatchRequestSerializer,
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
        serializer = ResumeUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        file = serializer.validated_data["file"]
        if not file.name.lower().endswith(".pdf"):
            return Response(
                {"error": "Only PDF files are supported."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        text = extract_text_from_pdf(file)
        skills = extract_skills(text)
        resume = Resume.objects.create(
            user=request.user,
            original_filename=file.name,
            extracted_text=text,
            skills=skills,
        )
        return Response(
            ResumeSerializer(resume).data,
            status=status.HTTP_201_CREATED,
        )


class ResumeListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)


class JobMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        req = JobMatchRequestSerializer(data=request.data)
        if not req.is_valid():
            return Response(req.errors, status=status.HTTP_400_BAD_REQUEST)
        job_description = req.validated_data["job_description"]
        job_skills = extract_skills_from_job_description(job_description)
        latest = Resume.objects.filter(user=request.user).first()
        if not latest:
            return Response(
                {
                    "match_score": 0.0,
                    "skills_found": [],
                    "missing_skills": job_skills,
                    "suggestions": ["Upload a resume first to get a match score."],
                },
                status=status.HTTP_200_OK,
            )
        resume_skills = latest.skills
        score = match_score(resume_skills, job_skills)
        missing = missing_skills(resume_skills, job_skills)
        suggestions = []
        if missing:
            suggestions.append(f"Consider adding or highlighting: {', '.join(missing[:5])}.")
        if score < 70:
            suggestions.append("Try to gain experience in the missing skills or reframe existing experience.")
        return Response(
            {
                "match_score": score,
                "skills_found": resume_skills,
                "missing_skills": missing,
                "suggestions": suggestions,
            },
            status=status.HTTP_200_OK,
        )


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Dashboard: latest resume summary (score requires a job match; here we show resume stats)."""
        latest = Resume.objects.filter(user=request.user).first()
        if not latest:
            return Response(
                {
                    "has_resume": False,
                    "resume": None,
                    "skills_found": [],
                    "message": "Upload a resume to see your dashboard.",
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {
                "has_resume": True,
                "resume": ResumeSerializer(latest).data,
                "skills_found": latest.skills,
                "message": "Paste a job description in the Match tab to get your match score.",
            },
            status=status.HTTP_200_OK,
        )
