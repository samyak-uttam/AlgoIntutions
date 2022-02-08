const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// To connect Locally
const client = new Client({
  // comment my credentials for development :)
  user: 'admin64',
  host: 'localhost',
  password: '751101@admin',
  port: 5432,
  database: 'algointutions'
});

async function clientConnect() {
  try {
    await client.connect();
    console.log('Client connected successfully.');
  } catch (err) {
    console.log(err);
  }
}

async function clientDisConnect() {
  try {
    await client.end();
    console.log('Client disconnected successfully.');
  } catch (err) {
    console.log(err);
  }
}

async function readQuestions(columns) {
  try {
    const allQuestions = await client.query(
      'SELECT ' + columns + ' from questions'
    );
    return allQuestions;
  } catch (err) {
    console.log(err);
  }
}

async function getAllQuestionsCount() {
  try {
    const questionsTableLength = await client.query(
      'SELECT COUNT(question_id) FROM questions WHERE title IS NOT NULL'
    );
    return questionsTableLength;
  } catch (err) {
    console.log(err);
  }
}

async function readQuestionsOfHomePage(columns, paginationArr) {
  try {
    let questions = await client.query(
      'SELECT ' +
        columns +
        ' FROM questions WHERE title IS NOT NULL LIMIT $1 OFFSET $2',
      paginationArr
    );
    return questions;
  } catch (err) {
    console.log(err);
  }
}

async function readQuesByTagTotalCount(tag) {
  try {
    const taggedQuestions = await client.query(
      'SELECT COUNT(question_id) FROM questions WHERE ($1) = ANY(tags)',
      [tag]
    );
    return taggedQuestions;
  } catch (err) {
    console.log(err);
  }
}

async function readQuesByTag(columns, tag, paginationArr) {
  try {
    const taggedQuestions = await client.query(
      'SELECT ' +
        columns +
        ' from questions where ($1) = ANY(tags) LIMIT $2 OFFSET $3',
      [tag, ...paginationArr]
    );
    return taggedQuestions;
  } catch (err) {
    console.log(err);
  }
}

async function readQuestionByDifficultyTotalCount(difficulty) {
  try {
    const questionCount = await client.query(
      'SELECT COUNT(question_id) FROM questions WHERE difficulty = $1',
      [difficulty]
    );
    return questionCount;
  } catch (err) {
    console.log(err);
  }
}

async function readQuesByDifficulty(columns, difficulty, paginationArr) {
  try {
    const questions = await client.query(
      'SELECT ' +
        columns +
        ' FROM questions WHERE difficulty = $1 LIMIT $2 OFFSET $3',
      [difficulty, ...paginationArr]
    );
    return questions;
  } catch (err) {
    console.log(err);
  }
}

async function readQuesById(columns, questionId) {
  try {
    const question = await client.query(
      'SELECT ' + columns + ' from questions where question_id = ($1)',
      questionId
    );
    return question;
  } catch (err) {
    console.log(err);
  }
}

async function readSingleQues(columns, title) {
  try {
    const question = await client.query(
      'SELECT ' + columns + ' from questions where title = ($1)',
      title
    );
    return question;
  } catch (err) {
    console.log(err);
  }
}

async function getAllFieldsSingleQuestion(id) {
  try {
    const questionDetails = await client.query(
      'SELECT * FROM questions WHERE question_id = $1',
      [id]
    );
    return questionDetails;
  } catch (err) {
    console.log(err);
  }
}

async function insertQuestion(questionPropertiesArr, questionValuesArr) {
  try {
    await client.query(
      'INSERT INTO questions (' +
        questionPropertiesArr +
        ') VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      questionValuesArr
    );
    console.log('Question inserted successfully!');
  } catch (err) {
    console.log(err);
  }
}

async function deleteQuestion(id) {
  try {
    await client.query('DELETE FROM questions WHERE question_id = $1', [id]);
    console.log('Question deleted successfully!');
  } catch (err) {
    console.log(err);
  }
}

async function updateQuestion(id, questionPropertiesArr, questionValuesArr) {
  let i = 0;
  for (; i < questionPropertiesArr.length; i++) {
    let tempString = questionPropertiesArr[i] + '=$' + `${i + 1}`;
    questionPropertiesArr[i] = tempString;
  }
  const idStringInject = '$' + `${i + 1}`;

  try {
    await client.query(
      'UPDATE questions SET ' +
        questionPropertiesArr +
        ' WHERE question_id = ' +
        idStringInject,
      [...questionValuesArr, id]
    );
    console.log('Question Updated Successfully!');
  } catch (err) {
    console.log(err);
  }
}

async function checkUserExists(email) {
  try {
    const userAlreadyExists = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return userAlreadyExists;
  } catch (err) {
    console.log(err);
  }
}

async function createUser(columns, values) {
  try {
    console.log(columns, values);
    await client.query(
      'INSERT INTO users (' + columns + ') VALUES ($1, $2, $3)',
      values
    );
    console.log('User Inserted successfully!');
    const userInserted = await client.query(
      'SELECT user_id from users WHERE email = $1',
      [values[1]]
    );
    return userInserted;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  clientConnect,
  clientDisConnect,
  getAllQuestionsCount,
  readQuesById,
  readSingleQues,
  readQuestions,
  readQuestionByDifficultyTotalCount,
  readQuesByDifficulty,
  readQuestionsOfHomePage,
  readQuesByTagTotalCount,
  readQuesByTag,
  insertQuestion,
  deleteQuestion,
  getAllFieldsSingleQuestion,
  updateQuestion,
  checkUserExists,
  createUser
};
