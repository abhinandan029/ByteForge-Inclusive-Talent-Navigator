CREATE TABLE SKILL_TAXONOMY (
    SKILL_ID NVARCHAR(80) PRIMARY KEY,
    CANONICAL_NAME NVARCHAR(255) NOT NULL,
    CATEGORY NVARCHAR(255) NOT NULL,
    IS_ACTIVE INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE SKILL_TAXONOMY_ALIASES (
    SKILL_ID NVARCHAR(80) NOT NULL,
    ALIAS NVARCHAR(255) NOT NULL,
    PRIMARY KEY (SKILL_ID, ALIAS),
    FOREIGN KEY (SKILL_ID) REFERENCES SKILL_TAXONOMY(SKILL_ID)
);

CREATE TABLE MARKET_DEMAND (
    SKILL NVARCHAR(255) PRIMARY KEY,
    DEMAND_LEVEL NVARCHAR(40) NOT NULL,
    TREND NVARCHAR(100) NOT NULL,
    OPEN_INTERNAL_ROLES INTEGER NOT NULL DEFAULT 0,
    MARKET_NOTE NVARCHAR(1000) NOT NULL,
    IS_ACTIVE INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE LEARNING_COURSES (
    COURSE_ID NVARCHAR(100) PRIMARY KEY,
    TITLE NVARCHAR(500) NOT NULL,
    TARGET_SKILL NVARCHAR(255) NOT NULL,
    DURATION NVARCHAR(100) NOT NULL,
    SAP_LEARNING_HUB_URL NVARCHAR(1000) NOT NULL,
    IS_ACTIVE INTEGER NOT NULL DEFAULT 1
);

INSERT INTO SKILL_TAXONOMY VALUES
    ('PYTHON', 'Python', 'Backend Engineering', 1),
    ('REACT', 'React.js', 'Frontend Engineering', 1),
    ('SQL', 'SQL & Relational Databases', 'Data Engineering', 1),
    ('DOCKER', 'Docker & Containerization', 'DevOps & Cloud', 1),
    ('REST_API', 'RESTful API Design', 'Software Architecture', 1),
    ('MACHINE_LEARNING', 'Machine Learning', 'AI & Data Science', 1),
    ('CLOUD_BTP', 'SAP BTP / Cloud Foundry', 'Cloud Platforms', 1);

INSERT INTO SKILL_TAXONOMY_ALIASES VALUES
    ('PYTHON', 'python'), ('PYTHON', 'python3'), ('PYTHON', 'py'),
    ('PYTHON', 'fastapi'), ('PYTHON', 'flask'),
    ('REACT', 'react'), ('REACT', 'reactjs'), ('REACT', 'react.js'), ('REACT', 'jsx'),
    ('SQL', 'sql'), ('SQL', 'postgresql'), ('SQL', 'mysql'), ('SQL', 'hana'), ('SQL', 'sap hana'),
    ('DOCKER', 'docker'), ('DOCKER', 'containers'), ('DOCKER', 'containerization'),
    ('REST_API', 'rest'), ('REST_API', 'rest api'), ('REST_API', 'apis'), ('REST_API', 'microservices'),
    ('MACHINE_LEARNING', 'ml'), ('MACHINE_LEARNING', 'machine learning'), ('MACHINE_LEARNING', 'scikit-learn'), ('MACHINE_LEARNING', 'pandas'),
    ('CLOUD_BTP', 'btp'), ('CLOUD_BTP', 'sap btp'), ('CLOUD_BTP', 'cloud foundry'), ('CLOUD_BTP', 'cf');

INSERT INTO MARKET_DEMAND VALUES
    ('Python', 'High', 'Rising (+18% YoY)', 6, 'Core requirement across backend, data engineering, and AI automation teams.', 1),
    ('Machine Learning', 'High', 'Surging (+32% YoY)', 4, 'High internal priority for BTP AI agent and predictive analytics initiatives.', 1),
    ('Data Analysis', 'High', 'Stable (+12% YoY)', 5, 'Strong demand across product engineering and business intelligence units.', 1),
    ('Pandas', 'Medium', 'Stable (+9% YoY)', 4, 'Frequently paired with Python for data pipeline and ETL roles.', 1),
    ('Communication', 'High', 'Rising (+15% YoY)', 8, 'Essential for cross-functional product and technical lead tracks.', 1),
    ('SAP BTP', 'High', 'Surging (+40% YoY)', 5, 'Key growth skill for enterprise cloud and generative AI integration.', 1);

INSERT INTO LEARNING_COURSES VALUES
    ('SAP_BTP_101', 'SAP Business Technology Platform Essentials & AI Integration', 'SAP BTP', '4 hours', 'https://learning.sap.com/courses/btp-essentials-ai', 1),
    ('ML_ADV_202', 'Advanced Machine Learning Pipelines & Model Deployment', 'Machine Learning', '6 hours', 'https://learning.sap.com/courses/advanced-ml-pipelines', 1),
    ('CLOUD_FOUNDRY_301', 'Cloud Foundry and Docker Enterprise Microservices', 'Cloud Foundry', '5 hours', 'https://learning.sap.com/courses/cloud-foundry-deployments', 1),
    ('PYTHON_FASTAPI_01', 'Building Scalable Enterprise APIs with FastAPI', 'FastAPI', '3 hours', 'https://learning.sap.com/courses/fastapi-microservices', 1);
