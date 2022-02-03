const express = require('express');
const bodyParser = require('body-parser');
const dbOperations = require(__dirname + '/dbOperations.js');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

dbOperations.clientConnect();

// category Names
const categories = [
  'Array',
  'Binary Tree',
  'Dynamic Programming',
  'Graph',
  'Greedy',
  'Queue',
  'Stack',
  'String',
];
const difficulties = ['Easy', 'Medium', 'Hard'];
const diffColors = {
  Easy: '#5cb85b',
  Medium: '#ffa116',
  Hard: '#d9534e',
};

app.use(function (req, res, next) {
  if (req.query._method == 'DELETE') {
    req.method = 'DELETE';
    req.url = req.path;
  } else if (req.query._method == 'PUT') {
    req.method = 'PUT';
    req.url = req.path;
  }
  next();
});

// GET ROUTES
// get All the questions
app.get('/', async function (req, res) {
  try {
    let total = await dbOperations.getAllQuestionsCount();
    total = total.rows[0].count;

    const { page, limit, startIndex, pagination } = getPaginationDataObject(req, total);

    questions = await dbOperations.readQuestionsOfHomePage(
      ['title', 'difficulty', 'tags', 'explanation'],
      [limit, startIndex]
    );
    res.render('home', {
      questionsList: questions.rows,
      count: questions.rows.length,
      categories: categories,
      pagination,
      path: req.path,
      currentPage: page,
      totalPages: total / limit,
      backgroundColors: getBackgroundColors(questions.rows),
    });
  } catch (err) {
    console.log(err);
  }
});

// Get all questions for a particular difficulty level
app.get('/tag/:difficulty', async function (req, res) {
  try {
    let difficulty = req.params.difficulty;
    let total = await dbOperations.readQuestionByDifficultyTotalCount(difficulty);
    total = total.rows[0].count;

    const { pagination, startIndex, limit, page } = getPaginationDataObject(req, total);

    let questions = await dbOperations.readQuesByDifficulty(
      ['title', 'difficulty', 'tags', 'explanation'],
      difficulty,
      [limit, startIndex]
    );

    res.render('category', {
      categoryName: difficulty,
      questionsList: questions.rows,
      categories: categories,
      pagination,
      path: req.path,
      currentPage: page,
      totalPages: total / limit,
      backgroundColors: getBackgroundColors(questions.rows),
    });
  } catch (err) {
    console.log(err);
  }
});

// Get all questions for a particular tag
app.get('/category/:categoryName', async function (req, res) {
  try {
    let categoryName = req.params.categoryName;
    let total = await dbOperations.readQuesByTagTotalCount(categoryName);
    if (total === undefined) {
      return res.redirect(301, '/questionNotFound');
    }
    total = total.rows[0].count;

    const { pagination, startIndex, limit, page } = getPaginationDataObject(req, total);

    let questions = await dbOperations.readQuesByTag(
      ['title', 'difficulty', 'tags', 'explanation'],
      categoryName,
      [limit, startIndex]
    );

    res.render('category', {
      categoryName: categoryName,
      questionsList: questions.rows,
      categories: categories,
      pagination,
      path: req.path,
      currentPage: page,
      totalPages: total / limit,
      backgroundColors: getBackgroundColors(questions.rows),
    });
  } catch (err) {
    console.log(err);
  }
});

