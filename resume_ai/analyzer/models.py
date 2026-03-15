from django.db import models
from django.conf import settings


class Resume(models.Model):
    """Stores extracted resume data per user."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resumes"
    )
    original_filename = models.CharField(max_length=255, blank=True)
    extracted_text = models.TextField(blank=True)
    skills = models.JSONField(default=list)  # list of skill strings
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Resume by {self.user.username} ({self.created_at.date()})"
