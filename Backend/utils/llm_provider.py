# llm_provider.py
import os
import json
from typing import Dict, Any, List

# Standard Skills Taxonomy for normalization
SKILLS_TAXONOMY: Dict[str, Dict[str, Any]] = {
    "PYTHON": {"canonical_name": "Python", "category": "Backend Engineering", "aliases": ["python", "python3", "py", "fastapi", "flask"]},
    "REACT": {"canonical_name": "React.js", "category": "Frontend Engineering", "aliases": ["react", "reactjs", "react.js", "jsx"]},
    "SQL": {"canonical_name": "SQL & Relational Databases", "category": "Data Engineering", "aliases": ["sql", "postgresql", "mysql", "hana", "sap hana"]},
    "DOCKER": {"canonical_name": "Docker & Containerization", "category": "DevOps & Cloud", "aliases": ["docker", "containers", "containerization"]},
    "REST_API": {"canonical_name": "RESTful API Design", "category": "Software Architecture", "aliases": ["rest", "rest api", "apis", "microservices"]},
    "MACHINE_LEARNING": {"canonical_name": "Machine Learning", "category": "AI & Data Science", "aliases": ["ml", "machine learning", "scikit-learn", "pandas"]},
    "CLOUD_BTP": {"canonical_name": "SAP BTP / Cloud Foundry", "category": "Cloud Platforms", "aliases": ["btp", "sap btp", "cloud foundry", "cf"]}
}

# Synthetic profile for the primary persona, Ananya Rao
ANANYA_SYNTHETIC_PROFILE = (
    "Ananya Rao — Software Engineer (5 years experience, returning from an 18-month career break). "
    "Previously led backend microservices development using Python and FastAPI for an enterprise supply chain portal. "
    "Designed and optimized PostgreSQL database schemas and built interactive analytics views in React. "
    "Containerized services using Docker for deployment on Cloud Foundry. "
    "During her career break, she completed a practical certification in Machine Learning using pandas and scikit-learn."
)

def call_llm_extract(profile_text: str) -> Dict[str, Any]:
    """
    Single model-call function. Attempts SAP Generative AI Hub first, 
    and automatically falls back to a deterministic local extractor if offline or unconfigured.
    """
    sap_aicore_configured = bool(os.getenv("AICORE_AUTH_URL") and os.getenv("AICORE_CLIENT_ID"))

    if sap_aicore_configured:
        try:
            # SAP Generative AI Hub integration
            from gen_ai_hub.proxy.native.openai import chat
            
            system_prompt = (
                "You are an expert HR Skills Discovery unit. Extract technical skills from the user's profile. "
                "For every skill, provide an exact verbatim 'evidence' snippet from the text. "
                "Return ONLY valid JSON in the format: "
                '{"skills": [{"raw_skill": "string", "evidence": "string"}]}'
            )
            
            response = chat.completions.create(
                model_name=os.getenv("SAP_LLM_MODEL", "gpt-4o"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": profile_text}
                ],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            parsed = json.loads(response.choices[0].message.content)
            return {
                "skills": parsed.get("skills", []),
                "mode": "SAP_GENERATIVE_AI_HUB",
                "is_fallback": False
            }
        except Exception as e:
            print(f"[Warning] SAP Generative AI Hub call failed ({e}). Switching to local fallback.")

    # Offline / Local Fallback Mode (Deterministic keyword & sentence matching)
    extracted: List[Dict[str, str]] = []
    sentences = [s.strip() for s in profile_text.replace("\n", " ").split(".") if s.strip()]
    
    seen_canonical = set()
    for code, meta in SKILLS_TAXONOMY.items():
        for alias in meta["aliases"]:
            for sentence in sentences:
                # Match whole words case-insensitively
                padded_sentence = f" {sentence.lower()} ".replace(",", " ").replace(".", " ")
                if f" {alias.lower()} " in padded_sentence and code not in seen_canonical:
                    extracted.append({
                        "raw_skill": alias,
                        "evidence": f"{sentence}."
                    })
                    seen_canonical.add(code)
                    break

    return {
        "skills": extracted,
        "mode": "LOCAL_OFFLINE_FALLBACK (Simulated LLM)",
        "is_fallback": True
    }