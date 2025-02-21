import json
import fitz
import re
import sys
import base64
from datetime import datetime
from constant import skills_list
from sentence_transformers import SentenceTransformer, util


missing_sections = []

def get_job_description(job_desc):
   return {
        "job_title": job_desc.get("job_title", "").lower(),
        "experience_required": job_desc.get("experience_required", {}).get("minimum_years", 0),
        "education_required": [edu.lower() for edu in job_desc.get("education_required", [])],
        "skills_required": [skill.lower() for skill in job_desc.get("skills_required", [])],
        "skills_preferred": [skill.lower() for skill in job_desc.get("skills_preferred", [])],
        "responsibilities": [resp.lower() for resp in job_desc.get("responsibilities", [])]
    }

# extract cgpa
def extract_education(resume_text):

    education_section_match = re.search(r"(?i)education[\s:]*([\s\S]+?)(?=\n(?:skills|experience|projects|certifications|internship|achievements|$))", resume_text)
    education_section = education_section_match.group(1).strip() if education_section_match else ""
    cleaned_text = re.sub(r'\s+', ' ', education_section).strip()
    cgpa = re.search(r"\d+\.\d+", cleaned_text)
    return float(cgpa.group()) if cgpa else None
 

# extract skills from project 
def extract_project_skills(resume_text):
    project_section_match = re.search(r"(?mi)^projects\s*[\s:]*([\s\S]+?)(?=\n(?:experience|education|skills|certifications|achievements|$))", resume_text)
    if not project_section_match:
        missing_sections.append("project_section")
        return []
    project_text = project_section_match.group(0).strip() if project_section_match else ""
    comma_skills = re.findall(r"([A-Za-z0-9+\-#/. ]+)(?:,|\||$)", project_text)
    filtered_skills = [skill.strip() for skill in comma_skills if len(skill.split()) <= 2]
    return filtered_skills   
    


# extract the skills from skills section
def extract_skills(resume_text):
    skills_section_match = re.search(r"(?mi)^\s*(skills|technical skills|technologies)\s*\n([\s\S]+?)(?=\n\s*(education|experience|projects|certifications|achievements|extracurricular|$))", resume_text)
    if not skills_section_match:
        missing_sections.append("skills_section")
        return []
    skills_text = skills_section_match.group(0).strip() if skills_section_match else ""
    skills_text = re.sub(r'^[•\-\*]\s*', '', skills_text, flags=re.MULTILINE)
    skills = [word.strip() for line in skills_text.split("\n") if (words := line.split(":", 1)[-1]) 
              for word in re.split(r",|\|", words) if word.strip()]
    return skills


# extract skills from experience: 
def normalize_month(date_str):
    return date_str.replace("sept", "sep")

def years_of_experience(experience_text):
    date_pattern = r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+\d{4}\b"
    dates = re.findall(date_pattern, experience_text)
    if not dates:
        return 0
    normalized_dates = [normalize_month(date) for date in dates]    
    if len(normalized_dates)%2:
        normalized_dates.append(datetime.now().strftime("%b %Y"))   
    date_objects = [datetime.strptime(date, "%b %Y") for date in normalized_dates]  
    min_date = min(date_objects)  
    max_date = max(date_objects) 
    experience_months = (max_date.year - min_date.year) * 12 + max_date.month - min_date.month
    if experience_months < 12:
        return 0
    experience_years = experience_months // 12
    experience_remaining_months = experience_months % 12
    return experience_years + (experience_remaining_months / 12)


def extract_exp_skills(experience_text):
    found_skills = []
    for skill in skills_list:
        if re.search(r'\b' + re.escape(skill) + r'\b', experience_text):  # Ensure whole word matching
            found_skills.append(skill)
    return found_skills if found_skills else []




    
def experience_info(resume_text):
    experience_section_match = re.search(r"(?mi)^\s*(internship|internships|experience|work experience)\s*\n([\s\S]+?)(?=\n\s*(education|skills|technical skills|projects|certifications|achievements|extracurricular|publications|$))", resume_text)
    if experience_section_match is None:
        missing_sections.append("experience")
        return {
                    "experience_years": 0,
                    "experience_skills":[]
               }
    experience_text = experience_section_match.group(0).strip() if experience_section_match else ""   
    return  {
               "experience_years": years_of_experience(experience_text),
               "experience_skills": extract_exp_skills(experience_text)
    }


   
