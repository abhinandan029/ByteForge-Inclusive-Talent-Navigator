from app.models.hr_job_model import (
    get_all_job_roles,
    get_job_role_by_id,
    create_job_role,
    update_job_role,
    update_job_role_status,
    add_required_skills,
    get_existing_skill_names,
    get_hr_audit_logs
)


def list_job_roles():
    return get_all_job_roles()


def get_job_role(job_role_id: str):
    return get_job_role_by_id(job_role_id)


def get_hr_activity(hr_id: str):
    return get_hr_audit_logs(hr_id)


def create_hr_job_role(hr_id: str, payload: dict):

    experience_min = payload.get("experience_min")
    experience_max = payload.get("experience_max")

    if (
        experience_min is not None
        and experience_max is not None
        and experience_min > experience_max
    ):
        raise ValueError(
            "Minimum experience cannot exceed maximum experience"
        )

    validate_unique_skills(payload.get("required_skills", []))

    job_role_id = create_job_role(
        hr_id=hr_id,
        role_data=payload,
        skills=payload.get("required_skills", [])
    )

    return get_job_role_by_id(job_role_id)


def edit_job_role(job_role_id: str, payload: dict, hr_id: str):

    experience_min = payload.get("experience_min")
    experience_max = payload.get("experience_max")

    if (
        experience_min is not None
        and experience_max is not None
        and experience_min > experience_max
    ):
        raise ValueError(
            "Minimum experience cannot exceed maximum experience"
        )

    result = update_job_role(
        job_role_id,
        payload,
        hr_id
    )

    if result != "updated":
        return result if result in ("not_found", "predefined") else None

    return get_job_role_by_id(job_role_id)


def change_job_role_status(job_role_id: str, new_status: str, hr_id: str):

    return update_job_role_status(
        job_role_id,
        new_status,
        hr_id
    )


def add_skills_to_job_role(
    job_role_id: str,
    skills: list[dict],
    hr_id: str
):
    validate_unique_skills(skills)

    existing_skills = get_existing_skill_names(job_role_id)

    for skill in skills:
        name = skill["skill_name"].strip().casefold()

        if name in existing_skills:
            raise ValueError(
                f"Skill '{skill['skill_name']}' already exists in this job role"
            )

    success = add_required_skills(
        job_role_id,
        skills,
        hr_id
    )

    if not success:
        return None

    return get_job_role_by_id(job_role_id)


def validate_unique_skills(skills: list[dict]):
        normalized_names = [
            skill["skill_name"].strip().casefold()
            for skill in skills
        ]

        if len(normalized_names) != len(set(normalized_names)):
            raise ValueError(
                "Duplicate skills are not allowed in the same request"
            )