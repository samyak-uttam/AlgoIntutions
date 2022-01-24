const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dbOperations = require(__dirname + "/dbOperations.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

dbOperations.clientConnect();

// category Names
const categories = ["Array", "Binary Tree", "Dynamic Programming", "Graph", "Greedy", "Queue", "Stack", "String"];
const difficulties = ["Easy", "Medium", "Hard"]

app.get("/", async function(req, res) {
  let list = await dbOperations.readQuestions(["title", "difficulty", "tags", "explanation"]);
  let questions = [];
  list.rows.forEach(function(ques) {
    questions.push({
      title: ques.title,
      difficultTag: difficulties[ques.difficulty],
      topicsTag: ques.tags,
      description: ques.explanation
    });
  });
  res.render("home", {
    questionsList: questions,
    categories: categories
  });
});

app.get("/category/:categoryName", async function(req, res) {
  let categoryName = req.params.categoryName;
  let list = await dbOperations.readQuesByTag(["title", "difficulty", "tags", "explanation"], ['array']);
  let questions = [];
  list.rows.forEach(function(ques) {
    questions.push({
      title: ques.title,
      difficultTag: difficulties[ques.difficulty],
      topicsTag: ques.tags,
      description: ques.explanation
    });
  });
  res.render("category", {
    categoryName: categoryName,
    questionsList: questions,
    categories: categories
  });
});

app.get("/:questionTitle", function(req, res) {
  let questionTitle = req.params.questionTitle;
  res.render("question", {
    questionTitle: questionTitle,
    categories: categories
  });
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
