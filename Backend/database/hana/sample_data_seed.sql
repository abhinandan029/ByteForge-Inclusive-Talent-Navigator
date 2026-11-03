-- ByteForge Inclusive Talent Navigator SAP HANA sample data.
-- Prerequisites: run schema.sql, then run skill_taxonomy_seed.sql.
-- This seed is intended for an empty database and is safe to run once.
-- EMPLOYEE_DOCUMENTS is intentionally left empty; upload documents through the application.
-- The seed contains 50 employees, 10 HR users, and 20 job roles.
-- Sample login passwords: Employee@123 for employees and HrPass@123 for HR users.



INSERT INTO EMPLOYEES
(
    EMPLOYEE_ID,
    FULL_NAME,
    CURRENT_ROLE,
    GRADE,
    YEARS_EXPERIENCE,
    HAS_CAREER_BREAK,
    PROFILE_TEXT,
    STATUS,
    IS_CONFIRMED,
    READY_FOR_MATCHING,
    PASSWORD_HASH,
    MUST_CHANGE_PASSWORD
)
VALUES

('EMP001','Arjun Sharma','Software Engineer','G5',3,0,'Python, Java, React, FastAPI, MySQL, REST API development and backend application development. Experienced in developing scalable web applications.','confirmed',1,1,
'$2b$12$lmyNduYEcK35YeQnr2907evzU0ePSE3bsLgp/6nZSHKAYQrsZbcd2',1),

('EMP002','Priya Reddy','Data Analyst','G5',2,0,'Python, SQL, Excel, Power BI, Tableau, Pandas and NumPy. Experienced in data cleaning, visualization and business reporting.','confirmed',1,1,
'$2b$12$NbttFQ0e4o0ZCV11yspTNu50TDm1mCh0UEfnphAx0p3YjZ7VkUZi2',1),

('EMP003','Rahul Kumar','Senior Software Engineer','G7',7,0,'Java, Spring Boot, Microservices, Docker, Kubernetes, PostgreSQL and AWS. Experienced in designing enterprise backend systems.','confirmed',1,1,
'$2b$12$sjmOcFln2WhwLI6YUmun8u673/ztUQ2A8K7gQX2KTR4ghM9SQNXTK',1),

('EMP004','Sneha Patel','Machine Learning Engineer','G6',4,0,'Python, TensorFlow, PyTorch, Scikit-learn, NLP, Computer Vision and Deep Learning. Experienced in building predictive machine learning models.','confirmed',1,1,
'$2b$12$2F3tEg2BkKS1lAnKDh8KAOmpbrNYQcFhEly8temhw0rXEB4AVHlqy',1),

('EMP005','Vikram Singh','Cloud Engineer','G6',5,0,'AWS, Azure, Docker, Kubernetes, Terraform, Linux and CI/CD pipelines. Experienced in cloud infrastructure management.','confirmed',1,1,
'$2b$12$1XH.mhkmoeDpp6F6G/3hjetKw8/q2Q/5VrGLpiWBVtWsrfzl6hYtq',1),

('EMP006','Ananya Rao','Frontend Developer','G4',1,0,'HTML, CSS, JavaScript, React, TypeScript and responsive web development. Experienced in building user interfaces.','confirmed',1,1,
'$2b$12$baVYrhIlMNU7u.Y5uIawquTF1/6ZHO9TcZb94jpr6I37gU2JK.ncC',1),

('EMP007','Karthik Gowda','Database Administrator','G7',8,0,'MySQL, PostgreSQL, Oracle, SQL Server, database optimization, backup and recovery. Experienced in enterprise database management.','confirmed',1,1,
'$2b$12$s/ybmGJbE.VeNTkdVN52S.T7x4QRVtbSfBddiN.TyYKXxkrUYyvDa',1),

('EMP008','Meera Nair','Business Analyst','G5',3,0,'Business analysis, SQL, Excel, Power BI, requirement gathering, stakeholder management and Agile methodologies.','confirmed',1,1,
'$2b$12$rBBfkvOgI5lyPahyVh.VhesLSZ3cW.hs.mAzT9nqfZTFfC74vOBlS',1),

('EMP009','Rohit Verma','DevOps Engineer','G6',4,0,'Jenkins, Docker, Kubernetes, Git, GitHub Actions, Linux, AWS and CI/CD automation.','confirmed',1,1,
'$2b$12$9p34hdIsqCtw4S0rrLibOON9zLMwveyYYkTSE1hZxFNFp3sd10Oxm',1),

('EMP010','Divya Shetty','HR Analyst','G4',2,0,'HR analytics, Excel, Power BI, recruitment analytics, employee engagement and workforce planning.','confirmed',1,1,
'$2b$12$nEr2hSTay78TOwNA7ww7nOFJ77PyO8Qvjp5x8j/kD3y/q3J9aSnw6',1),

('EMP011','Amit Kulkarni','Software Developer','G5',3,0,'C++, Java, Python, Data Structures, Algorithms, Git and software development. Experienced in application development.','confirmed',1,1,
'$2b$12$UuLeI04w.I6Sr6RXElkwa.oeY9MoCpkrEl4lhIE1a2N6MeWvL4Heu',1),

('EMP012','Pooja Desai','Data Scientist','G7',6,0,'Python, R, Machine Learning, Statistics, SQL, Scikit-learn, TensorFlow and predictive analytics.','confirmed',1,1,
'$2b$12$EmA1vRElOsYDyII.1YSZLu3z4LSSWEFEXBHQnZnb2GNG2PovJ/PuK',1),

('EMP013','Suresh Babu','Network Engineer','G6',5,0,'Computer networking, Cisco, Routing, Switching, Network Security, TCP/IP and Firewall configuration.','confirmed',1,1,
'$2b$12$Kw85XGen4885zScRws5QEeuLsqsS0g/wjZHQ/BIVnBOg/RLHw/FEq',1),

('EMP014','Nisha Menon','UI UX Designer','G5',3,0,'Figma, Adobe XD, Photoshop, Wireframing, Prototyping, User Research and Design Systems.','confirmed',1,1,
'$2b$12$aQu5tMvuXYTjlg5xbUkxJ.oBcUBFkXEFDBRCqlWfRKnzzNXvyOugC',1),

('EMP015','Manoj Kumar','Cybersecurity Analyst','G6',5,0,'Network Security, Ethical Hacking, SIEM, Vulnerability Assessment, Linux and Incident Response.','confirmed',1,1,
'$2b$12$vJd8yNKs4xl/URmPg6B7RuxqRdPNZ4Ii51Ee2uFlFbhvn1IshbAJC',1),

('EMP016','Aishwarya Rao','Software Engineer','G5',2,0,'Python, Django, REST APIs, PostgreSQL, JavaScript and Git. Experienced in backend development.','confirmed',1,1,
'$2b$12$bzI822veo/VeY.Uh13P8/uMLWAm/pt0yqD2VeWg0Ggc27uzJig3QG',1),

('EMP017','Deepak Hegde','Project Manager','G8',10,0,'Project Management, Agile, Scrum, Jira, Risk Management, Budget Planning and Team Leadership.','confirmed',1,1,
'$2b$12$iBpew.sdkkoWzMdhRYm6eOs15H2Z9NyneI7JDPcCNc5oqmSd2RpAi',1),

('EMP018','Kavya Iyer','Data Engineer','G6',4,0,'Python, SQL, Apache Spark, Airflow, ETL, AWS, Data Pipelines and Snowflake.','confirmed',1,1,
'$2b$12$q4Ry09xNjSw56Zlaz6vcfOFXdBR1VcHBFVqfgETsQQpxMz55HwZU.',1),

('EMP019','Naveen Raj','QA Engineer','G5',3,0,'Manual Testing, Selenium, Python, Java, API Testing, JUnit and Automation Testing.','confirmed',1,1,
'$2b$12$IvfhfBAtbwH5KiOpFwsK9O.GF0vmP1WAWqUikDDcLI9gz16I7861a',1),

('EMP020','Swathi Prasad','Cloud Architect','G9',12,0,'AWS, Azure, Cloud Architecture, Kubernetes, Microservices, Terraform and Enterprise Infrastructure.','confirmed',1,1,
'$2b$12$36HF2ucL7AKzhePDceR1wOdDzLVtfdGu6cwW5ZaIgyKpJ8ghp0FSS',1),

('EMP021','Varun Shetty','Mobile App Developer','G5',3,0,'Java, Kotlin, Android Studio, Firebase, REST APIs and Mobile Application Development.','confirmed',1,1,
'$2b$12$D8zkHmqvYvCcbY0RbcHWi.xLCpQupbYCYn/gwfhORiIxlMZroJ5yS',1),

('EMP022','Lakshmi Narayan','Technical Lead','G8',9,0,'Java, Spring Boot, Microservices, System Design, PostgreSQL, Docker and Technical Leadership.','confirmed',1,1,
'$2b$12$8mQ6AaXJc65CkpeOOP3UROAHAuHCF3o5ZqXPvWYCMttB/935.P5fi',1),

('EMP023','Ramesh Gowda','System Administrator','G5',4,0,'Linux, Windows Server, Active Directory, Networking, Shell Scripting and System Administration.','confirmed',1,1,
'$2b$12$E0778WtRwsGNa6fwJjD1He9MsSV1sK/efN1ds981ZnZJKwLBhdpeK',1),

('EMP024','Neha Kapoor','AI Engineer','G6',4,0,'Python, Generative AI, Large Language Models, NLP, LangChain, Vector Databases and Prompt Engineering.','confirmed',1,1,
'$2b$12$NbpgE.3uV.R7Xv6TABU.vuimWU6Tt4yburcQWNnZAZ9dXBsqHYsE6',1),

('EMP025','Sanjay Rao','Product Manager','G8',8,0,'Product Strategy, Agile, Roadmapping, Business Analysis, Jira, Market Research and Stakeholder Management.','confirmed',1,1,
'$2b$12$gB33zemK/wbIonEYihatKuHUevgUNtEBLLo7.RNdxNIoRw0nUEIy.',1),

('EMP026','Harish Kumar','Software Engineer','G4',1,0,'Python, JavaScript, HTML, CSS, SQL and basic React application development.','confirmed',1,1,
'$2b$12$FA.5SckcfFGXCthNEiEz3.1hMo1wdOLtTD6IkE8GKcMT0Ng1utk/G',1),

('EMP027','Shreya Nair','Data Analyst','G5',3,0,'SQL, Python, Excel, Power BI, Tableau, Statistical Analysis and Data Visualization.','confirmed',1,1,
'$2b$12$riUI8AkgeezzbrFqqa.QZ.90CdnF/lIu.vDtMR6RqolEbYtnJoErG',1),

('EMP028','Abhishek Jain','Backend Developer','G6',5,0,'Node.js, Express.js, MongoDB, Redis, REST APIs, Docker and Microservices.','confirmed',1,1,
'$2b$12$5irjzENIAD/Bs9p30vBINe9ROCWbZKn04E8AL57Fe5y/fIIZyacB.',1),

('EMP029','Monika Sharma','Software Tester','G4',2,0,'Manual Testing, Selenium, Java, TestNG, API Testing and Software Quality Assurance.','confirmed',1,1,
'$2b$12$QDdT64wcKE6xn5NQ0XP2fe8QRfGPOlqXpGu9AckK6cGDGFsMQsPfS',1),

('EMP030','Girish Bhat','IT Support Engineer','G4',2,0,'Windows, Linux, Networking, Hardware Troubleshooting, Active Directory and IT Support.','confirmed',1,1,
'$2b$12$BNEQeujxIge1QAkh57dwzubrQlAfaNHLvNaJOrBXWOP3CCk.Lhk1.',1),

('EMP031','Anil Kumar','Senior Data Engineer','G8',9,0,'Python, SQL, Apache Spark, Kafka, AWS, Snowflake, Airflow and Big Data Architecture.','confirmed',1,1,
'$2b$12$KHfU2d1SnThPvl8AlUl4keS0rXGW3mmxoa9njXHBWpu63uylxki7K',1),

('EMP032','Ritu Singh','Business Intelligence Developer','G6',5,0,'Power BI, DAX, SQL Server, Excel, Data Modeling, ETL and Business Intelligence.','confirmed',1,1,
'$2b$12$fBg9LE1HRuU8Qzui7zNtGe3vvZKSqovM19GgvaP65qJklcZeAsa/m',1),

('EMP033','Prakash Rao','Software Architect','G9',13,0,'Java, Python, System Design, Microservices, Cloud Architecture, Kubernetes and Distributed Systems.','confirmed',1,1,
'$2b$12$0DplaRoe92zy/W2.TRP0teqDr79JlhL.f9EU6Y.cUmfQZs1MwdMWW',1),

('EMP034','Sowmya Shetty','Machine Learning Engineer','G5',3,1,'Python, Machine Learning, Scikit-learn, Pandas, NLP and Data Preprocessing. Experienced in ML model development.','confirmed',1,1,
'$2b$12$I32O6G0c09UHaxKAkQzBMOyWBgdehXKhEg6T7z5gm7A71alUg.H3q',1),

('EMP035','Ajay Menon','Frontend Engineer','G6',5,0,'React, TypeScript, JavaScript, Next.js, Redux, HTML, CSS and Frontend Architecture.','confirmed',1,1,
'$2b$12$b6wjfNnYa36yEPAxX8avNuFHUUH3zcQHx5/qp6RipWv7ZLOAZhYyW',1),

('EMP036','Bhavana Reddy','HR Business Partner','G7',7,1,'Human Resource Management, Talent Acquisition, Employee Relations, Workforce Planning and HR Analytics.','confirmed',1,1,
'$2b$12$KC5Bv2EMcZ9yHVvh39eCWuOpCutgbBH4k5U0OS2kKvx4WYmjanhSy',1),

