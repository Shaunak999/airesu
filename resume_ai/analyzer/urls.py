from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path("auth/register/", views.register),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("resumes/", views.ResumeListView.as_view(), name="resume-list"),
    path("resumes/<int:pk>/", views.ResumeDetailView.as_view(), name="resume-detail"),
    path("resumes/upload/", views.ResumeUploadView.as_view(), name="resume-upload"),
    path("job-profile/", views.JobProfileView.as_view(), name="job-profile"),
    path("match/", views.JobMatchView.as_view(), name="job-match"),
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),
]
