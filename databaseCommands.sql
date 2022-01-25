CREATE DATABASE algointutions
    WITH 
    OWNER = admin64
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

-- Table: public.questions

-- DROP TABLE IF EXISTS public.questions;

CREATE TABLE IF NOT EXISTS public.questions
(
    question_id SERIAL PRIMARY KEY NOT NULL, 
    title character varying COLLATE pg_catalog."default" NOT NULL,
    difficulty integer DEFAULT 0,
    explanation text COLLATE pg_catalog."default",
    intuition text COLLATE pg_catalog."default",
    approach text COLLATE pg_catalog."default",
    imageLinks character varying[] COLLATE pg_catalog."default",
    codeCpp text COLLATE pg_catalog."default",
    codeJava text COLLATE pg_catalog."default",
    codePython text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    numLikes integer DEFAULT 0,
    tags character varying[] COLLATE pg_catalog."default"
);

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.questions
    OWNER to admin64;

SELECT * FROM questions;

-- Granting priveleges in ubuntu
GRANT ALL PRIVILEGES ON TABLE questions TO admin64;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin64;