('EMP037','Chandan Gowda','DevOps Engineer','G5',3,0,'Docker, Kubernetes, Jenkins, Git, Linux, AWS and Infrastructure Automation.','confirmed',1,1,
'$2b$12$DKG.xaCCO8efZdDnShU8tO/VoBewtGK9DoNgOLcLMo8jy3vSui4Rm',1),

('EMP038','Deepa Krishnan','Database Developer','G5',3,0,'SQL, MySQL, PostgreSQL, Stored Procedures, Database Design and Query Optimization.','confirmed',1,1,
'$2b$12$XeuNvNjOPTaolKyt9qdAhOBJBPwvbnNGTFKrYrit5hN7T1E0hm6Yu',1),

('EMP039','Mohit Agarwal','Cybersecurity Engineer','G7',7,0,'Penetration Testing, Network Security, SIEM, Python, Linux, Vulnerability Management and Incident Response.','confirmed',1,1,
'$2b$12$2/OBw9wLvJ5sOjugiwwwueBrO28R8XD0Xti3HHIsgO3RPN2dbLC1C',1),

('EMP040','Sanjana Iyer','AI Research Engineer','G7',6,0,'Python, Deep Learning, PyTorch, TensorFlow, NLP, Transformers and Research Model Development.','confirmed',1,1,
'$2b$12$28YUnSScZv5QyXhBJKqqVOb4lCj36oa6jTNQ1KMJBsMbr4i.Qv6sO',1),

('EMP041','Ravi Shankar','Software Developer','G4',1,0,'Java, Python, SQL, HTML, CSS, JavaScript and Object Oriented Programming.','confirmed',1,1,
'$2b$12$/lUJvSRRsPe1MPQmothQzuJ4g1QJrUa.d76rXBJQ98IZeIaS0vF7W',1),

('EMP042','Tanvi Kulkarni','Data Analyst','G4',1,0,'Excel, SQL, Python, Power BI, Data Cleaning and Basic Statistical Analysis.','confirmed',1,1,
'$2b$12$l7z52Sp3iEXORpdphhYTR.FHCazPo.95EQaUQWaisv4T8pdqvzaqK',1),

('EMP043','Suraj Patel','Network Security Engineer','G7',8,0,'Cisco Networking, Firewall Management, VPN, Network Security, Linux and Security Monitoring.','confirmed',1,1,
'$2b$12$GDbG.3KafpEf6GYlGm1IlONnoIJLY/Ks0saQmu0ua8qlAkgIc6lli',1),

('EMP044','Shalini Rao','Project Coordinator','G5',4,1,'Project Coordination, Agile, Scrum, Jira, Documentation, Resource Planning and Communication.','confirmed',1,1,
'$2b$12$IoFYZq9sU7OfgBHaMc2CLeBxRfE9QcJNQOEvbDfXz.lkajRbhU/Q.',1),

('EMP045','Akash Verma','Full Stack Developer','G6',5,0,'React, Node.js, Express.js, MongoDB, PostgreSQL, JavaScript and REST API development.','confirmed',1,1,
'$2b$12$xNT.iX1TBpblPVktjaaVkO7cJn.dd2MgtAPEXaOXbsJ8TOCqtzKNm',1),

('EMP046','Pavithra Nair','Cloud Engineer','G5',3,0,'AWS, Azure, Linux, Docker, Terraform, Cloud Monitoring and Infrastructure Management.','confirmed',1,1,
'$2b$12$P0DYxdwM29hIhRbvrYqM7u8SUXgDItsQb6qJSSoMh/G50VO8MSpdK',1),

('EMP047','Dinesh Kumar','Technical Support Engineer','G4',2,0,'Linux, Windows, Networking, Python Scripting, Troubleshooting and Technical Support.','draft',0,0,
'$2b$12$x.o1c8mYRT5Q2wQgq0Iuye1lDTytg49hCNxzj/hVBd2LldXya5dFW',1),

('EMP048','Ishita Sharma','Business Analyst','G5',3,0,'SQL, Excel, Power BI, Business Requirements, Agile, Documentation and Process Improvement.','draft',0,0,
'$2b$12$mzBKBvt/gXSWiTWKgfCan.zVnjy9t0jdUgmVjtngJX3eusuuM.XhC',1),

('EMP049','Vivek Rao','Software Engineer','G5',2,0,'Python, Java, Django, MySQL, Git and REST API Development.','draft',0,0,
'$2b$12$caKDxaiOPROG6q6ffmXoCez3gnKKhGxqBvGzvvf/yecWQUAounNFW',1),

('EMP050','Anusha Gowda','Data Scientist','G6',4,1,'Python, Machine Learning, Statistics, Pandas, NumPy, NLP and Predictive Analytics.','draft',0,0,
'$2b$12$3H.yI6WrM3QXk4DfS7o26.AKzC.S9SOd4xDmRi3Qou9w/zY.1uOGe',1);

INSERT INTO CONFIRMED_SKILLS_FINAL
(EMPLOYEE_ID, NAME, TAXONOMY_CATEGORY, EVIDENCE_SNIPPET)
VALUES

-- EMP001: Software Engineer
('EMP001','Python','Programming','Developed backend applications using Python'),
('EMP001','Java','Programming','Experience in Java application development'),
('EMP001','FastAPI','Framework','Built REST APIs using FastAPI'),

-- EMP002: Data Analyst
('EMP002','Python','Programming','Used Python for data analysis'),
('EMP002','SQL','Database','Performed database queries and data extraction'),
('EMP002','Power BI','Data Analytics','Created business intelligence dashboards'),

-- EMP003: Senior Software Engineer
('EMP003','Java','Programming','Developed enterprise Java applications'),
('EMP003','Spring Boot','Framework','Built backend services using Spring Boot'),
('EMP003','Docker','DevOps','Containerized microservices using Docker'),

-- EMP004: Machine Learning Engineer
('EMP004','Python','Programming','Developed machine learning models using Python'),
('EMP004','TensorFlow','Machine Learning','Built deep learning models using TensorFlow'),
('EMP004','Scikit-learn','Machine Learning','Implemented predictive machine learning models'),

-- EMP005: Cloud Engineer
('EMP005','AWS','Cloud Computing','Managed cloud infrastructure using AWS'),
('EMP005','Kubernetes','DevOps','Managed container orchestration'),
('EMP005','Terraform','Infrastructure','Automated infrastructure provisioning'),

-- EMP006: Frontend Developer
('EMP006','HTML','Web Development','Developed webpage structures using HTML'),
('EMP006','JavaScript','Programming','Implemented interactive frontend functionality'),
('EMP006','React','Framework','Built reusable React components'),

-- EMP007: Database Administrator
('EMP007','MySQL','Database','Managed MySQL databases'),
('EMP007','PostgreSQL','Database','Maintained PostgreSQL databases'),
('EMP007','Oracle','Database','Experience in Oracle database administration'),

-- EMP008: Business Analyst
('EMP008','SQL','Database','Extracted business data using SQL'),
('EMP008','Excel','Data Analytics','Performed business data analysis using Excel'),
('EMP008','Power BI','Data Analytics','Developed business reporting dashboards'),

-- EMP009: DevOps Engineer
('EMP009','Jenkins','DevOps','Automated deployment pipelines using Jenkins'),
('EMP009','Docker','DevOps','Created Docker containers'),
('EMP009','GitHub Actions','DevOps','Implemented CI/CD automation'),

-- EMP010: HR Analyst
('EMP010','Excel','Data Analytics','Performed employee data analysis using Excel'),
('EMP010','Power BI','Data Analytics','Created HR analytics dashboards'),
('EMP010','Workforce Planning','Human Resources','Supported workforce planning activities'),

-- EMP011: Software Developer
('EMP011','C++','Programming','Developed applications using C++'),
('EMP011','Java','Programming','Implemented object-oriented programming'),
('EMP011','Python','Programming','Developed Python applications'),

-- EMP012: Data Scientist
('EMP012','Python','Programming','Performed statistical analysis using Python'),
('EMP012','Machine Learning','Machine Learning','Developed predictive models'),
('EMP012','Statistics','Data Science','Applied statistical methods to datasets'),

-- EMP013: Network Engineer
('EMP013','Cisco','Networking','Configured Cisco networking equipment'),
('EMP013','TCP/IP','Networking','Implemented TCP/IP networking'),
('EMP013','Network Security','Cybersecurity','Managed network security configurations'),

-- EMP014: UI UX Designer
('EMP014','Figma','Design','Designed user interfaces using Figma'),
('EMP014','Adobe XD','Design','Created interactive prototypes using Adobe XD'),
('EMP014','Wireframing','Design','Created application wireframes'),

-- EMP015: Cybersecurity Analyst
('EMP015','Linux','Operating Systems','Used Linux for security operations'),
('EMP015','SIEM','Cybersecurity','Monitored security events using SIEM'),
('EMP015','Ethical Hacking','Cybersecurity','Performed vulnerability assessments'),

-- EMP016: Software Engineer
('EMP016','Python','Programming','Developed backend functionality using Python'),
('EMP016','Django','Framework','Built web applications using Django'),
('EMP016','PostgreSQL','Database','Managed application data using PostgreSQL'),

-- EMP017: Project Manager
('EMP017','Agile','Project Management','Managed projects using Agile methodology'),
('EMP017','Scrum','Project Management','Facilitated Scrum ceremonies'),
('EMP017','Jira','Project Management','Tracked project tasks using Jira'),

-- EMP018: Data Engineer
('EMP018','Apache Spark','Big Data','Processed large datasets using Spark'),
('EMP018','Airflow','Data Engineering','Orchestrated ETL workflows using Airflow'),
('EMP018','Python','Programming','Developed data processing pipelines'),

-- EMP019: QA Engineer
('EMP019','Selenium','Testing','Automated browser testing using Selenium'),
('EMP019','Python','Programming','Developed automated testing scripts'),
('EMP019','API Testing','Testing','Performed REST API testing'),

-- EMP020: Cloud Architect
('EMP020','AWS','Cloud Computing','Designed enterprise cloud infrastructure'),
('EMP020','Azure','Cloud Computing','Designed cloud solutions using Azure'),
('EMP020','Kubernetes','DevOps','Designed container orchestration architecture'),

-- EMP021: Mobile App Developer
('EMP021','Java','Programming','Developed Android applications using Java'),
('EMP021','Kotlin','Programming','Implemented Android application features'),
('EMP021','Firebase','Backend Services','Integrated Firebase services'),

-- EMP022: Technical Lead
('EMP022','Java','Programming','Led Java application development'),
('EMP022','Spring Boot','Framework','Designed Spring Boot microservices'),
('EMP022','System Design','Software Engineering','Designed scalable software systems'),

-- EMP023: System Administrator
('EMP023','Linux','Operating Systems','Administered Linux servers'),
('EMP023','Windows Server','Operating Systems','Managed Windows Server environments'),
('EMP023','Shell Scripting','Programming','Automated administrative tasks using shell scripts'),

-- EMP024: AI Engineer
('EMP024','Generative AI','Artificial Intelligence','Developed generative AI applications'),
('EMP024','LangChain','Artificial Intelligence','Built LLM application workflows'),
('EMP024','Python','Programming','Developed AI applications using Python'),

-- EMP025: Product Manager
('EMP025','Product Strategy','Product Management','Developed product strategies'),
('EMP025','Agile','Project Management','Managed Agile product development'),
('EMP025','Market Research','Business','Conducted product market research'),

-- EMP026: Software Engineer
('EMP026','Python','Programming','Developed basic Python applications'),
('EMP026','JavaScript','Programming','Implemented JavaScript functionality'),
('EMP026','SQL','Database','Performed SQL database operations'),

-- EMP027: Data Analyst
('EMP027','SQL','Database','Performed analytical SQL queries'),
('EMP027','Tableau','Data Analytics','Created interactive Tableau dashboards'),
('EMP027','Python','Programming','Performed data analysis using Python'),

-- EMP028: Backend Developer
('EMP028','Node.js','Programming','Developed backend applications using Node.js'),
('EMP028','Express.js','Framework','Built REST APIs using Express.js'),
('EMP028','MongoDB','Database','Designed MongoDB database collections'),

-- EMP029: Software Tester
('EMP029','Selenium','Testing','Performed automated browser testing'),
('EMP029','Java','Programming','Developed test automation scripts using Java'),
('EMP029','TestNG','Testing','Implemented automated test execution using TestNG'),

-- EMP030: IT Support Engineer
('EMP030','Windows','Operating Systems','Provided Windows operating system support'),
('EMP030','Networking','Networking','Troubleshot network connectivity issues'),
('EMP030','Hardware Troubleshooting','IT Support','Diagnosed and resolved hardware problems'),

-- EMP031: Senior Data Engineer
('EMP031','Apache Spark','Big Data','Developed large-scale data processing systems'),
('EMP031','Apache Kafka','Big Data','Implemented real-time data streaming'),
('EMP031','Snowflake','Data Engineering','Managed cloud data warehouse solutions'),

-- EMP032: Business Intelligence Developer
('EMP032','Power BI','Data Analytics','Developed enterprise BI dashboards'),
('EMP032','DAX','Data Analytics','Created advanced DAX calculations'),
('EMP032','SQL Server','Database','Managed analytical SQL queries'),

-- EMP033: Software Architect
('EMP033','Java','Programming','Designed enterprise Java applications'),
('EMP033','Microservices','Software Engineering','Designed distributed microservice architectures'),
('EMP033','System Design','Software Engineering','Designed scalable enterprise systems'),

-- EMP034: Machine Learning Engineer
('EMP034','Python','Programming','Developed machine learning solutions'),
('EMP034','Scikit-learn','Machine Learning','Implemented machine learning algorithms'),
('EMP034','NLP','Artificial Intelligence','Worked on natural language processing'),

