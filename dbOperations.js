const {Client} = require('pg');
const client = new Client({
  // comment my credentials for development :)
  user: "postgres",
  host: "localhost",
  password: "postgres",
  port: 5432,
  database: "algointutions"
});

async function clientConnect() {
  try {
    await client.connect();
    console.log("Client connected successfully.");
  } catch (err) {
    console.log(err)
  }
}

async function clientDisConnect() {
  try {
    await client.end();
    console.log("Client disconnected successfully.");
  } catch (err) {
    console.log(err);
  }
}

async function readSingleQues(columns, title) {
  try {
    const question = await client.query("SELECT " + columns + " from questions where title = ($1)", title);
    return question;
  } catch (err) {
    console.log(err);
  }
}

async function readQuestions(columns) {
  try {
    const allQuestions = await client.query("SELECT " + columns + " from questions");
    return allQuestions;
  } catch (err) {
    console.log(err);
  }
}

async function readQuesByTag(columns, tag) {
  try {
    const taggedQuestions = await client.query("SELECT " + columns + " from questions where ($1) = ANY(tags)", tag);
    return taggedQuestions;
  } catch (err) {
    console.log(err);
  }
}

async function readQuesByDifficulty(columns, difficulty) {
  try {
    const questions = await client.query("SELECT " + columns + " from questions where difficulty = ($1)", difficulty);
    return questions;
  } catch (err) {
    console.log(err);
  }
}

async function insertQuestion(questionPropertiesArr, questionValuesArr) {
  try {
    await client.query("INSERT INTO questions ("+ questionPropertiesArr +") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)", questionValuesArr);
    console.log('Question inserted successfully!');
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  clientConnect,
  clientDisConnect,
  readSingleQues,
  readQuestions,
  readQuesByDifficulty,
  readQuesByTag,
  insertQuestion
}
