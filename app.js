const express = require("express");
const bodyParser = require("body-parser");
const dbOperations = require(__dirname + "/dbOperations.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());

dbOperations.clientConnect();

// category Names
const categories = ["Array", "Binary Tree", "Dynamic Programming", "Graph", "Greedy", "Queue", "Stack", "String"];
const difficulties = ["Easy", "Medium", "Hard"]

// ROUTES //

// get All the questions
app.get("/", async function(req, res) {
  try {
    let questions = await dbOperations.readQuestions(["title", "difficulty", "tags", "explanation"]);
    res.render("home", {
      questionsList: questions.rows,
      categories: categories
    });
  } catch (err) {
    console.log(err);
  }
});

// Get all questions for a particular tag
app.get("/category/:categoryName", async function(req, res) {
  try {
    let categoryName = req.params.categoryName;
    let questions = await dbOperations.readQuesByTag(["title", "difficulty", "tags", "explanation"], [categoryName]);
    res.render("category", {
      categoryName: categoryName,
      questionsList: questions.rows,
      categories: categories
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/question/add-question", function(req, res) {
  res.render("createQuestion", {
    questionTitle: "Create Question",
    categories: categories
  });
});

// Get single question
app.get("/question/:questionTitle", async function(req, res) {
  let questionTitle = req.params.questionTitle;
  let question = await dbOperations.readSingleQues("*", [questionTitle]);
  res.render("question", {
    question: question.rows[0],
    categories: categories
  });
});

// Create a question
app.post("/admin", async function(req, res) {
  try {
    const dataObj = req.body;
    let questionPropertiesArr = [] ,questionValuesArr = [];
    for (const property in dataObj){
      questionPropertiesArr.push(property);
      let dataValue;
      if (property === "imageLinks") {
        dataValue = dataObj[property].split(' ');
      }
      else if (property === "tags") {
        dataValue = dataObj[property].split(',');
      } else {
        dataValue = dataObj[property];
      }
      questionValuesArr.push(dataValue);
    }

    console.log(questionPropertiesArr);
    console.log(questionValuesArr);
    await dbOperations.insertQuestion(questionPropertiesArr, questionValuesArr);
  } catch (err) {
    console.log(err);
  }
  res.redirect(301, "/question/add-question");
});

const server = app.listen(3000, function() {
  console.log("Server started on port 3000");
});

process.stdin.resume(); //so the program will not close instantly

async function exitHandler(options, exitCode) {
  await dbOperations.clientDisConnect();
  if (options.cleanup) console.log('clean');
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