-- EMP035: Frontend Engineer
('EMP035','React','Framework','Developed frontend applications using React'),
('EMP035','TypeScript','Programming','Implemented type-safe frontend applications'),
('EMP035','Next.js','Framework','Developed web applications using Next.js'),

-- EMP036: HR Business Partner
('EMP036','Talent Acquisition','Human Resources','Managed talent acquisition activities'),
('EMP036','Employee Relations','Human Resources','Handled employee relations processes'),
('EMP036','Workforce Planning','Human Resources','Supported workforce planning initiatives'),

-- EMP037: DevOps Engineer
('EMP037','Docker','DevOps','Built and managed Docker containers'),
('EMP037','Kubernetes','DevOps','Managed container orchestration'),
('EMP037','Jenkins','DevOps','Automated CI/CD pipelines'),

-- EMP038: Database Developer
('EMP038','SQL','Database','Developed database queries'),
('EMP038','MySQL','Database','Designed and maintained MySQL databases'),
('EMP038','PostgreSQL','Database','Developed PostgreSQL database solutions'),

-- EMP039: Cybersecurity Engineer
('EMP039','Penetration Testing','Cybersecurity','Performed penetration testing'),
('EMP039','SIEM','Cybersecurity','Monitored security incidents using SIEM'),
('EMP039','Python','Programming','Developed security automation scripts'),

-- EMP040: AI Research Engineer
('EMP040','PyTorch','Machine Learning','Developed deep learning models using PyTorch'),
('EMP040','TensorFlow','Machine Learning','Implemented neural network models'),
('EMP040','Transformers','Artificial Intelligence','Worked with transformer-based architectures'),

-- EMP041: Software Developer
('EMP041','Java','Programming','Developed Java applications'),
('EMP041','Python','Programming','Implemented Python programming solutions'),
('EMP041','SQL','Database','Performed database queries'),

-- EMP042: Data Analyst
('EMP042','Excel','Data Analytics','Performed spreadsheet-based analysis'),
('EMP042','SQL','Database','Extracted and analyzed structured data'),
('EMP042','Power BI','Data Analytics','Created data visualization dashboards'),

-- EMP043: Network Security Engineer
('EMP043','Cisco Networking','Networking','Configured enterprise Cisco networks'),
('EMP043','Firewall Management','Cybersecurity','Managed network firewall policies'),
('EMP043','VPN','Networking','Configured secure VPN connections'),

-- EMP044: Project Coordinator
('EMP044','Agile','Project Management','Coordinated Agile project activities'),
('EMP044','Jira','Project Management','Tracked project progress using Jira'),
('EMP044','Resource Planning','Project Management','Supported resource allocation and planning'),

-- EMP045: Full Stack Developer
('EMP045','React','Framework','Developed frontend applications using React'),
('EMP045','Node.js','Programming','Implemented backend application services'),
('EMP045','MongoDB','Database','Designed and managed MongoDB databases'),

-- EMP046: Cloud Engineer
('EMP046','AWS','Cloud Computing','Managed AWS cloud services'),
('EMP046','Terraform','Infrastructure','Automated cloud infrastructure provisioning'),
('EMP046','Docker','DevOps','Containerized cloud applications'),

-- EMP047: Technical Support Engineer
('EMP047','Linux','Operating Systems','Provided Linux system support'),
('EMP047','Networking','Networking','Troubleshot network-related issues'),
('EMP047','Python','Programming','Used Python for support automation'),

-- EMP048: Business Analyst
('EMP048','SQL','Database','Performed business data extraction'),
('EMP048','Excel','Data Analytics','Created business reports using Excel'),
('EMP048','Power BI','Data Analytics','Developed business intelligence reports'),

-- EMP049: Software Engineer
('EMP049','Python','Programming','Developed Python backend applications'),
('EMP049','Django','Framework','Implemented web application functionality'),
('EMP049','MySQL','Database','Managed relational database operations'),

-- EMP050: Data Scientist
('EMP050','Python','Programming','Developed data science applications'),
('EMP050','Machine Learning','Machine Learning','Built predictive machine learning models'),
('EMP050','Pandas','Data Analytics','Performed data manipulation and analysis using Pandas');

INSERT INTO EXTRACTED_SKILLS_DRAFT
(EMPLOYEE_ID, SKILL_ID, NAME, TAXONOMY_CATEGORY, EVIDENCE_SNIPPET)
VALUES

('EMP001','SK001','Python','Programming','Developed backend applications using Python'),
('EMP001','SK002','React','Framework','Experience building web applications using React'),

('EMP002','SK003','SQL','Database','Performed data extraction using SQL'),
('EMP002','SK004','Tableau','Data Analytics','Created data visualization dashboards'),

('EMP003','SK005','Spring Boot','Framework','Developed enterprise backend services'),
('EMP003','SK006','Kubernetes','DevOps','Managed container orchestration'),

('EMP004','SK007','PyTorch','Machine Learning','Built deep learning models'),
('EMP004','SK008','Computer Vision','Artificial Intelligence','Worked on computer vision applications'),

('EMP005','SK009','Azure','Cloud Computing','Managed cloud infrastructure using Azure'),
('EMP005','SK010','Linux','Operating Systems','Managed Linux environments'),

('EMP006','SK011','TypeScript','Programming','Developed frontend applications using TypeScript'),
('EMP006','SK012','CSS','Web Development','Designed responsive web interfaces'),

('EMP007','SK013','Oracle','Database','Managed Oracle databases'),
('EMP007','SK014','Database Optimization','Database','Optimized database queries'),

('EMP008','SK015','Business Analysis','Business','Performed business requirement analysis'),
('EMP008','SK016','Excel','Data Analytics','Created business reports using Excel'),

('EMP009','SK017','GitHub Actions','DevOps','Implemented automated CI/CD workflows'),
('EMP009','SK018','Terraform','Infrastructure','Automated infrastructure deployment'),

('EMP010','SK019','Recruitment Analytics','Human Resources','Analyzed recruitment performance'),
('EMP010','SK020','Employee Engagement','Human Resources','Worked on employee engagement analysis'),

('EMP011','SK021','Data Structures','Computer Science','Applied data structures in software development'),
('EMP011','SK022','Algorithms','Computer Science','Implemented software algorithms'),

('EMP012','SK023','R','Programming','Performed statistical analysis using R'),
('EMP012','SK024','NumPy','Data Analytics','Performed numerical data analysis'),

('EMP013','SK025','Routing','Networking','Configured enterprise network routing'),
('EMP013','SK026','Firewall','Cybersecurity','Managed network firewall configurations'),

('EMP014','SK027','Adobe Photoshop','Design','Created visual design assets'),
('EMP014','SK028','Prototyping','Design','Created interactive UI prototypes'),

('EMP015','SK029','Vulnerability Assessment','Cybersecurity','Identified security vulnerabilities'),
('EMP015','SK030','Incident Response','Cybersecurity','Handled security incidents'),

('EMP016','SK031','Django','Framework','Developed backend web applications'),
('EMP016','SK032','REST API','Software Engineering','Implemented REST API endpoints'),

('EMP017','SK033','Risk Management','Project Management','Managed project risks'),
('EMP017','SK034','Team Leadership','Management','Led cross-functional project teams'),

('EMP018','SK035','Apache Spark','Big Data','Processed large datasets using Spark'),
('EMP018','SK036','ETL','Data Engineering','Developed ETL data pipelines'),

('EMP019','SK037','JUnit','Testing','Performed automated unit testing'),
('EMP019','SK038','Test Automation','Testing','Developed automated testing workflows'),

('EMP020','SK039','Cloud Architecture','Cloud Computing','Designed enterprise cloud architecture'),
('EMP020','SK040','Microservices','Software Engineering','Designed distributed microservices'),

('EMP021','SK041','Android Studio','Mobile Development','Developed Android applications'),
('EMP021','SK042','Firebase','Backend Services','Integrated Firebase services'),

('EMP022','SK043','System Design','Software Engineering','Designed scalable enterprise systems'),
('EMP022','SK044','PostgreSQL','Database','Designed relational database solutions'),

('EMP023','SK045','Active Directory','IT Administration','Managed enterprise user accounts'),
('EMP023','SK046','Shell Scripting','Programming','Automated system administration tasks'),

('EMP024','SK047','Large Language Models','Artificial Intelligence','Developed applications using LLMs'),
('EMP024','SK048','Vector Databases','Database','Worked with vector-based data storage'),

('EMP025','SK049','Product Strategy','Product Management','Developed product roadmaps'),
('EMP025','SK050','Stakeholder Management','Management','Managed business stakeholders'),

('EMP026','SK051','HTML','Web Development','Developed webpage structures'),
('EMP026','SK052','React','Framework','Built frontend components'),

('EMP027','SK053','Tableau','Data Analytics','Developed interactive data visualizations'),
('EMP027','SK054','Statistics','Data Science','Applied statistical analysis'),

('EMP028','SK055','Redis','Database','Used Redis for caching'),
('EMP028','SK056','Express.js','Framework','Developed backend services'),

('EMP029','SK057','TestNG','Testing','Implemented automated test suites'),
('EMP029','SK058','API Testing','Testing','Validated REST API endpoints'),

('EMP030','SK059','Hardware Troubleshooting','IT Support','Diagnosed hardware problems'),
('EMP030','SK060','Windows Server','Operating Systems','Administered Windows servers'),

('EMP031','SK061','Apache Kafka','Big Data','Developed real-time streaming pipelines'),
('EMP031','SK062','Snowflake','Data Engineering','Worked with cloud data warehouses'),

('EMP032','SK063','DAX','Data Analytics','Developed advanced Power BI calculations'),
('EMP032','SK064','Data Modeling','Data Engineering','Created analytical data models'),

('EMP033','SK065','Distributed Systems','Software Engineering','Designed distributed software systems'),
('EMP033','SK066','Cloud Architecture','Cloud Computing','Designed enterprise cloud solutions'),

('EMP034','SK067','NLP','Artificial Intelligence','Developed natural language processing solutions'),
('EMP034','SK068','Pandas','Data Analytics','Performed data manipulation using Pandas'),

('EMP035','SK069','Next.js','Framework','Developed web applications using Next.js'),
('EMP035','SK070','Redux','Framework','Managed frontend application state'),

('EMP036','SK071','Talent Acquisition','Human Resources','Managed recruitment processes'),
('EMP036','SK072','Employee Relations','Human Resources','Handled employee relations activities'),

('EMP037','SK073','Jenkins','DevOps','Automated software deployment'),
('EMP037','SK074','Linux','Operating Systems','Managed Linux infrastructure'),

('EMP038','SK075','Stored Procedures','Database','Developed database stored procedures'),
('EMP038','SK076','Query Optimization','Database','Optimized relational database queries'),

('EMP039','SK077','Penetration Testing','Cybersecurity','Performed security penetration testing'),
('EMP039','SK078','Security Monitoring','Cybersecurity','Monitored security events'),

('EMP040','SK079','Transformers','Artificial Intelligence','Worked with transformer architectures'),
('EMP040','SK080','Deep Learning','Machine Learning','Developed deep learning models'),

('EMP041','SK081','Object Oriented Programming','Programming','Applied OOP principles'),
('EMP041','SK082','Git','Development Tools','Managed source code using Git'),

('EMP042','SK083','Data Cleaning','Data Analytics','Cleaned and prepared analytical datasets'),
('EMP042','SK084','Data Visualization','Data Analytics','Created data visualizations'),

('EMP043','SK085','VPN','Networking','Configured secure VPN connections'),
('EMP043','SK086','Network Security','Cybersecurity','Implemented network security controls'),

('EMP044','SK087','Resource Planning','Project Management','Coordinated resource allocation'),
('EMP044','SK088','Documentation','Business','Prepared project documentation'),

('EMP045','SK089','Node.js','Programming','Developed backend services using Node.js'),
('EMP045','SK090','PostgreSQL','Database','Managed relational application databases'),

('EMP046','SK091','Terraform','Infrastructure','Automated cloud infrastructure'),
('EMP046','SK092','Cloud Monitoring','Cloud Computing','Monitored cloud infrastructure'),

('EMP047','SK093','Python','Programming','Used Python for support automation'),
('EMP047','SK094','Linux','Operating Systems','Provided Linux technical support'),

('EMP048','SK095','Business Requirements','Business','Gathered business requirements'),
('EMP048','SK096','Agile','Project Management','Worked with Agile methodologies'),

('EMP049','SK097','Django','Framework','Developed Django backend applications'),
('EMP049','SK098','REST API','Software Engineering','Developed REST API services'),

('EMP050','SK099','Machine Learning','Machine Learning','Developed predictive models'),
('EMP050','SK100','NumPy','Data Analytics','Performed numerical data processing');

INSERT INTO INTERNAL_ROLES
(
    ROLE_ID,
    TITLE,
    DEPARTMENT,
    GRADE_LEVEL,
    DESCRIPTION,
    IS_ACTIVE
)
VALUES

('ROLE001','Junior Software Engineer','Engineering','G4',
'Develop and maintain software applications using Python, Java and modern development frameworks.',1),

('ROLE002','Software Engineer','Engineering','G5',
'Build scalable web applications, REST APIs and backend services using Java, Python and React.',1),

('ROLE003','Senior Software Engineer','Engineering','G7',
'Design enterprise software systems, lead development activities and implement microservices architectures.',1),

('ROLE004','Technical Lead','Engineering','G8',
'Lead engineering teams, establish technical standards and oversee architecture and software delivery.',1),

('ROLE005','Machine Learning Engineer','Artificial Intelligence','G6',
'Develop machine learning models, implement predictive analytics and deploy AI solutions.',1),

