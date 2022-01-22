const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// default question here, just for temporary time
let questionsList = [{
  title: "Check children-sum property in a binary tree",
  difficultTag: "Easy",
  topicsTag: ["array", "BinaryTree"],
  description: "Given the root of a binary tree, determine if the binary tree holds children-sum property. For a tree to satisfy the children-sum property, each node’s value should be equal to the sum of values at its left and right subtree."
}, {
  title: "Check children-sum property in a binary tree",
  difficultTag: "Hard",
  topicsTag: ["array", "BinaryTree"],
  description: "Given the root of a binary tree, determine if the binary tree holds children-sum property. For a tree to satisfy the children-sum property, each node’s value should be equal to the sum of values at its left and right subtree."
}, {
  title: "Check children-sum property in a binary tree",
  difficultTag: "Medium",
  topicsTag: ["array", "BinaryTree"],
  description: "Given the root of a binary tree, determine if the binary tree holds children-sum property. For a tree to satisfy the children-sum property, each node’s value should be equal to the sum of values at its left and right subtree."
}, {
  title: "Check children-sum property in a binary tree",
  difficultTag: "Easy",
  topicsTag: ["array", "BinaryTree"],
  description: "Given the root of a binary tree, determine if the binary tree holds children-sum property. For a tree to satisfy the children-sum property, each node’s value should be equal to the sum of values at its left and right subtree."
}];

// category Names
let categories = ["Array", "Binary Tree", "Dynamic Programming", "Graph", "Greedy", "Queue", "Stack", "String"];

app.get("/", function(req, res) {
  res.render("home", {
    questionsList: questionsList, categories: categories
  });
});

app.get("/category/:categoryName", function(req, res) {
  let categoryName = req.params.categoryName;
  res.render("category", {
    categoryName: categoryName, questionsList: questionsList, categories: categories
  });
});

app.get("/:questionTitle", function(req, res) {
  let questionTitle = req.params.questionTitle;
  res.render("question", {
    questionTitle: questionTitle, categories: categories
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
