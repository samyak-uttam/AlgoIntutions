const {Client} = require('pg');
const client = new Client({
  user: "postgres",
  host: "localhost",
  password: "postgres",
  port: 5432,
  database: "algointutions"
});

exports.clientConnect = clientConnect;
async function clientConnect() {
  await client.connect();
  console.log("Client connected successfully.");
}

exports.clientDisConnect = clientDisConnect;
async function clientDisConnect() {
  await client.end();
  console.log("Client disconnected successfully.");
}

exports.readQuesByTag = readQuesByTag;
async function readQuesByTag(columns, tag) {
  let res;
  await client.query("SELECT " + columns + " from questions where ($1) = ANY(tags)", tag)
    .then(results => res = results)
    .catch(e => console.log("Error occured during reading: " + e));
  return res;
}

exports.readQuestions = readQuestions;
async function readQuestions(columns) {
  let res;
  await client.query("SELECT " + columns + " from questions")
    .then(results => res = results)
    .catch(e => console.log("Error occured during reading: " + e));
  return res;
}

async function insertQuestion(questionArr) {
  await client.query("INSERT INTO questions VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)", questionArr)
    .then(() => console.log("Question inserted successfully."))
    .catch(e => console.log("Error occured during insertion: " + e));
}
