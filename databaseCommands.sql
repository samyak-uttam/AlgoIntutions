CREATE DATABASE algointutions
    WITH 
    OWNER = admin64
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

-- Table: public.questions

-- DROP TABLE IF EXISTS public.questions;

CREATE TABLE IF NOT EXISTS public.questions
(
    id integer NOT NULL,
    title character varying COLLATE pg_catalog."default" NOT NULL,
    difficulty integer DEFAULT 0,
    explanation text COLLATE pg_catalog."default",
    intuition text COLLATE pg_catalog."default",
    approach text COLLATE pg_catalog."default",
    "images-links" character varying[] COLLATE pg_catalog."default",
    "code-c++" text COLLATE pg_catalog."default",
    "code-java" text COLLATE pg_catalog."default",
    "code-python" text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    "num-likes" integer DEFAULT 0,
    tags character varying[] COLLATE pg_catalog."default",
    CONSTRAINT "Questions_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.questions
    OWNER to admin64;

SELECT * FROM questions;


