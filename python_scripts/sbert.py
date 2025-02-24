from sentence_transformers import SentenceTransformer, util
import json
import base64
import sys
from extract_data import extract_resume_data, extract_job_data
from extract_details import extract_resume_details, extract_job_details
from utility import get_resume_info, calculate_skill_match, get_job_description, convert_to_lowercase

    
if __name__ == "__main__":
    model = SentenceTransformer("all-MiniLM-L6-v2")

    try:
        input_data = json.loads(sys.stdin.read())
        pdf_bytes = base64.b64decode(input_data["resume_pdf"])
        resume_data = get_resume_info(pdf_bytes)
        job_data = get_job_description(input_data["job_desc"])

        if not resume_data:
            raise ValueError("Failed to extract text from resume")
        
        resume_text = extract_resume_data(resume_data)
        resume_data = extract_resume_details(resume_text) 
        resume_data = convert_to_lowercase(resume_data)

        job_text = extract_job_data(job_data)
        job_data = extract_job_details(job_text)
        
        resume_technical = resume_data.get("technical_skills", [])
        resume_soft = resume_data.get("soft_skills", [])

        job_technical = job_data.get("job_technical_skills", [])
        job_soft = job_data.get("job_soft_skills", [])

        def encode_text(text_list):
            return model.encode(" ".join(text_list) if text_list else "placeholder", convert_to_tensor=True)

        resume_tech_emb, resume_soft_emb = encode_text(resume_technical), encode_text(resume_soft)
        job_tech_emb, job_soft_emb = encode_text(job_technical), encode_text(job_soft)

        tech_match = 0.0 if not resume_technical else (
            1.0 if not job_technical else util.pytorch_cos_sim(resume_tech_emb, job_tech_emb).item()
        )

        soft_match = 1.0 if not job_soft else (
            0.0 if not resume_soft else util.pytorch_cos_sim(resume_soft_emb, job_soft_emb).item()
        )
        
        skill_match_score = (tech_match * 0.9) + (soft_match * 0.1)

        if len(resume_technical) <= 3:
            skill_match_score *= 0.2


        skills_data = calculate_skill_match(resume_technical, job_technical)

        total_required = len(skills_data["matched_skills"]) + len(skills_data["missing_skills"])

        if total_required > 0:
            matched_ratio = len(skills_data["matched_skills"]) / total_required
            missing_ratio = len(skills_data["missing_skills"]) / total_required
            direct_match_score = (matched_ratio * 0.6) - (missing_ratio * 0.4)
            direct_match_score = max(0, min(direct_match_score, 1))
        else:
            direct_match_score = 0

        required_exp = int(job_data.get("experience_required", 0))
        resume_exp = resume_data.get("experience_years", 0)

        experience_score = 1.0 if required_exp == 0 or resume_exp >= required_exp else resume_exp / required_exp

        contact_details = resume_data.get("contact_details", {})
        required_fields = ["name", "email", "phone_number"]

        contact_score = sum(1/3 for field in required_fields if contact_details.get(field))
        section_score = min(len(resume_data.get("resume_sections", [])) / 5, 1.0)

        formatting_score = (contact_score * 0.4) + (section_score * 0.6)

        ats_score = (skill_match_score * 0.65) + (direct_match_score * 0.05) + (experience_score * .2) + (formatting_score * 0.1)

        response = {
            "ats_score": round(ats_score * 100, 2),
            "details": {
                "contact_details": resume_data["contact_details"],
                "education": resume_data["highest_education"],
                "matched_skills": skills_data["matched_skills"],
                "missing_skills": skills_data["missing_skills"],
                "match_percentage": skills_data["match_percentage"],
                "resume_data": resume_data,
                "job_data": job_data,
                "skill_match_score": skill_match_score,
                "direct_match_score": direct_match_score,
                "experience_score": experience_score,
                "formatting_score": formatting_score

            }
        }

        print(json.dumps(response))
        sys.stdout.flush() 

    except Exception as e:
        error_response = {"error": str(e)}
        print(json.dumps(error_response))
        sys.stdout.flush()