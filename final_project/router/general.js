const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const fetchAllBooks = async (req) => {
  const response = await axios.get(`${getBaseUrl(req)}/books`);
  return response.data;
};


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Unable to register user." });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/books', function (req, res) {
  return res.status(200).json(books);
});

public_users.get('/', async function (req, res) {
  //Write your code here
  try {
    const allBooks = await fetchAllBooks(req);
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  try {
    const isbn = req.params.isbn;
    const allBooks = await fetchAllBooks(req);
    const book = allBooks[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve book by ISBN" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  try {
    const author = req.params.author.toLowerCase();
    const allBooks = await fetchAllBooks(req);
    const matchedBooks = {};

    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].author.toLowerCase() === author) {
        matchedBooks[isbn] = allBooks[isbn];
      }
    });

    if (Object.keys(matchedBooks).length === 0) {
      return res.status(404).json({ message: "No books found for this author" });
    }

    return res.status(200).json(matchedBooks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve books by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  try {
    const title = req.params.title.toLowerCase();
    const allBooks = await fetchAllBooks(req);
    const matchedBooks = {};

    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].title.toLowerCase() === title) {
        matchedBooks[isbn] = allBooks[isbn];
      }
    });

    if (Object.keys(matchedBooks).length === 0) {
      return res.status(404).json({ message: "No books found for this title" });
    }

    return res.status(200).json(matchedBooks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve books by title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