// Get single question
app.get('/question/:questionTitle', async function (req, res) {
  try {
    let questionTitle = req.params.questionTitle;
    let question = await dbOperations.readSingleQues('*', [questionTitle]);
    if (question.rows.length === 0) {
      res.redirect(301, '/questionNotFound');
    } else {
      res.render('question', {
        question: question.rows[0],
        categories: categories,
        backgroundColor: diffColors[question.rows[0].difficulty],
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// Create a question
app.get('/admin/add-question', function (req, res) {
  res.render('createQuestion', {
    questionTitle: 'Create Question',
    categories: categories,
  });
});

// Update questions page
app.get('/admin/update-question', async function (req, res) {
  const columns = ['question_id', 'title', 'explanation'];
  try {
    const questions = await dbOperations.readQuestions(columns);
    res.render('updatePageQuestions', {
      questionsList: questions.rows,
      categories: categories,
    });
  } catch (err) {
    console.log(err);
  }
});

// Update a single question
app.get('/admin/update-question/:id', async function (req, res) {
  const { id } = req.params;
  let question, imageLinksValue;
  try {
    question = await dbOperations.getAllFieldsSingleQuestion(id);
    imageLinksValue = question.rows[0].imagelinks.join(' ');
  } catch (err) {
    console.log(err);
  }

  res.render('updateQuestionForm', {
    question: question.rows[0],
    imageLinks: imageLinksValue,
    categories: categories,
  });
});

// page Not found
app.get('/:anyOtherUrl', function (req, res) {
  res.render('pageNotFound', {
    categories: categories,
  });
});

// POST ROUTES
app.post('/admin', async function (req, res) {
  try {
    const dataObj = req.body;
    const { questionPropertiesArr, questionValuesArr } =
      getBodyPropertiesAndValues(dataObj);

    await dbOperations.insertQuestion(questionPropertiesArr, questionValuesArr);
  } catch (err) {
    console.log(err);
  }
  res.redirect(301, '/admin/add-question');
});

app.get('/admin/update-question', async function (req, res) {
  const columns = ['question_id', 'title', 'explanation'];
  try {
    const questions = await dbOperations.readQuestions(columns);
    res.render('updatePageQuestions', {
      questionsList: questions.rows,
      categories: categories,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get('/admin/update-question/:id', async function (req, res) {
  const { id } = req.params;
  let question, imageLinksValue;
  try {
    question = await dbOperations.getAllFieldsSingleQuestion(id);
    imageLinksValue = question.rows[0].imagelinks.join(' ');
  } catch (err) {
    console.log(err);
  }

  res.render('updateQuestionForm', {
    question: question.rows[0],
    imageLinks: imageLinksValue,
    categories: categories,
  });
});

// PUT ROUTES
// Update question
app.put('/admin/:id', async function (req, res) {
  try {
    const { id } = req.params;
    const dataObj = req.body;
    const { questionPropertiesArr, questionValuesArr } =
      getBodyPropertiesAndValues(dataObj);

    await dbOperations.updateQuestion(
      id,
      questionPropertiesArr,
      questionValuesArr
    );
  } catch (err) {
    console.log(err);
  }
  // Not redirecting properly
  res.redirect(301, '/admin/update-question');
});

// DELETE ROUTES
// delete question
app.delete('/admin/:id', async function (req, res) {
  try {
    const { id } = req.params;
    await dbOperations.deleteQuestion(id);
  } catch (err) {
    console.log(err);
  }
  // Not redirecting properly
  res.redirect(301, '/admin/update-question');
});

// page Not found
app.get('/:anyOtherUrl', function (req, res) {
  res.render('pageNotFound', {
    categories: categories,
  });
});

const server = app.listen(3000, function () {
  console.log('Server started on port 3000');
});

// Util functions
function getPaginationDataObject(req, total) {
  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  return { page, limit, startIndex, endIndex, pagination };
}

function getBackgroundColors(questions) {
  let backColors = [];
  questions.forEach(function (question) {
    backColors.push(diffColors[question.difficulty]);
  });
  return backColors;
}

function getBodyPropertiesAndValues(dataObj) {
  let questionPropertiesArr = [],
    questionValuesArr = [];

  for (const property in dataObj) {
    questionPropertiesArr.push(property);
    let dataValue;
    if (property === 'imageLinks') {
      dataValue = dataObj[property].split(' ');
    } else if (property === 'tags') {
      dataValue = dataObj[property].split(',');
    } else {
      dataValue = dataObj[property];
    }
    questionValuesArr.push(dataValue);
  }

  return {
    questionPropertiesArr,
    questionValuesArr,
  };
}

process.stdin.resume(); //so the program will not close instantly

async function exitHandler(options, exitCode) {
  await dbOperations.clientDisConnect();
  if (options.cleanup) console.log('clean');
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
