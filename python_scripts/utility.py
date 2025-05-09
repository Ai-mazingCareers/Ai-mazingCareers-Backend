import fitz


def get_resume_info(pdf_bytes):
    resume_text = ""
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf") 
    for page in pdf:
        resume_text += page.get_text("text") + "\n"  
    return resume_text.lower()


def calculate_skill_match(resume_skills, job_skills):
    matched_skills = list(set(resume_skills) & set(job_skills))
    missing_skills = list(set(job_skills) - set(resume_skills))
    match_percentage = (len(matched_skills) / len(job_skills)) * 100 if job_skills else 0
    return {"matched_skills": matched_skills, "missing_skills": missing_skills, "match_percentage": round(match_percentage, 2)}


def get_job_description(job_desc):
   return {
        "job_title": job_desc.get("job_title", "").lower(),
        "experience_required": job_desc.get("experience_required", {}).get("minimum_years", 0),
        "education_required": [edu.lower() for edu in job_desc.get("education_required", [])],
        "skills_required": [skill.lower() for skill in job_desc.get("skills_required", [])],
        "skills_preferred": [skill.lower() for skill in job_desc.get("skills_preferred", [])],
        "responsibilities": job_desc.get("responsibilities", "").lower()
    }

def convert_to_lowercase(data):
    if isinstance(data, dict):
        return {key.lower(): convert_to_lowercase(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_to_lowercase(item) for item in data]
    elif isinstance(data, str):
        return data.lower()
    else:
        return data
