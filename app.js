const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  // default question here, just for temporary time
let questionsList = [
  {
    title: "Check children-sum property in a binary tree",
    difficultTag: "easy",
    topicsTag: ["array", "BinaryTree"],
    description: "Given the root of a binary tree, determine if the binary tree holds children-sum property. For a tree to satisfy the children-sum property, each node’s value should be equal to the sum of values at its left and right subtree."
  }, {
    title: "Check children-sum property in a binary tree",
    difficultTag: "easy",
    topicsTag: ["array", "BinaryTree"],
    description: "Given the root of a binary tree, determine if the binary tree holds children-sum property. For a tree to satisfy the children-sum property, each node’s value should be equal to the sum of values at its left and right subtree."
  }, {
    title: "Check children-sum property in a binary tree",
    difficultTag: "easy",
    topicsTag: ["array", "BinaryTree"],
    description: "Given the root of a binary tree, determine if the binary tree holds children-sum property. For a tree to satisfy the children-sum property, each node’s value should be equal to the sum of values at its left and right subtree."
  }, {
    title: "Check children-sum property in a binary tree",
    difficultTag: "easy",
    topicsTag: ["array", "BinaryTree"],
    description: "Given the root of a binary tree, determine if the binary tree holds children-sum property. For a tree to satisfy the children-sum property, each node’s value should be equal to the sum of values at its left and right subtree."
  }
];

  res.render("home", {
    questionsList
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