('ROLE006','AI Research Engineer','Artificial Intelligence','G7',
'Research and develop advanced AI solutions using deep learning, NLP and transformer architectures.',1),

('ROLE007','Data Analyst','Data Science','G5',
'Analyze business datasets, create dashboards and generate actionable insights using SQL and Power BI.',1),

('ROLE008','Data Scientist','Data Science','G7',
'Develop predictive models, perform statistical analysis and implement machine learning solutions.',1),

('ROLE009','Senior Data Engineer','Data Engineering','G8',
'Design scalable data pipelines, implement ETL workflows and manage big data infrastructure.',1),

('ROLE010','Cloud Engineer','Cloud Infrastructure','G6',
'Manage cloud infrastructure, automate deployments and maintain cloud-based applications.',1),

('ROLE011','Cloud Architect','Cloud Infrastructure','G9',
'Design enterprise cloud architecture, establish infrastructure standards and manage cloud transformation.',1),

('ROLE012','Cybersecurity Analyst','Information Security','G6',
'Monitor security incidents, perform vulnerability assessments and implement cybersecurity controls.',1),

('ROLE013','DevOps Engineer','Engineering','G6',
'Automate CI/CD pipelines, manage container infrastructure and improve deployment processes.',1),

('ROLE014','Business Analyst','Business Operations','G5',
'Gather business requirements, analyze operational processes and support business decision-making.',1),

('ROLE015','HR Business Partner','Human Resources','G7',
'Support workforce planning, employee development, talent management and internal career mobility.',1);

INSERT INTO JOB_ROLES
(
    JOB_ROLE_ID,
    TITLE,
    DEPARTMENT,
    DESCRIPTION,
    EXPERIENCE_MIN,
    EXPERIENCE_MAX,
    ROLE_SOURCE,
    CREATED_BY_HR,
    STATUS
)
VALUES

('JOB001','Junior Software Engineer','Engineering',
'Develop software applications using Python, Java, SQL and basic software engineering practices.',
0,2,'hr_created',NULL,'active'),

('JOB002','Software Engineer','Engineering',
'Build scalable backend applications, REST APIs and frontend integrations using Python, Java and React.',
2,5,'hr_created',NULL,'active'),

('JOB003','Senior Software Engineer','Engineering',
'Design scalable enterprise applications, implement microservices and lead software development activities.',
5,9,'hr_created',NULL,'active'),

('JOB004','Technical Lead','Engineering',
'Lead engineering teams, review technical architecture, mentor developers and oversee software delivery.',
7,12,'hr_created',NULL,'active'),

('JOB005','Machine Learning Engineer','Artificial Intelligence',
'Develop machine learning models, build predictive systems and deploy AI solutions using Python and ML frameworks.',
2,6,'hr_created',NULL,'active'),

('JOB006','AI Research Engineer','Artificial Intelligence',
'Research and implement advanced AI models using deep learning, NLP, transformers and neural networks.',
4,9,'hr_created',NULL,'active'),

('JOB007','Data Analyst','Data Science',
'Analyze business datasets, create dashboards and generate business insights using SQL, Excel and Power BI.',
0,4,'hr_created',NULL,'active'),

('JOB008','Data Scientist','Data Science',
'Develop predictive models, perform statistical analysis and implement machine learning solutions.',
3,8,'hr_created',NULL,'active'),

('JOB009','Senior Data Engineer','Data Engineering',
'Design scalable data pipelines, implement ETL workflows and manage big data infrastructure.',
6,12,'hr_created',NULL,'active'),

('JOB010','Cloud Engineer','Cloud Infrastructure',
'Manage AWS and Azure infrastructure, automate deployments and maintain cloud-based applications.',
2,6,'hr_created',NULL,'active'),

('JOB011','Cloud Architect','Cloud Infrastructure',
'Design enterprise cloud architecture, establish infrastructure standards and manage cloud transformation.',
8,15,'hr_created',NULL,'active'),

('JOB012','Cybersecurity Analyst','Information Security',
'Monitor security incidents, perform vulnerability assessments and implement cybersecurity controls.',
2,6,'hr_created',NULL,'active'),

('JOB013','DevOps Engineer','Engineering',
'Automate CI/CD pipelines, manage Docker and Kubernetes environments and improve deployment processes.',
2,6,'hr_created',NULL,'active'),

('JOB014','Business Analyst','Business Operations',
'Gather business requirements, analyze operational processes and support business decision-making.',
1,5,'hr_created',NULL,'active'),

('JOB015','HR Business Partner','Human Resources',
'Support workforce planning, employee development, talent management and internal career mobility.',
4,9,'hr_created',NULL,'active'),

('JOB016','Frontend Developer','Engineering',
'Develop responsive web applications using HTML, CSS, JavaScript, React and TypeScript.',
1,5,'hr_created',NULL,'active'),

('JOB017','Backend Developer','Engineering',
'Develop backend services, REST APIs, database integrations and scalable application architectures.',
2,6,'hr_created',NULL,'active'),

('JOB018','Database Administrator','Database Management',
'Manage relational databases, optimize SQL queries, maintain database security and perform backups.',
3,8,'hr_created',NULL,'active'),

('JOB019','QA Automation Engineer','Quality Assurance',
'Develop automated testing frameworks, perform API testing and ensure software quality.',
1,6,'hr_created',NULL,'active'),

('JOB020','Project Manager','Project Management',
'Manage project planning, resource allocation, stakeholder communication, budgets and delivery timelines.',
5,12,'hr_created',NULL,'active');

INSERT INTO JOB_REQUIRED_SKILLS
(
    REQUIREMENT_ID,
    JOB_ROLE_ID,
    SKILL_NAME,
    TAXONOMY_CATEGORY,
    REQUIRED_PROFICIENCY,
    IS_MANDATORY,
    WEIGHT
)
VALUES

-- JOB001: Junior Software Engineer
('REQ001','JOB001','Python','Programming','Beginner',1,1.00),
('REQ002','JOB001','Java','Programming','Beginner',1,1.00),
('REQ003','JOB001','SQL','Database','Beginner',1,0.90),
('REQ004','JOB001','Git','Development Tools','Beginner',0,0.60),
('REQ005','JOB001','Data Structures','Computer Science','Beginner',0,0.70),

-- JOB002: Software Engineer
('REQ006','JOB002','Python','Programming','Intermediate',1,1.00),
('REQ007','JOB002','Java','Programming','Intermediate',1,0.90),
('REQ008','JOB002','REST API','Software Engineering','Intermediate',1,0.90),
('REQ009','JOB002','SQL','Database','Intermediate',1,0.80),
('REQ010','JOB002','Docker','DevOps','Beginner',0,0.60),

-- JOB003: Senior Software Engineer
('REQ011','JOB003','Java','Programming','Advanced',1,1.00),
('REQ012','JOB003','Spring Boot','Framework','Advanced',1,1.00),
('REQ013','JOB003','Microservices','Software Engineering','Advanced',1,0.90),
('REQ014','JOB003','System Design','Software Engineering','Advanced',1,0.90),
('REQ015','JOB003','Docker','DevOps','Intermediate',0,0.70),

-- JOB004: Technical Lead
('REQ016','JOB004','Java','Programming','Advanced',1,0.90),
('REQ017','JOB004','System Design','Software Engineering','Advanced',1,1.00),
('REQ018','JOB004','Microservices','Software Engineering','Advanced',1,0.90),
('REQ019','JOB004','Team Leadership','Management','Advanced',1,1.00),
('REQ020','JOB004','Agile','Project Management','Intermediate',0,0.70),

-- JOB005: Machine Learning Engineer
('REQ021','JOB005','Python','Programming','Advanced',1,1.00),
('REQ022','JOB005','Machine Learning','Machine Learning','Advanced',1,1.00),
('REQ023','JOB005','TensorFlow','Machine Learning','Intermediate',1,0.90),
('REQ024','JOB005','Scikit-learn','Machine Learning','Intermediate',1,0.90),
('REQ025','JOB005','Statistics','Data Science','Intermediate',0,0.70),

-- JOB006: AI Research Engineer
('REQ026','JOB006','Python','Programming','Advanced',1,1.00),
('REQ027','JOB006','Deep Learning','Machine Learning','Advanced',1,1.00),
('REQ028','JOB006','PyTorch','Machine Learning','Advanced',1,0.90),
('REQ029','JOB006','NLP','Artificial Intelligence','Advanced',1,0.90),
('REQ030','JOB006','Transformers','Artificial Intelligence','Intermediate',0,0.80),

-- JOB007: Data Analyst
('REQ031','JOB007','SQL','Database','Intermediate',1,1.00),
('REQ032','JOB007','Excel','Data Analytics','Intermediate',1,0.90),
('REQ033','JOB007','Power BI','Data Analytics','Intermediate',1,1.00),
('REQ034','JOB007','Python','Programming','Beginner',0,0.70),
('REQ035','JOB007','Statistics','Data Science','Beginner',0,0.60),

-- JOB008: Data Scientist
('REQ036','JOB008','Python','Programming','Advanced',1,1.00),
('REQ037','JOB008','Machine Learning','Machine Learning','Advanced',1,1.00),
('REQ038','JOB008','Statistics','Data Science','Advanced',1,0.90),
('REQ039','JOB008','Pandas','Data Analytics','Intermediate',1,0.80),
('REQ040','JOB008','Scikit-learn','Machine Learning','Intermediate',0,0.80),

-- JOB009: Senior Data Engineer
('REQ041','JOB009','Python','Programming','Advanced',1,1.00),
('REQ042','JOB009','SQL','Database','Advanced',1,1.00),
('REQ043','JOB009','Apache Spark','Big Data','Advanced',1,1.00),
('REQ044','JOB009','Apache Kafka','Big Data','Intermediate',1,0.90),
('REQ045','JOB009','Airflow','Data Engineering','Intermediate',0,0.80),

-- JOB010: Cloud Engineer
('REQ046','JOB010','AWS','Cloud Computing','Intermediate',1,1.00),
('REQ047','JOB010','Azure','Cloud Computing','Beginner',0,0.70),
('REQ048','JOB010','Docker','DevOps','Intermediate',1,0.90),
('REQ049','JOB010','Linux','Operating Systems','Intermediate',1,0.80),
('REQ050','JOB010','Terraform','Infrastructure','Intermediate',0,0.80),

-- JOB011: Cloud Architect
('REQ051','JOB011','AWS','Cloud Computing','Advanced',1,1.00),
('REQ052','JOB011','Azure','Cloud Computing','Advanced',1,0.90),
('REQ053','JOB011','Cloud Architecture','Cloud Computing','Advanced',1,1.00),
('REQ054','JOB011','Kubernetes','DevOps','Advanced',1,0.90),
('REQ055','JOB011','Terraform','Infrastructure','Advanced',0,0.80),

-- JOB012: Cybersecurity Analyst
('REQ056','JOB012','Network Security','Cybersecurity','Intermediate',1,1.00),
('REQ057','JOB012','SIEM','Cybersecurity','Intermediate',1,0.90),
('REQ058','JOB012','Linux','Operating Systems','Intermediate',1,0.80),
('REQ059','JOB012','Vulnerability Assessment','Cybersecurity','Intermediate',1,0.90),
('REQ060','JOB012','Python','Programming','Beginner',0,0.60),

-- JOB013: DevOps Engineer
('REQ061','JOB013','Docker','DevOps','Advanced',1,1.00),
('REQ062','JOB013','Kubernetes','DevOps','Intermediate',1,1.00),
('REQ063','JOB013','Jenkins','DevOps','Intermediate',1,0.90),
('REQ064','JOB013','Linux','Operating Systems','Intermediate',1,0.80),
('REQ065','JOB013','Terraform','Infrastructure','Intermediate',0,0.80),

-- JOB014: Business Analyst
('REQ066','JOB014','SQL','Database','Intermediate',1,0.90),
('REQ067','JOB014','Excel','Data Analytics','Advanced',1,1.00),
('REQ068','JOB014','Business Analysis','Business','Intermediate',1,1.00),
('REQ069','JOB014','Power BI','Data Analytics','Intermediate',0,0.80),
('REQ070','JOB014','Agile','Project Management','Beginner',0,0.60),

-- JOB015: HR Business Partner
('REQ071','JOB015','Talent Acquisition','Human Resources','Advanced',1,1.00),
('REQ072','JOB015','Employee Relations','Human Resources','Advanced',1,1.00),
('REQ073','JOB015','Workforce Planning','Human Resources','Intermediate',1,0.90),
('REQ074','JOB015','Employee Engagement','Human Resources','Intermediate',0,0.80),
('REQ075','JOB015','HR Analytics','Human Resources','Intermediate',0,0.70),

-- JOB016: Frontend Developer
('REQ076','JOB016','HTML','Web Development','Intermediate',1,0.90),
('REQ077','JOB016','CSS','Web Development','Intermediate',1,0.90),
('REQ078','JOB016','JavaScript','Programming','Advanced',1,1.00),
('REQ079','JOB016','React','Framework','Intermediate',1,1.00),
('REQ080','JOB016','TypeScript','Programming','Intermediate',0,0.80),

-- JOB017: Backend Developer
('REQ081','JOB017','Node.js','Programming','Advanced',1,1.00),
('REQ082','JOB017','Express.js','Framework','Intermediate',1,0.90),
('REQ083','JOB017','REST API','Software Engineering','Advanced',1,1.00),
('REQ084','JOB017','MongoDB','Database','Intermediate',1,0.80),
('REQ085','JOB017','PostgreSQL','Database','Intermediate',0,0.80),

