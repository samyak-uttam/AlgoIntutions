const {Client} = require('pg');
const client = new Client({
  // comment my credentials for development :)
  user: "admin64",
  host: "localhost",
  password: "751101@admin",
  port: 5432,
  database: "algointutions"
});

async function clientConnect() {
  try {
    await client.connect();
    console.log("Client connected successfully.");
  } catch (err) {
    console.error(err.message)
  }
}

async function clientDisConnect() {
  try {
    await client.end();
    console.log("Client disconnected successfully.");
  } catch (err) {
    console.error(err.message);
  }
}

async function readQuestions(columns) {
  try {
    const allQuestions = await client.query("SELECT " + columns + " from questions");
    return allQuestions;
  } catch (err) {
    console.error(err.message);
  }
}

async function readQuesByTag(columns, tag) {
  try {
    const singleQuestion = await client.query("SELECT " + columns + " from questions where ($1) = ANY(tags)", tag);
    return singleQuestion;
  } catch (err) {
    console.error(err.message);
  }
}

async function insertQuestion(questionArr) {
  await client.query("INSERT INTO questions VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)", questionArr)
    .then(() => console.log("Question inserted successfully."))
    .catch(e => console.log("Error occured during insertion: " + e));
}

module.exports = {
  clientConnect,
  clientDisConnect,
  readQuesByTag,
  readQuestions,
  insertQuestion
}
