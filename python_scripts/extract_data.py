from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env") 

api_key = os.getenv("GROQ_API_KEY")

client = Groq(api_key=api_key)


def extract_resume_data(resume_text):
    try:
        response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "system",
                "content": """You will receive a resume text. Your job is to extract and return structured JSON output following this format(there should be no extra text):
                    {  
                        "technical_skills": [string],  
                        "soft_skills": [string],  
                        "experience_years": int,   
                        "highest_education": string, 
                        "contact_details": {  
                            "name": string,  
                            "email": string,  
                            "phone_number": string  
                        },  
                        "resume_sections": [string]
                    }
                    
                Guidelines:
                - Extract each and every technical(basic to advanced=) and soft skills from all sections of the resume.
                - Extract experience only from the experience or internship section.
                - If data is missing, return null, [], or "" instead of omitting fields.
                - Ensure JSON validity with no extra text or explanations.
                - Maintain consistent casing and spacing in keys and values.
                 """
            },
            {
                "role": "user",
                "content": f"Resume Text:\n{resume_text}\n\n"
            },
        ],
        temperature=0,
        max_completion_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
        seed=40,
    )
        return (response.choices[0].message.content)

    except Exception as e:
        return {"error1": str(e)}


def extract_job_data(job_description):
    try:
        response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
                {
                "role": "system",
                "content": """You will receive a job description in json format. Your job is to extract and return structured JSON output following this format(there should be no extra text):
                { "job_technical_skills": [string],  
                "job_soft_skills": [string],  
                "education_required": string,  
                "experience_required": int 
                }  """
                },
            {
                "role": "user",
                "content": json.dumps(job_description)
            },
        ],
        temperature=0,
        max_completion_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
        seed=40,
        )
        return (response.choices[0].message.content)

    except Exception as e:
        return {"error2": str(e)}