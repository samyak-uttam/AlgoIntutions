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

app.use(function(req, res, next) {
  if (req.query._method == 'DELETE') {
    req.method = 'DELETE';
    req.url = req.path;
  } else if (req.query._method == 'PUT') {
    req.method = 'PUT';
    req.url = req.path;
  }      
  next(); 
});

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

// Get all questions for a particular difficulty level
app.get("/tag/:difficulty", async function(req, res) {
  try {
    let difficulty = req.params.difficulty;
    let questions = await dbOperations.readQuesByDifficulty(["title", "difficulty", "tags", "explanation"], [difficulty]);
    res.render("category", {
      categoryName: difficulty,
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

// Get single question
app.get("/question/:questionTitle", async function(req, res) {
  let questionTitle = req.params.questionTitle;
  console.log(questionTitle);
  let question = await dbOperations.readSingleQues("*", [questionTitle]);
  res.render("question", {
    question: question.rows[0],
    categories: categories
  });
});

// Create a question
app.get("/admin/add-question", function(req, res) {
  res.render("createQuestion", {
    questionTitle: "Create Question",
    categories: categories
  });
});

app.post("/admin", async function(req, res) {
  try {
    const dataObj = req.body;
    const {questionPropertiesArr, questionValuesArr} = getBodyPropertiesAndValues(dataObj);

    await dbOperations.insertQuestion(questionPropertiesArr, questionValuesArr);
  } catch (err) {
    console.log(err);
  }
  res.redirect(301, "/admin/add-question");
});

app.get("/admin/update-question", async function(req, res) {
  // bring all the question and display it to the user
  const columns = ["question_id", "title", "explanation"];
  try {
    const questions = await dbOperations.readQuestions(columns);
    console.log(questions);
    res.render("updatePageQuestions", {
      questionsList: questions.rows,
      categories: categories
    });
  } catch (err) {
    console.log(err); 
  }
});

app.get("/admin/update-question/:id", async function(req, res) {
  const {id} = req.params;
  let question;
  try {
    question = await dbOperations.getAllFieldsSingleQuestion(id);
  } catch (err) {
    console.log(err);
  }
  
  console.log(question.rows[0]);
  res.render("updateQuestionForm", {
    question: question.rows[0],
    categories: categories
  });
});

// Update question
app.put("/admin/:id", async function(req, res) {
  const {id} = req.params;
  try {
    const dataObj = req.body;
    const {questionPropertiesArr, questionValuesArr} = getBodyPropertiesAndValues(dataObj);
    
    await dbOperations.updateQuestion(id, questionPropertiesArr, questionValuesArr);
  } catch (err) {
    console.log(err);
  }

  res.redirect(201, '/admin/update-question');
})

// delete question
app.delete("/admin/:id", async function(req, res) {
  const {id} = req.params;
  try {
    await dbOperations.deleteQuestion(id);
  } catch (err) {
    console.log(err);
  }

  res.redirect(202, '/admin/update-question');
})

// page Not found
app.get("/404", function(req, res) {
  res.render("404", {
    categories: categories
  });
})

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

function getBodyPropertiesAndValues(dataObj, isSplit = true) {
  let questionPropertiesArr = [] ,questionValuesArr = [];

  for (const property in dataObj){
    questionPropertiesArr.push(property);
    let dataValue;
    if (isSplit && property === "imageLinks") {
      dataValue = dataObj[property].split(' ');
    }
    else if (isSplit && property === "tags") {
      dataValue = dataObj[property].split(',');
    } else {
      dataValue = dataObj[property];
    }
    questionValuesArr.push(dataValue);
  }

  return {
    questionPropertiesArr,
    questionValuesArr
  }
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
