CREATE DATABASE algointutions
    WITH
    OWNER = admin64
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

-- Table: public.questions

-- DROP TABLE IF EXISTS public.questions;

CREATE TABLE public.questions
(
    question_id serial NOT NULL,
    title character varying NOT NULL,
    difficulty character varying NOT NULL,
    explanation text NOT NULL,
    intuition text,
    approach text,
    imageLinks character varying[],
    codeCpp text,
    codeJava text,
    codePython text,
    description text,
    numLikes integer DEFAULT 0,
    tags character varying[],
    PRIMARY KEY (question_id)
);

ALTER TABLE IF EXISTS public.questions
    OWNER to admin64;

SELECT * FROM questions;

-- Granting priveleges in ubuntu
GRANT ALL PRIVILEGES ON TABLE questions TO admin64;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin64;