-- JOB018: Database Administrator
('REQ086','JOB018','MySQL','Database','Advanced',1,1.00),
('REQ087','JOB018','PostgreSQL','Database','Advanced',1,0.90),
('REQ088','JOB018','Oracle','Database','Intermediate',1,0.90),
('REQ089','JOB018','Database Optimization','Database','Advanced',1,1.00),
('REQ090','JOB018','SQL','Database','Advanced',0,0.80),

-- JOB019: QA Automation Engineer
('REQ091','JOB019','Selenium','Testing','Advanced',1,1.00),
('REQ092','JOB019','Java','Programming','Intermediate',1,0.90),
('REQ093','JOB019','API Testing','Testing','Intermediate',1,0.90),
('REQ094','JOB019','TestNG','Testing','Intermediate',0,0.80),
('REQ095','JOB019','Python','Programming','Beginner',0,0.70),

-- JOB020: Project Manager
('REQ096','JOB020','Project Management','Project Management','Advanced',1,1.00),
('REQ097','JOB020','Agile','Project Management','Advanced',1,0.90),
('REQ098','JOB020','Scrum','Project Management','Intermediate',1,0.90),
('REQ099','JOB020','Risk Management','Project Management','Advanced',1,0.90),
('REQ100','JOB020','Team Leadership','Management','Advanced',0,0.80);

INSERT INTO MATCHING_RESULTS
(
    MATCH_ID,
    EMPLOYEE_ID,
    JOB_ROLE_ID,
    MATCH_SCORE,
    MATCH_STATUS,
    MATCH_EXPLANATION,
    MATCHED_SKILLS,
    MISSING_SKILLS
)
VALUES

('MATCH001','EMP001','JOB002',92.50,'completed',
'Strong match for Software Engineer based on Python, Java and backend development experience.',
'Python, Java, REST API, SQL',
'Spring Boot, Microservices'),

('MATCH002','EMP002','JOB007',94.00,'completed',
'Excellent match for Data Analyst based on SQL, Python and Power BI experience.',
'SQL, Python, Power BI, Excel',
'Advanced Statistics'),

('MATCH003','EMP003','JOB003',96.00,'completed',
'Strong senior engineering profile with Java, Spring Boot and microservices expertise.',
'Java, Spring Boot, Docker, Microservices',
'Advanced System Design'),

('MATCH004','EMP004','JOB005',95.00,'completed',
'Excellent machine learning profile with Python, TensorFlow and Scikit-learn.',
'Python, TensorFlow, Scikit-learn',
'Advanced Statistics'),

('MATCH005','EMP005','JOB010',91.00,'completed',
'Strong cloud engineering capabilities with AWS, Kubernetes and Terraform.',
'AWS, Kubernetes, Terraform, Docker',
'Azure'),

('MATCH006','EMP006','JOB016',89.00,'completed',
'Good frontend development profile with React, JavaScript and HTML.',
'HTML, JavaScript, React',
'TypeScript, Advanced CSS'),

('MATCH007','EMP007','JOB018',97.00,'completed',
'Excellent database administration profile with MySQL, PostgreSQL and Oracle.',
'MySQL, PostgreSQL, Oracle',
'Database Security'),

('MATCH008','EMP008','JOB014',92.00,'completed',
'Strong business analysis profile with SQL, Excel and Power BI.',
'SQL, Excel, Power BI, Business Analysis',
'Advanced Agile'),

('MATCH009','EMP009','JOB013',95.00,'completed',
'Excellent DevOps profile with Jenkins, Docker and GitHub Actions.',
'Jenkins, Docker, GitHub Actions',
'Advanced Kubernetes'),

('MATCH010','EMP010','JOB015',72.00,'completed',
'Partial HR business partner match based on HR analytics and workforce planning.',
'Excel, Power BI, Workforce Planning',
'Talent Acquisition, Employee Relations'),

('MATCH011','EMP011','JOB002',81.00,'completed',
'Good software engineering match based on programming fundamentals and Java experience.',
'C++, Java, Python',
'REST API, Docker'),

('MATCH012','EMP012','JOB008',96.00,'completed',
'Excellent data science match with Python, machine learning and statistical analysis.',
'Python, Machine Learning, Statistics',
'Advanced Pandas'),

('MATCH013','EMP013','JOB012',89.00,'completed',
'Strong cybersecurity profile with networking, Cisco and network security experience.',
'Cisco, TCP/IP, Network Security',
'SIEM, Vulnerability Assessment'),

('MATCH014','EMP014','JOB016',58.00,'completed',
'Limited frontend engineering match. Strong design skills but limited frontend programming evidence.',
'HTML, CSS',
'JavaScript, React, TypeScript'),

('MATCH015','EMP015','JOB012',97.00,'completed',
'Excellent cybersecurity analyst profile with SIEM, Linux and ethical hacking.',
'Linux, SIEM, Ethical Hacking',
'Advanced Network Security'),

('MATCH016','EMP016','JOB017',90.00,'completed',
'Strong backend developer profile with Python, Django and REST API development.',
'Python, Django, REST API, PostgreSQL',
'Node.js, Express.js'),

('MATCH017','EMP017','JOB020',98.00,'completed',
'Excellent project management match with Agile, Scrum, Jira and leadership experience.',
'Agile, Scrum, Jira, Risk Management, Team Leadership',
'Advanced Budget Management'),

('MATCH018','EMP018','JOB009',93.00,'completed',
'Strong data engineering profile with Spark, Airflow and Python.',
'Apache Spark, Airflow, Python, ETL',
'Apache Kafka'),

('MATCH019','EMP019','JOB019',94.00,'completed',
'Excellent QA automation profile with Selenium, Python and API testing.',
'Selenium, Python, API Testing',
'TestNG'),

('MATCH020','EMP020','JOB011',98.00,'completed',
'Excellent cloud architecture profile with AWS, Azure and Kubernetes.',
'AWS, Azure, Kubernetes, Cloud Architecture',
'Advanced Terraform'),

('MATCH021','EMP021','JOB016',62.00,'completed',
'Partial frontend developer match based on programming experience and application development.',
'JavaScript, HTML',
'React, CSS, TypeScript'),

('MATCH022','EMP022','JOB004',96.00,'completed',
'Excellent technical leadership profile with Java, Spring Boot and system design.',
'Java, Spring Boot, System Design, Team Leadership',
'Advanced Cloud Architecture'),

('MATCH023','EMP023','JOB010',78.00,'completed',
'Moderate cloud engineering match based on Linux and infrastructure administration.',
'Linux, Shell Scripting',
'AWS, Docker, Terraform'),

('MATCH024','EMP024','JOB006',91.00,'completed',
'Strong AI engineering profile with Generative AI, LangChain and LLM technologies.',
'Python, Generative AI, LangChain',
'PyTorch, Transformers'),

('MATCH025','EMP025','JOB020',88.00,'completed',
'Good project management match with product strategy, Agile and stakeholder management.',
'Agile, Product Strategy, Stakeholder Management',
'Scrum, Risk Management'),

('MATCH026','EMP026','JOB001',78.00,'completed',
'Junior software engineering match based on Python, JavaScript and SQL fundamentals.',
'Python, JavaScript, SQL',
'Java, Git'),

('MATCH027','EMP027','JOB007',95.00,'completed',
'Excellent data analyst match with SQL, Tableau and Python.',
'SQL, Tableau, Python, Statistics',
'Power BI'),

('MATCH028','EMP028','JOB017',97.00,'completed',
'Excellent backend developer match with Node.js, Express.js and MongoDB.',
'Node.js, Express.js, MongoDB',
'REST API, PostgreSQL'),

('MATCH029','EMP029','JOB019',96.00,'completed',
'Excellent QA automation match with Selenium, Java and TestNG.',
'Selenium, Java, TestNG, API Testing',
'Python'),

('MATCH030','EMP030','JOB001',48.00,'completed',
'Limited software engineering match. Employee has stronger IT support experience.',
'Networking',
'Python, Java, SQL, Git'),

('MATCH031','EMP031','JOB009',98.00,'completed',
'Excellent senior data engineering profile with Spark, Kafka and Snowflake.',
'Apache Spark, Apache Kafka, Snowflake, Python',
'Advanced Airflow'),

('MATCH032','EMP032','JOB007',96.00,'completed',
'Excellent business intelligence and data analytics profile.',
'Power BI, DAX, SQL Server, Data Modeling',
'Python'),

('MATCH033','EMP033','JOB004',99.00,'completed',
'Excellent software architecture and technical leadership profile.',
'Java, Microservices, System Design',
'Advanced Team Leadership'),

('MATCH034','EMP034','JOB005',90.00,'completed',
'Strong machine learning profile with Python, Scikit-learn and NLP.',
'Python, Scikit-learn, NLP',
'TensorFlow'),

('MATCH035','EMP035','JOB016',98.00,'completed',
'Excellent frontend engineering profile with React, TypeScript and Next.js.',
'React, TypeScript, Next.js',
'Advanced CSS Architecture'),

('MATCH036','EMP036','JOB015',96.00,'completed',
'Excellent HR business partner profile with talent acquisition and employee relations.',
'Talent Acquisition, Employee Relations, Workforce Planning',
'HR Analytics'),

('MATCH037','EMP037','JOB013',94.00,'completed',
'Strong DevOps profile with Docker, Kubernetes and Jenkins.',
'Docker, Kubernetes, Jenkins',
'Terraform'),

('MATCH038','EMP038','JOB018',92.00,'completed',
'Strong database developer profile with SQL, MySQL and PostgreSQL.',
'SQL, MySQL, PostgreSQL',
'Oracle, Database Optimization'),

('MATCH039','EMP039','JOB012',98.00,'completed',
'Excellent cybersecurity profile with penetration testing and SIEM.',
'Penetration Testing, SIEM, Python',
'Advanced Network Security'),

('MATCH040','EMP040','JOB006',97.00,'completed',
'Excellent AI research profile with PyTorch, TensorFlow and Transformers.',
'PyTorch, TensorFlow, Transformers',
'Advanced NLP Research'),

('MATCH041','EMP041','JOB001',79.00,'completed',
'Good junior software engineering match with Java, Python and SQL.',
'Java, Python, SQL',
'Git, Data Structures'),

('MATCH042','EMP042','JOB007',86.00,'completed',
'Good data analyst match with Excel, SQL and Power BI.',
'Excel, SQL, Power BI',
'Python, Statistics'),

('MATCH043','EMP043','JOB012',95.00,'completed',
'Strong network security profile with Cisco, firewall management and VPN.',
'Cisco Networking, Firewall Management, VPN, Network Security',
'SIEM'),

('MATCH044','EMP044','JOB020',75.00,'completed',
'Moderate project management match based on Agile coordination and resource planning.',
'Agile, Jira, Resource Planning',
'Advanced Risk Management'),

('MATCH045','EMP045','JOB017',96.00,'completed',
'Excellent full stack and backend development match.',
'React, Node.js, MongoDB, PostgreSQL',
'Advanced Express.js'),

('MATCH046','EMP046','JOB010',94.00,'completed',
'Strong cloud engineering match with AWS, Terraform and Docker.',
'AWS, Terraform, Docker, Cloud Monitoring',
'Azure');

INSERT INTO ROLE_CRITERIA
(CRITERION_ID, ROLE_ID, DESCRIPTION, BUSINESS_REASON)
VALUES
('CRIT001', 'ROLE001', 'Strong proficiency in Python, Java, or another backend programming language.', 'Ensures the employee can develop and maintain reliable backend applications.'),
('CRIT002', 'ROLE001', 'Experience with REST APIs, databases, and application integration.', 'Ensures the employee can build and integrate backend services.'),

('CRIT003', 'ROLE002', 'Practical experience with machine learning algorithms and model development.', 'Ensures the employee can develop predictive and intelligent solutions.'),
('CRIT004', 'ROLE002', 'Knowledge of Python, data preprocessing, and model evaluation techniques.', 'Ensures the employee can prepare data and evaluate model performance.'),

('CRIT005', 'ROLE003', 'Strong knowledge of statistical analysis and data interpretation.', 'Ensures accurate analysis and evidence-based decision-making.'),
('CRIT006', 'ROLE003', 'Experience with Python, SQL, and data visualization tools.', 'Ensures the employee can analyze and communicate business insights.'),

('CRIT007', 'ROLE004', 'Experience in designing and maintaining data pipelines.', 'Ensures reliable movement and processing of organizational data.'),
('CRIT008', 'ROLE004', 'Knowledge of SQL, Python, ETL processes, and data warehousing.', 'Ensures the employee can build scalable data engineering solutions.'),

('CRIT009', 'ROLE005', 'Knowledge of cloud infrastructure and deployment practices.', 'Ensures the employee can support cloud-based applications and services.'),
('CRIT010', 'ROLE005', 'Experience with AWS, Azure, GCP, or equivalent cloud platforms.', 'Ensures familiarity with enterprise cloud environments.'),

('CRIT011', 'ROLE006', 'Knowledge of cybersecurity principles and security assessment techniques.', 'Ensures organizational systems and information remain protected.'),
('CRIT012', 'ROLE006', 'Experience with vulnerability assessment, access control, or security monitoring.', 'Ensures the employee can identify and address security risks.'),

('CRIT013', 'ROLE007', 'Experience in managing project schedules, deliverables, and dependencies.', 'Ensures projects are completed within agreed timelines.'),
('CRIT014', 'ROLE007', 'Strong communication, coordination, and stakeholder management skills.', 'Ensures effective collaboration across project teams.'),

('CRIT015', 'ROLE008', 'Ability to analyze business requirements and document functional specifications.', 'Ensures technical solutions address actual business requirements.'),
('CRIT016', 'ROLE008', 'Experience in process analysis and stakeholder communication.', 'Ensures business processes are understood and improved.'),

