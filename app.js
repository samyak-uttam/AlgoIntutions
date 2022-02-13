const express = require('express');
const bodyParser = require('body-parser');
const dbOperations = require(__dirname + '/utils/dbOperations.js');
var favicon = require('serve-favicon');
const bcrypt = require('bcryptjs');
const { protect } = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
var path = require('path');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

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
  'String'
];
const difficulties = ['Easy', 'Medium', 'Hard'];
const diffColors = {
  Easy: '#5cb85b',
  Medium: '#ffa116',
  Hard: '#d9534e'
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

    const { page, limit, startIndex, pagination } = getPaginationDataObject(
      req,
      total
    );

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
      backgroundColors: getBackgroundColors(questions.rows)
    });
  } catch (err) {
    console.log(err);
  }
});

// Get all questions for a particular difficulty level
app.get('/tag/:difficulty', async function (req, res) {
  try {
    let difficulty = req.params.difficulty;
    let total = await dbOperations.readQuestionByDifficultyTotalCount(
      difficulty
    );
    total = total.rows[0].count;

    const { pagination, startIndex, limit, page } = getPaginationDataObject(
      req,
      total
    );

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
      backgroundColors: getBackgroundColors(questions.rows)
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

    const { pagination, startIndex, limit, page } = getPaginationDataObject(
      req,
      total
    );

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
      backgroundColors: getBackgroundColors(questions.rows)
    });
  } catch (err) {
    console.log(err);
  }
});

// Get single question
app.get('/question/:questionTitle', async function (req, res) {
  try {
    let questionTitle = req.params.questionTitle;
    questionArr = [];
    let question = await dbOperations.readSingleQues('*', [questionTitle]);
    question = question.rows[0];
    questionArr.push(question);
    if (typeof question.continuedid != 'null') {
      while (question.continuedid != null) {
        question = await dbOperations.readQuesById(
          [
            'examples',
            'exImageLinks',
            'intuition',
            'approach',
            'imageLinks',
            'codeCpp',
            'codeJava',
            'codePython',
            'description',
            'continuedId'
          ],
          [question.continuedid]
        );
        question = question.rows[0];
        questionArr.push(question);
      }
    }
    if (questionArr[0].length === 0) {
      res.redirect(301, '/questionNotFound');
    } else {
      res.render('question', {
        questionArr: questionArr,
        categories: categories,
        backgroundColor: diffColors[questionArr[0].difficulty]
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// Register Route
app.get('/admin/register', function (req, res) {
  res.render('register');
});

app.post('/admin/register', async function (req, res) {
  let { name, email, password, password2 } = req.body;

  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: 'Please enter all fields' });
  }

  if (password.length < 6) {
    errors.push({ message: 'Password should be at least 6 characters' });
  }

  if (password != password2) {
    errors.push({ message: 'Passwords do not match' });
  }

  if (errors.length !== 0) {
    res.render('register', {
      errors
    });
  } else {
    try {
      const isUserExists = await dbOperations.checkUserExists(email);
      if (isUserExists.rows.length > 0) {
        errors.push({ message: 'Email already registered, Please login' });
        return res.render('register', {
          errors
        });
      }

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      const user = await dbOperations.createUser(
        ['name', 'email', 'password'],
        [name, email, password]
      );

      let userObj = JSON.stringify(user.rows[0]);
      userObj = JSON.parse(userObj);
      sendTokenResponse(res, userObj.user_id);
    } catch (err) {
      console.log(err);
    }
  }
});

// Login Route
app.get('/admin/login', function (req, res) {
  res.render('login');
});

app.post('/admin/login', async function (req, res) {
  const { email, password } = req.body;

  let errors = [];

  if (!email || !password) {
    errors.push({ message: 'Please provide an email and password' });
  }

  const isUserExists = await dbOperations.checkUserExists(email);

  if (isUserExists.rows.length == 0) {
    errors.push({ message: 'Invalid credentials' });
    return res.render('login', { errors });
  }

  let userObj = JSON.stringify(isUserExists.rows[0]);
  userObj = JSON.parse(userObj);
  console.log(userObj);

  const isPasswordMatch = await bcrypt.compare(password, userObj.password);

  if (!isPasswordMatch) {
    errors.push({ message: 'Passwords do not match!' });
    return res.render('login', { errors });
  }

  sendTokenResponse(res, userObj.user_id);
});

app.get('/admin/add-question', protect, function (req, res) {
  res.render('createQuestion', {
    questionTitle: 'Create Question',
    categories: categories
  });
});

app.get('/admin/update-question', protect, async function (req, res) {
  const columns = ['question_id', 'title', 'explanation'];
  try {
    const questions = await dbOperations.readQuestions(columns);
    res.render('updatePageQuestions', {
      questionsList: questions.rows,
      categories: categories
    });
  } catch (err) {
    console.log(err);
  }
});

app.get('/admin/update-question/:id', protect, async function (req, res) {
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
    categories: categories
  });
});

// page Not found
app.get('/:anyOtherUrl', function (req, res) {
  res.render('pageNotFound', {
    categories: categories
  });
});

// POST ROUTES
app.post('/admin', protect, async function (req, res) {
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

// PUT ROUTES
// Update question
app.put('/admin/:id', protect, async function (req, res) {
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
  res.redirect(301, '/admin/update-question');
});

app.delete('/admin/:id', protect, async function (req, res) {
  try {
    const { id } = req.params;
    await dbOperations.deleteQuestion(id);
  } catch (err) {
    console.log(err);
  }
  res.redirect(301, '/admin/update-question');
});

app.get('/:anyOtherUrl', function (req, res) {
  res.render('pageNotFound', {
    categories: categories
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
const server = app.listen(port, function () {
  console.log('Server has started successfully.');
});

// Util functions
function getPaginationDataObject(req, total) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
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
    if (property === "exImageLinks") {
      dataValue = dataObj[property].split(' ');
    } else if (property === "imageLinks") {
      dataValue = dataObj[property].split(' ');
    } else if (property === "tags") {
      dataValue = dataObj[property].split(',');
    } else {
      dataValue = dataObj[property];
    }
    if (dataValue === "") {
      questionValuesArr.push(null);
    } else {
      questionValuesArr.push(dataValue);
    }
  }
  console.log(questionPropertiesArr);
  console.log(questionValuesArr);

  return {
    questionPropertiesArr,
    questionValuesArr
  };
}

const sendTokenResponse = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res // Force break
    .cookie('token', token, options)
    .redirect('/');
};

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
