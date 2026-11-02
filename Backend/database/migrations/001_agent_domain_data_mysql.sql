CREATE TABLE IF NOT EXISTS SKILL_TAXONOMY (
    SKILL_ID VARCHAR(80) PRIMARY KEY,
    CANONICAL_NAME VARCHAR(255) NOT NULL,
    CATEGORY VARCHAR(255) NOT NULL,
    IS_ACTIVE TINYINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS SKILL_TAXONOMY_ALIASES (
    SKILL_ID VARCHAR(80) NOT NULL,
    ALIAS VARCHAR(255) NOT NULL,
    PRIMARY KEY (SKILL_ID, ALIAS),
    FOREIGN KEY (SKILL_ID) REFERENCES SKILL_TAXONOMY(SKILL_ID)
);

CREATE TABLE IF NOT EXISTS MARKET_DEMAND (
    SKILL VARCHAR(255) PRIMARY KEY,
    DEMAND_LEVEL VARCHAR(40) NOT NULL,
    TREND VARCHAR(100) NOT NULL,
    OPEN_INTERNAL_ROLES INT NOT NULL DEFAULT 0,
    MARKET_NOTE VARCHAR(1000) NOT NULL,
    IS_ACTIVE TINYINT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS LEARNING_COURSES (
    COURSE_ID VARCHAR(100) PRIMARY KEY,
    TITLE VARCHAR(500) NOT NULL,
    TARGET_SKILL VARCHAR(255) NOT NULL,
    DURATION VARCHAR(100) NOT NULL,
    SAP_LEARNING_HUB_URL VARCHAR(1000) NOT NULL,
    IS_ACTIVE TINYINT NOT NULL DEFAULT 1
);

INSERT IGNORE INTO SKILL_TAXONOMY
    (SKILL_ID, CANONICAL_NAME, CATEGORY)
VALUES
    ('PYTHON', 'Python', 'Backend Engineering'),
    ('REACT', 'React.js', 'Frontend Engineering'),
    ('SQL', 'SQL & Relational Databases', 'Data Engineering'),
    ('DOCKER', 'Docker & Containerization', 'DevOps & Cloud'),
    ('REST_API', 'RESTful API Design', 'Software Architecture'),
    ('MACHINE_LEARNING', 'Machine Learning', 'AI & Data Science'),
    ('CLOUD_BTP', 'SAP BTP / Cloud Foundry', 'Cloud Platforms');

INSERT IGNORE INTO SKILL_TAXONOMY_ALIASES (SKILL_ID, ALIAS) VALUES
    ('PYTHON', 'python'), ('PYTHON', 'python3'), ('PYTHON', 'py'),
    ('PYTHON', 'fastapi'), ('PYTHON', 'flask'),
    ('REACT', 'react'), ('REACT', 'reactjs'), ('REACT', 'react.js'), ('REACT', 'jsx'),
    ('SQL', 'sql'), ('SQL', 'postgresql'), ('SQL', 'mysql'), ('SQL', 'hana'), ('SQL', 'sap hana'),
    ('DOCKER', 'docker'), ('DOCKER', 'containers'), ('DOCKER', 'containerization'),
    ('REST_API', 'rest'), ('REST_API', 'rest api'), ('REST_API', 'apis'), ('REST_API', 'microservices'),
    ('MACHINE_LEARNING', 'ml'), ('MACHINE_LEARNING', 'machine learning'), ('MACHINE_LEARNING', 'scikit-learn'), ('MACHINE_LEARNING', 'pandas'),
    ('CLOUD_BTP', 'btp'), ('CLOUD_BTP', 'sap btp'), ('CLOUD_BTP', 'cloud foundry'), ('CLOUD_BTP', 'cf');

INSERT IGNORE INTO MARKET_DEMAND
    (SKILL, DEMAND_LEVEL, TREND, OPEN_INTERNAL_ROLES, MARKET_NOTE)
VALUES
    ('Python', 'High', 'Rising (+18% YoY)', 6, 'Core requirement across backend, data engineering, and AI automation teams.'),
    ('Machine Learning', 'High', 'Surging (+32% YoY)', 4, 'High internal priority for BTP AI agent and predictive analytics initiatives.'),
    ('Data Analysis', 'High', 'Stable (+12% YoY)', 5, 'Strong demand across product engineering and business intelligence units.'),
    ('Pandas', 'Medium', 'Stable (+9% YoY)', 4, 'Frequently paired with Python for data pipeline and ETL roles.'),
    ('Communication', 'High', 'Rising (+15% YoY)', 8, 'Essential for cross-functional product and technical lead tracks.'),
    ('SAP BTP', 'High', 'Surging (+40% YoY)', 5, 'Key growth skill for enterprise cloud and generative AI integration.');

INSERT IGNORE INTO LEARNING_COURSES
    (COURSE_ID, TITLE, TARGET_SKILL, DURATION, SAP_LEARNING_HUB_URL)
VALUES
    ('SAP_BTP_101', 'SAP Business Technology Platform Essentials & AI Integration', 'SAP BTP', '4 hours', 'https://learning.sap.com/courses/btp-essentials-ai'),
    ('ML_ADV_202', 'Advanced Machine Learning Pipelines & Model Deployment', 'Machine Learning', '6 hours', 'https://learning.sap.com/courses/advanced-ml-pipelines'),
    ('CLOUD_FOUNDRY_301', 'Cloud Foundry and Docker Enterprise Microservices', 'Cloud Foundry', '5 hours', 'https://learning.sap.com/courses/cloud-foundry-deployments'),
    ('PYTHON_FASTAPI_01', 'Building Scalable Enterprise APIs with FastAPI', 'FastAPI', '3 hours', 'https://learning.sap.com/courses/fastapi-microservices');