('CRIT017', 'ROLE009', 'Experience in recruiting, candidate evaluation, or talent acquisition.', 'Ensures effective identification and selection of suitable candidates.'),
('CRIT018', 'ROLE009', 'Knowledge of recruitment workflows and applicant tracking systems.', 'Ensures efficient management of recruitment operations.'),

('CRIT019', 'ROLE010', 'Experience in employee engagement and organizational development.', 'Supports employee satisfaction and organizational effectiveness.'),
('CRIT020', 'ROLE010', 'Knowledge of HR policies, employee relations, and performance management.', 'Ensures consistent and effective HR practices.'),

('CRIT021', 'ROLE011', 'Experience in developing frontend applications using modern web technologies.', 'Ensures the employee can build responsive user interfaces.'),
('CRIT022', 'ROLE011', 'Knowledge of JavaScript, React, HTML, CSS, and API integration.', 'Ensures compatibility with the organization's frontend technology stack.'),

('CRIT023', 'ROLE012', 'Experience in software testing and quality assurance processes.', 'Ensures applications meet quality and reliability standards.'),
('CRIT024', 'ROLE012', 'Knowledge of test automation, defect tracking, and debugging.', 'Ensures efficient identification and resolution of software defects.'),

('CRIT025', 'ROLE013', 'Experience in database design, SQL queries, and performance optimization.', 'Ensures reliable and efficient management of organizational data.'),
('CRIT026', 'ROLE013', 'Knowledge of relational databases, data modeling, and database security.', 'Ensures data integrity, availability, and security.'),

('CRIT027', 'ROLE014', 'Experience in technical leadership, mentoring, or team coordination.', 'Ensures effective technical guidance and knowledge sharing.'),
('CRIT028', 'ROLE014', 'Strong problem-solving skills and experience making technical decisions.', 'Ensures sound technical decisions and effective issue resolution.'),

('CRIT029', 'ROLE015', 'Experience in business process improvement and operational analysis.', 'Ensures operational activities become more efficient and measurable.'),
('CRIT030', 'ROLE015', 'Ability to prepare reports, coordinate stakeholders, and monitor operational performance.', 'Ensures effective operational planning and performance tracking.');

INSERT INTO ROLE_REQUIRED_SKILLS
(ROLE_ID, SKILL_ID, IMPORTANCE, WEIGHT)
VALUES

-- ROLE001: Backend Engineering
('ROLE001', 'TAX001', 'MANDATORY', 1.00),
('ROLE001', 'TAX002', 'PREFERRED', 0.80),
('ROLE001', 'TAX006', 'MANDATORY', 1.00),
('ROLE001', 'TAX011', 'PREFERRED', 0.70),

-- ROLE002: Machine Learning
('ROLE002', 'TAX001', 'MANDATORY', 1.00),
('ROLE002', 'TAX013', 'MANDATORY', 1.00),
('ROLE002', 'TAX017', 'PREFERRED', 0.80),
('ROLE002', 'TAX018', 'PREFERRED', 0.80),

-- ROLE003: Data Science
('ROLE003', 'TAX019', 'MANDATORY', 1.00),
('ROLE003', 'TAX021', 'MANDATORY', 1.00),
('ROLE003', 'TAX001', 'PREFERRED', 0.80),
('ROLE003', 'TAX020', 'PREFERRED', 0.70),

-- ROLE004: Data Engineering
('ROLE004', 'TAX006', 'MANDATORY', 1.00),
('ROLE004', 'TAX024', 'MANDATORY', 1.00),
('ROLE004', 'TAX025', 'PREFERRED', 0.80),
('ROLE004', 'TAX026', 'PREFERRED', 0.80),

-- ROLE005: Cloud Engineering
('ROLE005', 'TAX027', 'MANDATORY', 1.00),
('ROLE005', 'TAX028', 'PREFERRED', 0.80),
('ROLE005', 'TAX030', 'MANDATORY', 1.00),
('ROLE005', 'TAX031', 'PREFERRED', 0.80),

-- ROLE006: Cybersecurity
('ROLE006', 'TAX033', 'MANDATORY', 1.00),
('ROLE006', 'TAX034', 'MANDATORY', 1.00),
('ROLE006', 'TAX035', 'PREFERRED', 0.80),
('ROLE006', 'TAX036', 'PREFERRED', 0.80),

-- ROLE007: Project Management
('ROLE007', 'TAX039', 'MANDATORY', 1.00),
('ROLE007', 'TAX040', 'PREFERRED', 0.70),
('ROLE007', 'TAX006', 'NICE_TO_HAVE', 0.50),
('ROLE007', 'TAX003', 'NICE_TO_HAVE', 0.40),

-- ROLE008: Business Analysis
('ROLE008', 'TAX040', 'MANDATORY', 1.00),
('ROLE008', 'TAX006', 'PREFERRED', 0.80),
('ROLE008', 'TAX019', 'PREFERRED', 0.80),
('ROLE008', 'TAX020', 'NICE_TO_HAVE', 0.50),

-- ROLE009: Talent Acquisition
('ROLE009', 'TAX037', 'MANDATORY', 1.00),
('ROLE009', 'TAX039', 'PREFERRED', 0.70),
('ROLE009', 'TAX040', 'PREFERRED', 0.70),
('ROLE009', 'TAX006', 'NICE_TO_HAVE', 0.40),

-- ROLE010: Employee Engagement
('ROLE010', 'TAX038', 'MANDATORY', 1.00),
('ROLE010', 'TAX037', 'PREFERRED', 0.80),
('ROLE010', 'TAX040', 'PREFERRED', 0.70),
('ROLE010', 'TAX039', 'NICE_TO_HAVE', 0.50),

-- ROLE011: Frontend Development
('ROLE011', 'TAX003', 'MANDATORY', 1.00),
('ROLE011', 'TAX009', 'MANDATORY', 1.00),
('ROLE011', 'TAX007', 'PREFERRED', 0.80),
('ROLE011', 'TAX008', 'PREFERRED', 0.80),

-- ROLE012: Software Testing
('ROLE012', 'TAX001', 'PREFERRED', 0.80),
('ROLE012', 'TAX003', 'PREFERRED', 0.70),
('ROLE012', 'TAX011', 'PREFERRED', 0.70),
('ROLE012', 'TAX006', 'NICE_TO_HAVE', 0.50),

-- ROLE013: Database Engineering
('ROLE013', 'TAX006', 'MANDATORY', 1.00),
('ROLE013', 'TAX026', 'MANDATORY', 1.00),
('ROLE013', 'TAX025', 'PREFERRED', 0.80),
('ROLE013', 'TAX001', 'NICE_TO_HAVE', 0.50),

-- ROLE014: Technical Leadership
('ROLE014', 'TAX039', 'MANDATORY', 1.00),
('ROLE014', 'TAX001', 'PREFERRED', 0.80),
('ROLE014', 'TAX006', 'PREFERRED', 0.70),
('ROLE014', 'TAX030', 'NICE_TO_HAVE', 0.50),

-- ROLE015: Business Operations
('ROLE015', 'TAX040', 'MANDATORY', 1.00),
('ROLE015', 'TAX019', 'PREFERRED', 0.80),
('ROLE015', 'TAX020', 'PREFERRED', 0.70),
('ROLE015', 'TAX039', 'PREFERRED', 0.70);

DELETE FROM MARKET_DEMAND;

INSERT INTO MARKET_DEMAND
(SKILL_ID, DEMAND_LEVEL, TREND, DEMAND_GROWTH_PCT,
 OPEN_INTERNAL_ROLES, MARKET_NOTE, IS_SIMULATED, IS_ACTIVE)
VALUES

('TAX001', 'HIGH', 'RISING', 18, 12, 'Python remains widely used in automation, backend development, and AI applications.', 1, 1),
('TAX002', 'HIGH', 'STABLE', 8, 8, 'Java continues to be used in enterprise application development.', 1, 1),
('TAX003', 'HIGH', 'RISING', 15, 10, 'JavaScript remains important for modern web application development.', 1, 1),
('TAX004', 'MEDIUM', 'STABLE', 5, 3, 'C++ is used in performance-intensive software and systems development.', 1, 1),
('TAX005', 'LOW', 'STABLE', 2, 2, 'C remains relevant for embedded systems and low-level programming.', 1, 1),
('TAX006', 'HIGH', 'RISING', 12, 15, 'SQL is widely required for database management and data analysis.', 1, 1),

('TAX007', 'MEDIUM', 'STABLE', 4, 4, 'HTML is a foundational technology for web development.', 1, 1),
('TAX008', 'MEDIUM', 'STABLE', 4, 4, 'CSS is essential for styling and responsive web interfaces.', 1, 1),
('TAX009', 'HIGH', 'RISING', 16, 9, 'React is widely adopted for building modern frontend applications.', 1, 1),
('TAX010', 'HIGH', 'RISING', 13, 7, 'Node.js is commonly used for scalable backend services.', 1, 1),
('TAX011', 'HIGH', 'RISING', 11, 13, 'REST APIs are important for application and service integration.', 1, 1),
('TAX012', 'MEDIUM', 'RISING', 10, 5, 'FastAPI is gaining adoption for Python-based backend services.', 1, 1),

('TAX013', 'HIGH', 'RISING', 24, 14, 'Machine learning demand is growing across enterprise automation and analytics.', 1, 1),
('TAX014', 'HIGH', 'RISING', 22, 8, 'Deep learning supports advanced AI applications and intelligent systems.', 1, 1),
('TAX015', 'HIGH', 'RISING', 20, 7, 'Natural language processing supports conversational AI and text analytics.', 1, 1),
('TAX016', 'HIGH', 'RISING', 29, 16, 'Generative AI adoption is increasing across enterprise workflows.', 1, 1),
('TAX017', 'MEDIUM', 'STABLE', 7, 5, 'TensorFlow remains a useful framework for machine learning development.', 1, 1),
('TAX018', 'HIGH', 'RISING', 12, 8, 'Scikit-learn is widely used for traditional machine learning workflows.', 1, 1),

('TAX019', 'HIGH', 'RISING', 14, 12, 'Data analysis supports business intelligence and operational decisions.', 1, 1),
('TAX020', 'HIGH', 'RISING', 13, 9, 'Data visualization helps communicate analytical findings effectively.', 1, 1),
('TAX021', 'MEDIUM', 'STABLE', 6, 5, 'Statistics provides the foundation for analytical and predictive work.', 1, 1),
('TAX022', 'HIGH', 'RISING', 11, 8, 'Pandas is commonly used for data manipulation and analysis.', 1, 1),
('TAX023', 'MEDIUM', 'STABLE', 8, 5, 'NumPy supports numerical computing and scientific Python workflows.', 1, 1),
('TAX024', 'HIGH', 'RISING', 17, 10, 'ETL skills are important for building reliable data pipelines.', 1, 1),
('TAX025', 'HIGH', 'RISING', 12, 8, 'Data warehousing supports enterprise reporting and analytics.', 1, 1),
('TAX026', 'HIGH', 'RISING', 10, 7, 'Data modeling helps maintain consistent and reliable data structures.', 1, 1),

('TAX027', 'HIGH', 'RISING', 19, 13, 'AWS skills are widely required for cloud infrastructure and deployment.', 1, 1),
('TAX028', 'HIGH', 'RISING', 18, 11, 'Microsoft Azure supports enterprise cloud and application services.', 1, 1),
('TAX029', 'MEDIUM', 'RISING', 14, 6, 'Google Cloud Platform is used for cloud infrastructure and data services.', 1, 1),
('TAX030', 'HIGH', 'RISING', 16, 10, 'Docker supports containerized application development and deployment.', 1, 1),
('TAX031', 'HIGH', 'RISING', 18, 8, 'Kubernetes supports container orchestration and scalable infrastructure.', 1, 1),
('TAX032', 'HIGH', 'RISING', 15, 9, 'CI/CD practices improve software delivery and deployment automation.', 1, 1),

('TAX033', 'HIGH', 'RISING', 17, 10, 'Cybersecurity expertise is important for protecting enterprise systems.', 1, 1),
('TAX034', 'MEDIUM', 'RISING', 11, 6, 'Network security protects enterprise networks and communication systems.', 1, 1),
('TAX035', 'HIGH', 'RISING', 14, 7, 'Vulnerability assessment helps organizations identify security weaknesses.', 1, 1),
('TAX036', 'HIGH', 'RISING', 13, 8, 'Access control supports secure identity and permission management.', 1, 1),

('TAX037', 'HIGH', 'STABLE', 7, 6, 'Talent acquisition supports organizational hiring and workforce planning.', 1, 1),
('TAX038', 'MEDIUM', 'RISING', 8, 4, 'Employee engagement contributes to retention and workplace effectiveness.', 1, 1),
('TAX039', 'HIGH', 'RISING', 10, 12, 'Project management supports delivery across business and technical teams.', 1, 1),
('TAX040', 'HIGH', 'RISING', 11, 9, 'Business analysis helps align technology solutions with business needs.', 1, 1);

INSERT INTO FEW_SHOT_EXTRACTIONS
(EXAMPLE_ID, INPUT_TEXT, EXPECTED_EXTRACTION_JSON)
VALUES

('EX_01',
 'Developed backend applications using Python and FastAPI. Created REST APIs and integrated PostgreSQL databases.',
 '[
   {"skill_id":"TAX001","canonical_name":"Python","evidence":"using Python"},
   {"skill_id":"TAX012","canonical_name":"FastAPI","evidence":"using FastAPI"},
   {"skill_id":"TAX011","canonical_name":"REST API","evidence":"Created REST APIs"},
   {"skill_id":"TAX006","canonical_name":"SQL","evidence":"integrated PostgreSQL databases"}
 ]'),

('EX_02',
 'Built machine learning models using Python and Scikit-learn for customer churn prediction.',
 '[
   {"skill_id":"TAX013","canonical_name":"Machine Learning","evidence":"Built machine learning models"},
   {"skill_id":"TAX001","canonical_name":"Python","evidence":"using Python"},
   {"skill_id":"TAX018","canonical_name":"Scikit-learn","evidence":"using Scikit-learn"}
 ]'),

('EX_03',
 'Created responsive web applications using React, JavaScript, HTML and CSS.',
 '[
   {"skill_id":"TAX009","canonical_name":"React","evidence":"using React"},
   {"skill_id":"TAX003","canonical_name":"JavaScript","evidence":"JavaScript"},
   {"skill_id":"TAX007","canonical_name":"HTML","evidence":"HTML"},
   {"skill_id":"TAX008","canonical_name":"CSS","evidence":"CSS"}
 ]'),

('EX_04',
 'Designed ETL pipelines and data warehouses using SQL and Python for enterprise reporting.',
 '[
   {"skill_id":"TAX024","canonical_name":"ETL","evidence":"Designed ETL pipelines"},
   {"skill_id":"TAX025","canonical_name":"Data Warehousing","evidence":"data warehouses"},
   {"skill_id":"TAX006","canonical_name":"SQL","evidence":"using SQL"},
   {"skill_id":"TAX001","canonical_name":"Python","evidence":"Python"}
 ]'),

('EX_05',
 'Deployed containerized applications using Docker and Kubernetes on AWS cloud infrastructure.',
 '[
   {"skill_id":"TAX030","canonical_name":"Docker","evidence":"using Docker"},
   {"skill_id":"TAX031","canonical_name":"Kubernetes","evidence":"using Kubernetes"},
   {"skill_id":"TAX027","canonical_name":"AWS","evidence":"on AWS cloud infrastructure"}
 ]'),

('EX_06',
 'Performed vulnerability assessments, monitored network security and implemented access control policies.',
 '[
   {"skill_id":"TAX035","canonical_name":"Vulnerability Assessment","evidence":"Performed vulnerability assessments"},
   {"skill_id":"TAX034","canonical_name":"Network Security","evidence":"monitored network security"},
   {"skill_id":"TAX036","canonical_name":"Access Control","evidence":"implemented access control policies"}
 ]'),

('EX_07',
 'Analyzed business data using Pandas and NumPy. Created dashboards and visual reports for management.',
 '[
   {"skill_id":"TAX019","canonical_name":"Data Analysis","evidence":"Analyzed business data"},
   {"skill_id":"TAX022","canonical_name":"Pandas","evidence":"using Pandas"},
   {"skill_id":"TAX023","canonical_name":"NumPy","evidence":"NumPy"},
   {"skill_id":"TAX020","canonical_name":"Data Visualization","evidence":"Created dashboards and visual reports"}
 ]'),

('EX_08',
 'Worked in talent acquisition, recruitment screening and employee engagement activities.',
 '[
   {"skill_id":"TAX037","canonical_name":"Talent Acquisition","evidence":"Worked in talent acquisition"},
   {"skill_id":"TAX038","canonical_name":"Employee Engagement","evidence":"employee engagement activities"}
 ]'),

('EX_09',
 'Managed project schedules, coordinated stakeholders and performed business requirements analysis.',
 '[
   {"skill_id":"TAX039","canonical_name":"Project Management","evidence":"Managed project schedules"},
   {"skill_id":"TAX040","canonical_name":"Business Analysis","evidence":"business requirements analysis"}
 ]'),

('EX_10',
 'Developed generative AI applications using natural language processing and deep learning techniques.',
 '[
   {"skill_id":"TAX016","canonical_name":"Generative AI","evidence":"generative AI applications"},
   {"skill_id":"TAX015","canonical_name":"Natural Language Processing","evidence":"natural language processing"},
   {"skill_id":"TAX014","canonical_name":"Deep Learning","evidence":"deep learning techniques"}
 ]');

INSERT INTO FAIRNESS_BIAS_RULES
(
    RULE_ID,
    RULE_CATEGORY,
    REGEX_PATTERN,
    SEVERITY,
    EXPLANATION_TEMPLATE
)
VALUES

('RULE001',
 'GENDER_BIAS',
 '(?i)\\b(male candidates only|female candidates only|men only|women only)\\b',
 'HIGH',
 'The job description appears to restrict eligibility based on gender. Evaluate whether the requirement is genuinely necessary for the role.'),

('RULE002',
 'GENDER_CODED_LANGUAGE',
 '(?i)\\b(aggressive male|dominant male|manpower required)\\b',
 'MEDIUM',
 'The wording may contain gender-coded language. Consider replacing it with neutral, role-related terminology.'),

('RULE003',
 'AGE_DISCRIMINATION',
 '(?i)\\b(under [0-9]+ years old|below [0-9]+ years of age|age limit [0-9]+)\\b',
 'HIGH',
 'The requirement may impose an age restriction unrelated to essential job responsibilities.'),

('RULE004',
 'CAREER_BREAK_BIAS',
 '(?i)\\b(no career gaps|no employment gaps|continuous employment required|uninterrupted work history)\\b',
 'HIGH',
 'The requirement may disadvantage candidates with career breaks. Evaluate candidates based on relevant skills and experience.'),

('RULE005',
 'DISABILITY_EXCLUSION',
 '(?i)\\b(physically fit only|no disabled candidates|must not have disability|without disabilities)\\b',
 'HIGH',
 'The wording may exclude candidates with disabilities without considering reasonable accommodations or actual job requirements.'),

('RULE006',
 'NATIONALITY_BIAS',
 '(?i)\\b(indians only|foreigners only|citizens of [a-z]+ only)\\b',
 'HIGH',
 'The requirement may restrict candidates based on nationality. Verify whether a lawful work authorization requirement is intended.'),

('RULE007',
 'FAMILY_STATUS_BIAS',
 '(?i)\\b(unmarried candidates only|single candidates only|no married candidates)\\b',
 'HIGH',
 'The requirement appears to consider marital or family status rather than job-related qualifications.'),

('RULE008',
 'EDUCATION_BIAS',
 '(?i)\\b(top tier colleges only|elite universities only|tier 1 colleges only)\\b',
 'MEDIUM',
 'The requirement may unnecessarily exclude qualified candidates based on institutional background.'),

('RULE009',
 'EXPERIENCE_RESTRICTION',
 '(?i)\\b(minimum [0-9]+ years mandatory|at least [0-9]+ years or reject)\\b',
 'MEDIUM',
 'Review whether the experience threshold is genuinely necessary. Consider equivalent skills and demonstrated capabilities.'),

('RULE010',
 'LANGUAGE_BIAS',
 '(?i)\\b(native english speakers only|native speakers only)\\b',
 'HIGH',
 'The requirement may unnecessarily favor native speakers. Specify the actual language proficiency needed for the role.'),

('RULE011',
 'GENDER_CODED_LANGUAGE',
 '(?i)\\b(he will manage|his responsibilities|chairman only)\\b',
 'LOW',
 'Consider using gender-neutral language to make the job description more inclusive.'),

('RULE012',
 'PHYSICAL_REQUIREMENT_BIAS',
 '(?i)\\b(young and energetic|young workforce only|young candidates preferred)\\b',
 'MEDIUM',
 'The wording may indirectly discriminate based on age. Describe the actual job-related capabilities required.'),

('RULE013',
 'RELIGIOUS_BIAS',
 '(?i)\\b(christians only|hindus only|muslims only|specific religion only)\\b',
 'HIGH',
 'The requirement appears to restrict eligibility based on religion rather than role-related qualifications.'),

('RULE014',
 'CAREER_BREAK_BIAS',
 '(?i)\\b(candidates with no maternity break|no parental leave history)\\b',
 'HIGH',
 'The requirement may disadvantage candidates who have taken parental or maternity leave.'),

('RULE015',
 'UNNECESSARY_REQUIREMENT',
 '(?i)\\b(must be available 24/7|no personal commitments|no family responsibilities)\\b',
 'MEDIUM',
 'The wording may impose unreasonable personal-life restrictions. Specify actual working hours and availability requirements.');

INSERT INTO BIAS_AUDIT_FLAGS
(
    FLAG_ID,
    JOB_ROLE_ID,
    MATCH_ID,
    FLAG_TYPE,
    SEVERITY,
    DESCRIPTION,
    RECOMMENDATION,
    REVIEW_STATUS,
    REVIEWED_BY_HR,
    REVIEWED_AT,
    REVIEW_COMMENTS,
    CREATED_AT
)
VALUES

('FLAG001', 'JOB001', 'MATCH001',
 'CAREER_BREAK_BIAS', 'HIGH',
 'The job description contains wording that may disadvantage candidates with career breaks.',
 'Evaluate candidates based on relevant skills and experience rather than uninterrupted employment history.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG002', 'JOB002', 'MATCH002',
 'GENDER_BIAS', 'HIGH',
 'The job description contains potentially gender-restrictive language.',
 'Replace gender-specific wording with neutral, role-related requirements.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG003', 'JOB003', 'MATCH003',
 'AGE_DISCRIMINATION', 'HIGH',
 'The job description includes an age-related eligibility restriction.',
 'Review whether the age requirement is legally justified and genuinely necessary for the role.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG004', 'JOB004', 'MATCH004',
 'EDUCATION_BIAS', 'MEDIUM',
 'The role appears to prefer candidates from specific institutions without demonstrating a job-related reason.',
 'Evaluate candidates based on demonstrated competencies, qualifications, and relevant experience.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG005', 'JOB005', 'MATCH005',
 'EXPERIENCE_RESTRICTION', 'MEDIUM',
 'The role specifies a strict experience threshold that may exclude candidates with equivalent skills.',
 'Consider transferable skills and relevant project experience alongside years of employment.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG006', 'JOB006', 'MATCH006',
 'DISABILITY_EXCLUSION', 'HIGH',
 'The job description contains a potentially exclusionary physical capability requirement.',
 'Review essential job functions and consider reasonable workplace accommodations.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG007', 'JOB007', 'MATCH007',
 'GENDER_CODED_LANGUAGE', 'LOW',
 'The job description uses gender-coded terminology.',
 'Use gender-neutral language throughout the job description.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG008', 'JOB008', 'MATCH008',
 'CAREER_BREAK_BIAS', 'HIGH',
 'The matching evaluation may disadvantage employees with employment gaps.',
 'Ensure career breaks do not automatically reduce employee eligibility or matching scores.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG009', 'JOB009', 'MATCH009',
 'UNNECESSARY_REQUIREMENT', 'MEDIUM',
 'The role contains availability requirements that may unnecessarily restrict candidates with personal responsibilities.',
 'Specify actual working hours and essential availability requirements.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG010', 'JOB010', 'MATCH010',
 'NATIONALITY_BIAS', 'HIGH',
 'The job description may contain a nationality-based eligibility restriction.',
 'Verify whether a legitimate work authorization requirement is intended.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG011', 'JOB011', 'MATCH011',
 'LANGUAGE_BIAS', 'MEDIUM',
 'The job description may unnecessarily require native-level language proficiency.',
 'Specify the actual language proficiency required to perform the job.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG012', 'JOB012', 'MATCH012',
 'FAMILY_STATUS_BIAS', 'HIGH',
 'The role description contains wording that may discriminate based on marital or family status.',
 'Remove family-status restrictions and focus on essential job responsibilities.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG013', 'JOB013', 'MATCH013',
 'EXPERIENCE_RESTRICTION', 'MEDIUM',
 'The role may place excessive emphasis on years of experience instead of demonstrated capabilities.',
 'Consider equivalent experience, transferable skills, and practical achievements.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG014', 'JOB014', 'MATCH014',
 'EDUCATION_BIAS', 'MEDIUM',
 'The role appears to prioritize institutional reputation over relevant qualifications.',
 'Use consistent, job-related competency requirements when evaluating candidates.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP),

('FLAG015', 'JOB015', 'MATCH015',
 'CAREER_BREAK_BIAS', 'HIGH',
 'The matching process may penalize employees who have taken parental or other career breaks.',
 'Ensure career-break information is not used as an automatic negative matching factor.',
 'pending', NULL, NULL, NULL, CURRENT_TIMESTAMP);

INSERT INTO HR_USERS
(
    HR_ID,
    FULL_NAME,
    EMAIL,
    PASSWORD_HASH,
    DEPARTMENT,
    IS_ACTIVE,
    CREATED_AT,
    UPDATED_AT
)
VALUES
(
    'HR001',
    'Ananya Sharma',
    'ananya.sharma@company.com',
    '$2b$12$nch2JdzdL75TQmncNl1c..g5AzacRtbrwucPQShQCJH2EBqJpESu.',
    'Talent Acquisition',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'HR002',
    'Rahul Menon',
    'rahul.menon@company.com',
    '$2b$12$i0.FG7P974LuAlLyw1is8.10tP/J147sqgkK3F5FMb3jyUhZ0SZEC',
    'Human Resources',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'HR003',
    'Priya Nair',
    'priya.nair@company.com',
    '$2b$12$2/JDB/cKGnOAhqGi8lbRmuOCl.HYLMIhgzmqm1FylIiaHmI3lqY5W',
    'Employee Relations',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'HR004',
    'Arjun Reddy',
    'arjun.reddy@company.com',
    '$2b$12$MyiD5kC9ms0flvBeVmJhN.MLd5dD7VP0sC43XogiNsgbtPbbfxeXy',
    'Workforce Planning',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'HR005',
    'Meera Iyer',
    'meera.iyer@company.com',
    '$2b$12$NEOz1xdyLfh/K/s.DEXM4OC4oKWDIgyP2i.ikpsv2ApIc96VreYGm',
    'HR Operations',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'HR006', 'Vivek Rao', 'vivek.rao@company.com', '$2b$12$nch2JdzdL75TQmncNl1c..g5AzacRtbrwucPQShQCJH2EBqJpESu.',
    'Talent Development', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'HR007', 'Neha Kapoor', 'neha.kapoor@company.com', '$2b$12$nch2JdzdL75TQmncNl1c..g5AzacRtbrwucPQShQCJH2EBqJpESu.',
    'People Analytics', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'HR008', 'Sanjay Iyer', 'sanjay.iyer@company.com', '$2b$12$nch2JdzdL75TQmncNl1c..g5AzacRtbrwucPQShQCJH2EBqJpESu.',
    'Recruiting Operations', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'HR009', 'Kiran Joshi', 'kiran.joshi@company.com', '$2b$12$nch2JdzdL75TQmncNl1c..g5AzacRtbrwucPQShQCJH2EBqJpESu.',
    'Learning and Development', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    'HR010', 'Divya Menon', 'divya.menon@company.com', '$2b$12$nch2JdzdL75TQmncNl1c..g5AzacRtbrwucPQShQCJH2EBqJpESu.',
    'HR Compliance', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
);

INSERT INTO HR_REVIEW_DECISIONS
(
    DECISION_ID,
    MATCH_ID,
    HR_ID,
    DECISION,
    COMMENTS,
    OVERRIDE_REASON,
    CREATED_AT
)
VALUES

('DEC001', 'MATCH001', 'HR001', 'APPROVED',
 'Employee skills align well with the role requirements.',
 NULL, CURRENT_TIMESTAMP),

('DEC002', 'MATCH002', 'HR002', 'APPROVED',
 'Candidate demonstrates relevant technical experience.',
 NULL, CURRENT_TIMESTAMP),

('DEC003', 'MATCH003', 'HR003', 'REJECTED',
 'Candidate currently lacks some mandatory technical skills.',
 NULL, CURRENT_TIMESTAMP),

('DEC004', 'MATCH004', 'HR001', 'APPROVED',
 'Employee has relevant experience and transferable skills.',
 NULL, CURRENT_TIMESTAMP),

('DEC005', 'MATCH005', 'HR004', 'OVERRIDDEN',
 'Employee has demonstrated strong practical capabilities.',
 'HR approved the candidate despite a lower automated matching score after reviewing project evidence.',
 CURRENT_TIMESTAMP),

('DEC006', 'MATCH006', 'HR002', 'APPROVED',
 'Candidate meets the essential role requirements.',
 NULL, CURRENT_TIMESTAMP),

('DEC007', 'MATCH007', 'HR005', 'REJECTED',
 'Additional experience is required for this particular position.',
 NULL, CURRENT_TIMESTAMP),

('DEC008', 'MATCH008', 'HR003', 'OVERRIDDEN',
 'Employee has relevant skills despite having a career break.',
 'Career break was not considered a negative factor during the HR review.',
 CURRENT_TIMESTAMP),

('DEC009', 'MATCH009', 'HR001', 'APPROVED',
 'Candidate demonstrates suitable business and technical competencies.',
 NULL, CURRENT_TIMESTAMP),

('DEC010', 'MATCH010', 'HR004', 'APPROVED',
 'Candidate profile aligns with the department requirements.',
 NULL, CURRENT_TIMESTAMP),

('DEC011', 'MATCH011', 'HR002', 'REJECTED',
 'Candidate requires additional training in mandatory skills.',
 NULL, CURRENT_TIMESTAMP),

('DEC012', 'MATCH012', 'HR005', 'APPROVED',
 'Employee has demonstrated relevant experience through previous projects.',
 NULL, CURRENT_TIMESTAMP),

('DEC013', 'MATCH013', 'HR003', 'OVERRIDDEN',
 'Employee has strong transferable skills and relevant learning achievements.',
 'HR review identified relevant competencies not fully reflected in the automated matching score.',
 CURRENT_TIMESTAMP),

('DEC014', 'MATCH014', 'HR001', 'APPROVED',
 'Candidate meets the expected technical competency requirements.',
 NULL, CURRENT_TIMESTAMP),

('DEC015', 'MATCH015', 'HR004', 'REJECTED',
 'Candidate requires further development before being considered for this role.',
 NULL, CURRENT_TIMESTAMP);

INSERT INTO HR_AUDIT_LOGS
(
    HR_ID,
    ACTION,
    ENTITY_TYPE,
    ENTITY_ID,
    DETAILS,
    CREATED_AT
)
VALUES

('HR001', 'VIEW_MATCH', 'MATCH', 'MATCH001',
 'HR reviewed the employee-role matching recommendation.',
 CURRENT_TIMESTAMP),

('HR002', 'APPROVE_MATCH', 'MATCH', 'MATCH002',
 'HR approved the employee-role matching recommendation.',
 CURRENT_TIMESTAMP),

('HR003', 'REJECT_MATCH', 'MATCH', 'MATCH003',
 'HR rejected the recommendation due to missing mandatory skills.',
 CURRENT_TIMESTAMP),

('HR001', 'VIEW_EMPLOYEE', 'EMPLOYEE', 'EMP001',
 'HR viewed the employee profile and confirmed skills.',
 CURRENT_TIMESTAMP),

('HR004', 'OVERRIDE_MATCH', 'MATCH', 'MATCH005',
 'HR overrode the automated matching recommendation after reviewing project evidence.',
 CURRENT_TIMESTAMP),

('HR002', 'APPROVE_MATCH', 'MATCH', 'MATCH006',
 'HR approved the candidate after reviewing role requirements.',
 CURRENT_TIMESTAMP),

('HR005', 'REJECT_MATCH', 'MATCH', 'MATCH007',
 'HR rejected the recommendation because additional experience is required.',
 CURRENT_TIMESTAMP),

('HR003', 'OVERRIDE_MATCH', 'MATCH', 'MATCH008',
 'HR approved the employee despite a career break.',
 CURRENT_TIMESTAMP),

('HR001', 'REVIEW_BIAS_FLAG', 'BIAS_FLAG', 'FLAG001',
 'HR reviewed a career-break-related fairness alert.',
 CURRENT_TIMESTAMP),

('HR002', 'REVIEW_BIAS_FLAG', 'BIAS_FLAG', 'FLAG002',
 'HR reviewed a gender-related wording alert.',
 CURRENT_TIMESTAMP),

('HR003', 'UPDATE_BIAS_FLAG', 'BIAS_FLAG', 'FLAG003',
 'HR updated the review status of an age-related fairness alert.',
 CURRENT_TIMESTAMP),

('HR004', 'VIEW_JOB_ROLE', 'JOB_ROLE', 'JOB001',
 'HR viewed the job role requirements and eligibility criteria.',
 CURRENT_TIMESTAMP),

('HR005', 'UPDATE_JOB_ROLE', 'JOB_ROLE', 'JOB005',
 'HR updated the job role description and requirements.',
 CURRENT_TIMESTAMP),

('HR001', 'VIEW_INTERNAL_ROLE', 'INTERNAL_ROLE', 'ROLE001',
 'HR reviewed the backend engineering internal role.',
 CURRENT_TIMESTAMP),

('HR002', 'VIEW_EMPLOYEE', 'EMPLOYEE', 'EMP010',
 'HR reviewed employee competencies and career information.',
 CURRENT_TIMESTAMP),

('HR003', 'APPROVE_MATCH', 'MATCH', 'MATCH009',
 'HR approved the employee-role recommendation.',
 CURRENT_TIMESTAMP),

('HR004', 'REJECT_MATCH', 'MATCH', 'MATCH011',
 'HR rejected the recommendation because mandatory skills were missing.',
 CURRENT_TIMESTAMP),

('HR005', 'OVERRIDE_MATCH', 'MATCH', 'MATCH013',
 'HR approved the candidate based on transferable skills.',
 CURRENT_TIMESTAMP),

('HR001', 'VIEW_BIAS_REPORT', 'BIAS_FLAG', 'FLAG014',
 'HR accessed the fairness audit report.',
 CURRENT_TIMESTAMP),

('HR004', 'VIEW_MATCH', 'MATCH', 'MATCH015',
 'HR reviewed the matching score and recommendation details.',
 CURRENT_TIMESTAMP);

INSERT INTO AUDIT_LOGS
(
    LOG_TIMESTAMP,
    EMPLOYEE_ID,
    ACTOR,
    ACTION,
    TOOL,
    DETAILS
)
VALUES

(CURRENT_TIMESTAMP, 'EMP001', 'EMPLOYEE', 'PROFILE_UPDATED', 'EMPLOYEE_PORTAL',
 'Employee updated professional profile information.'),

(CURRENT_TIMESTAMP, 'EMP001', 'SYSTEM', 'SKILL_EXTRACTION_COMPLETED', 'LLM_SKILL_AGENT',
 'Skills extracted from the employee profile and saved as draft skills.'),

(CURRENT_TIMESTAMP, 'EMP001', 'EMPLOYEE', 'SKILLS_CONFIRMED', 'EMPLOYEE_PORTAL',
 'Employee reviewed and confirmed extracted skills.'),

(CURRENT_TIMESTAMP, 'EMP001', 'SYSTEM', 'PROFILE_CONFIRMED', 'PROFILE_AGENT',
 'Employee profile successfully confirmed.'),

(CURRENT_TIMESTAMP, 'EMP001', 'SYSTEM', 'MATCHING_COMPLETED', 'MATCHING_ENGINE',
 'Employee profile evaluated against available internal job roles.'),

(CURRENT_TIMESTAMP, 'EMP002', 'EMPLOYEE', 'PROFILE_UPDATED', 'EMPLOYEE_PORTAL',
 'Employee updated technical skills and experience information.'),

(CURRENT_TIMESTAMP, 'EMP002', 'SYSTEM', 'SKILL_EXTRACTION_COMPLETED', 'LLM_SKILL_AGENT',
 'Technical skills identified and mapped to the skill taxonomy.'),

(CURRENT_TIMESTAMP, 'EMP002', 'EMPLOYEE', 'SKILLS_CONFIRMED', 'EMPLOYEE_PORTAL',
 'Employee reviewed and confirmed extracted technical skills.'),

(CURRENT_TIMESTAMP, 'EMP002', 'SYSTEM', 'MATCHING_COMPLETED', 'MATCHING_ENGINE',
 'Employee evaluated for suitable internal opportunities.'),

(CURRENT_TIMESTAMP, 'EMP003', 'EMPLOYEE', 'PROFILE_UPDATED', 'EMPLOYEE_PORTAL',
 'Employee updated professional experience and project details.'),

(CURRENT_TIMESTAMP, 'EMP003', 'SYSTEM', 'SKILL_EXTRACTION_COMPLETED', 'LLM_SKILL_AGENT',
 'Relevant skills extracted from the updated employee profile.'),

(CURRENT_TIMESTAMP, 'EMP003', 'EMPLOYEE', 'SKILLS_CONFIRMED', 'EMPLOYEE_PORTAL',
 'Employee confirmed the extracted skill information.'),

(CURRENT_TIMESTAMP, 'EMP004', 'SYSTEM', 'PROFILE_CONFIRMED', 'PROFILE_AGENT',
 'Employee profile passed the profile confirmation process.'),

(CURRENT_TIMESTAMP, 'EMP004', 'SYSTEM', 'MATCHING_COMPLETED', 'MATCHING_ENGINE',
 'Matching engine generated internal role recommendations.'),

(CURRENT_TIMESTAMP, 'EMP005', 'EMPLOYEE', 'SKILL_ADDED', 'EMPLOYEE_PORTAL',
 'Employee manually added an additional technical skill.'),

(CURRENT_TIMESTAMP, 'EMP005', 'SYSTEM', 'SKILL_VALIDATION_COMPLETED', 'SKILL_VALIDATION_AGENT',
 'Employee-added skill checked against the skill taxonomy.'),

(CURRENT_TIMESTAMP, 'EMP006', 'SYSTEM', 'LEARNING_RECOMMENDED', 'LEARNING_AGENT',
 'Learning recommendations generated for identified skill gaps.'),

(CURRENT_TIMESTAMP, 'EMP007', 'EMPLOYEE', 'PROFILE_UPDATED', 'EMPLOYEE_PORTAL',
 'Employee updated career history and professional information.'),

(CURRENT_TIMESTAMP, 'EMP008', 'SYSTEM', 'MATCHING_COMPLETED', 'MATCHING_ENGINE',
 'Employee evaluated against available internal job opportunities.'),

(CURRENT_TIMESTAMP, 'EMP009', 'SYSTEM', 'SKILL_EXTRACTION_COMPLETED', 'LLM_SKILL_AGENT',
 'Skills extracted and categorized using the standardized taxonomy.'),

(CURRENT_TIMESTAMP, 'EMP010', 'EMPLOYEE', 'SKILLS_CONFIRMED', 'EMPLOYEE_PORTAL',
 'Employee reviewed and confirmed the skills listed in the portal.'),

(CURRENT_TIMESTAMP, 'EMP011', 'SYSTEM', 'LEARNING_RECOMMENDED', 'LEARNING_AGENT',
 'Recommended learning courses based on missing role skills.'),

(CURRENT_TIMESTAMP, 'EMP012', 'SYSTEM', 'MATCHING_COMPLETED', 'MATCHING_ENGINE',
 'Potential internal career opportunities identified.'),

(CURRENT_TIMESTAMP, 'EMP013', 'SYSTEM', 'PROFILE_CONFIRMED', 'PROFILE_AGENT',
 'Employee profile confirmation completed successfully.'),

(CURRENT_TIMESTAMP, 'EMP014', 'SYSTEM', 'SKILL_VALIDATION_COMPLETED', 'SKILL_VALIDATION_AGENT',
 'Employee skills validated against the standardized skill taxonomy.');

COMMIT;
