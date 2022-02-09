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
    examples text,
    exImageLinks character varying[],
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

-- users table for authorizing private routes
CREATE TYPE valid_roles AS ENUM ('user', 'admin');

CREATE TABLE users (
    user_id serial NOT NULL PRIMARY KEY,
    name varchar(200) NOT NULL,
    email varchar(200) NOT NULL,
    password varchar(200) NOT NULL,
    role valid_roles DEFAULT 'user',
    unique(email)
);

SELECT * FROM users;
