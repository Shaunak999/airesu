from django.contrib import admin
from .models import Resume


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("user", "original_filename", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username", "extracted_text")