def extract_contact_details(resume_text):
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", resume_text)
    email = email_match.group() if email_match else None
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}", resume_text)
    phone_number = phone_match.group() if phone_match else None
    lines = resume_text.split("\n")
    name = None
    if lines:
        first_line = lines[0].strip()
        if re.match(r"^[A-Z][a-z]+(\s[A-Z][a-z]+)+$", first_line):  # Simple name pattern
            name = first_line

    return {
        "name": name,
        "email": email,
        "phone_number": phone_number
    }

    

def get_resume_info(pdf_bytes):
    resume_text = ""
    pdf = fitz.open(stream=pdf_bytes, filetype="pdf")  # Open PDF from memory
    for page in pdf:
        resume_text += page.get_text("text") + "\n"  # Extract text from each page
    resume_text = resume_text.lower()
    return {
        "contact_details": extract_contact_details(resume_text),
        "education": extract_education(resume_text),
        "skills": extract_skills(resume_text),
        "project_skills": extract_project_skills(resume_text),
        "experience_section": experience_info(resume_text)
    }


def calculate_skill_match(resume_skills, project_skills, experience_skills, job_skills):
    """Calculates the percentage of skills matched between job and resume."""

    if not job_skills:  # Handle case where job_skills is empty
        return {"matched_skills": [], "missing_skills": [], "match_percentage": 0.0}

    # Combine all resume-related skills into a single set (for fast lookup)
    all_resume_skills = set(resume_skills) | set(project_skills) | set(experience_skills)

    # Convert job skills to a set
    job_skills_set = set(job_skills)

    # Find matching and missing skills
    matched_skills = job_skills_set & all_resume_skills  # Intersection
    missing_skills = job_skills_set - all_resume_skills  # Difference

    # Calculate match percentage
    match_percentage = round((len(matched_skills) / len(job_skills_set)) * 100, 2)

    return {
        "matched_skills": list(matched_skills),
        "missing_skills": list(missing_skills),
        "match_percentage": match_percentage
    }



if __name__ == "__main__":
    
    # Initialize Sentence-BERT model
    model = SentenceTransformer('all-MiniLM-L6-v2')

    try:
        input_data = json.loads(sys.stdin.read())
        pdf_bytes = base64.b64decode(input_data["resume_pdf"])
        resume_data = get_resume_info(pdf_bytes)
        job = input_data["job_desc"]
        job_data = get_job_description(job)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
   
    resume_skills = list(set(resume_data['skills']))
    project_skills = list(set(resume_data['project_skills']))
    experience_skills = list(set(resume_data['experience_section']['experience_skills']))
    job_skills = list(set(job_data['skills_required'] + job_data['skills_preferred']))


    # Encode only if the section is not empty, else use a placeholder
    resume_embedding = model.encode(" ".join(resume_skills) if resume_skills else "placeholder", convert_to_tensor=True)
    project_embedding = model.encode(" ".join(project_skills) if project_skills else "placeholder", convert_to_tensor=True)
    experience_embedding = model.encode(" ".join(experience_skills) if experience_skills else "placeholder", convert_to_tensor=True)
    job_embedding = model.encode(" ".join(job_skills) if job_skills else "placeholder", convert_to_tensor=True)

    # Compute skill match scores
    resume_match = util.pytorch_cos_sim(resume_embedding, job_embedding).item() * 0.4
    project_match = util.pytorch_cos_sim(project_embedding, job_embedding).item() * 0.3
    experience_match = util.pytorch_cos_sim(experience_embedding, job_embedding).item() * 0.2
   

    # Compute experience score
    required_experience = int(job_data['experience_required']['$numberInt'])
    experience_score = (1 if required_experience == 0 else min(resume_data['experience_section']['experience_years']/ required_experience, 1.0)) * 0.1
   
    # Normalize and calculate final weighted ATS score
    ats_score = (resume_match + project_match + experience_match + experience_score) / (0.4 + 0.3 + 0.2 + 0.1)
    skills_data = calculate_skill_match(resume_skills, project_skills, experience_skills, job_skills)

    response = {
        "ats_score": round(ats_score * 100, 2),
        "details": {
            "contact_details": resume_data['contact_details'],
            "education": resume_data['education'],
            "matched_skills": skills_data['matched_skills'],
            "missing_skills": skills_data['missing_skills'],
            "match_percentage": skills_data['match_percentage'],
            "missing_sections": missing_sections
        }
    }

    # Output only the JSON response
    print(json.dumps(response))