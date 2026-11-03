# Database initialization

The sample seed targets the provided `final_database.sql` schema. Run these
scripts in order against an empty MySQL database:

1. `final_database.sql`
2. `mysql/skill_taxonomy_seed.sql`
3. `mysql/sample_data_seed.sql`

The sample seed adds 50 employees, 10 HR users, 20 job roles, skills,
matching, bias-review, and audit records. It intentionally leaves
`EMPLOYEE_DOCUMENTS` empty so documents can be uploaded through the
application.

For SAP HANA, run:

1. `hana/schema.sql`
2. `hana/skill_taxonomy_seed.sql`
3. `hana/sample_data_seed.sql`

The HANA sample seed contains the same sample entities and uses HANA
timestamp and identifier syntax.
