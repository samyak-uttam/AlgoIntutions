CREATE DATABASE algointutions
    WITH
    OWNER = admin64
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

-- Table: public.questions

DROP TABLE IF EXISTS public.questions;

CREATE TABLE public.questions
(
    question_id serial NOT NULL,
    title character varying,
    difficulty character varying,
    explanation text,
    intuition text,
    approach text,
    imageLinks character varying[],
    codeCpp text,
    codeJava text,
    codePython text,
    description text,
    numLikes integer DEFAULT 0,
    tags character varying[],
    continuedId integer,
    PRIMARY KEY (question_id)
);

ALTER TABLE IF EXISTS public.questions
    OWNER to admin64;

SELECT * FROM questions;

-- Granting priveleges in ubuntu
GRANT ALL PRIVILEGES ON TABLE questions TO admin64;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin64;
