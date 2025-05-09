
import re
import json


def extract_resume_details(response_text):
    match = re.search(r'{[\s\S]+}', response_text.strip())

    if match:
        json_text = match.group(0)
        try:
            data = json.loads(json_text)
            resume_data = {
        "technical_skills": data.get("technical_skills", []),
        "soft_skills": data.get("soft_skills", []),
        "experience_years": data.get("experience_years", 0),
        "highest_education": data.get("highest_education", "") or "",  
        "contact_details": {
        "name": data.get("contact_details", {}).get("name", "") or "",
        "email": data.get("contact_details", {}).get("email", "") or "",
        "phone_number": data.get("contact_details", {}).get("phone_number", "") or "",
        }
    }
            return  resume_data

        except json.JSONDecodeError as e:
            print("Error: Extracted JSON is invalid.", e)
    else:
        print("Error: No JSON found in the response.")


def extract_job_details(response_text):
    match = re.search(r'{[\s\S]+}', response_text)

    if match:
        json_text = match.group(0) 
        
        try:
            data = json.loads(json_text)
            
            job_data = {
                "job_technical_skills": data.get("job_technical_skills", []),
                "job_soft_skills": data.get("job_soft_skills", []),
                "education_required": data.get("education_required", ""),
                "experience_required": data.get("experience_required", 0)
                }
            return job_data

        except json.JSONDecodeError as e:
            print("Error: Extracted JSON is invalid.", e)
    else:
        print("Error: No JSON found in the response.")