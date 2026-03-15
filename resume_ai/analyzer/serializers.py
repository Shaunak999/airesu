from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Resume


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password_confirm")

    def validate_username(self, value):
        if value and User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        email = validated_data.get("email") or ""
        user = User.objects.create_user(
            username=validated_data["username"],
            email=email,
            password=validated_data["password"],
        )
        return user


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ("id", "original_filename", "extracted_text", "skills", "created_at")
        read_only_fields = fields


class ResumeUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class JobMatchRequestSerializer(serializers.Serializer):
    job_description = serializers.CharField()


class MatchResultSerializer(serializers.Serializer):
    match_score = serializers.FloatField()
    skills_found = serializers.ListField(child=serializers.CharField())
    missing_skills = serializers.ListField(child=serializers.CharField())
    suggestions = serializers.ListField(child=serializers.CharField(), required=False)
