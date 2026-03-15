"""
Resume parsing and skill matching logic.
"""
import pdfplumber
from .skills_list import SKILLS_LIST


def extract_text_from_pdf(file) -> str:
    """Extract text from uploaded PDF file."""
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception:
        return ""
    return text.strip()


def extract_skills(text: str) -> list[str]:
    """Find skills from text (case-insensitive match)."""
    if not text:
        return []
    text_lower = text.lower()
    found = []
    for skill in SKILLS_LIST:
        if skill.lower() in text_lower:
            found.append(skill)
    return list(dict.fromkeys(found))  # preserve order, no duplicates


def extract_skills_from_job_description(job_text: str) -> list[str]:
    """Extract required skills mentioned in job description."""
    return extract_skills(job_text)


def match_score(resume_skills: list[str], job_skills: list[str]) -> float:
    """Match score as percentage: resume skills that appear in job requirements."""
    if not job_skills:
        return 100.0
    resume_set = set(s.lower() for s in resume_skills)
    job_set = set(s.lower() for s in job_skills)
    matches = resume_set & job_set
    return round(len(matches) / len(job_set) * 100, 1)


def missing_skills(resume_skills: list[str], job_skills: list[str]) -> list[str]:
    """Skills in job description that are not in resume."""
    resume_set = set(s.lower() for s in resume_skills)
    return [s for s in job_skills if s.lower() not in resume_set]
