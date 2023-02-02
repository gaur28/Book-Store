
const { render } = require("ejs");
const csrf = require('tiny-csrf');
const express = require("express");
const cookieParser = require('cookie-parser');

const bcrypt = require('bcryptjs');
const mongodb = require("mongodb");
const db = require("../data/database");
const { default: swal } = require("sweetalert2");
const ObjectId = mongodb.ObjectId;


const routes = express.Router();

// route for Get request for signup
routes.get('/signup', function(req,res){
  const csrfToken = req.csrfToken();
  let sessionInputData = req.session.inputData;

  if(!sessionInputData){
    sessionInputData = {
      hasError:false,
      name: '',
      email: '',
      confirmPassword: '',
      password: '',
    };
  }req.session.inputData = null;
  

  res.render('signup', {inputData: sessionInputData, csrfToken:csrfToken});
});

// route for Get request for Login

routes.get('/login', function(req,res){
  const csrfToken = req.csrfToken();
  let sessionInputData = req.session.inputData;

  if(!sessionInputData){
    sessionInputData = {
      hasError:false,
      name: '',
      email: '',
      password: '',
    };
  }req.session.inputData = null;

  res.render("login",{inputData: sessionInputData, csrfToken:csrfToken });
});

// route for post request for create new book

routes.post('/createNewBook', async function(req,res){//add user id from users collection
  const bookInfo = {
    title: req.body.title,
    summary:req.body.summary,
    userId:req.session.user.id,
    name:req.session.user.name,
    email:req.session.user.email,
    
   
  };

  console.log(bookInfo);
  const book = await db.getDb().collection('book').insertOne(bookInfo);
  console.log(book);
  res.json(book);


});

// route for Get request for mainPage


routes.get("/", async function (req, res) {
  const csrfToken =req.csrfToken();
  console.log(csrfToken);
 
  const books = await db
    .getDb()
    .collection("book")
    .find({}, { _id: 1, title: 1, summary: 1, name:1,email:1 })
    .toArray();
  if(req.session.isAuthenticated){
      const currentUserId = req.session.user.id;
      //console.log(currentUserId)
      const myBooks = await db.getDb().collection('book').find({userId: new ObjectId(currentUserId)},{ title: 0, summary: 0,userId:1, name:0,email:0}).toArray();
      //console.log(myBooks);
      return res.render("index", { books: books, mybooks:myBooks,});
  } 

  
  res.render('index',{csrfToken:csrfToken,books:books})
 
});

// route for post request for search result


routes.post('/searchResults', async function(req,res){
  const bookTitle = req.body.searchResult;
  console.log(bookTitle)
  const book = await db.getDb().collection('book').find({title: bookTitle}, {title:1, name:0, summary:0, email:0}).toArray(); 
  console.log(book);

  res.status(200).render('searchResult', {book:book, });
  
  });

// route for Get request for Book info


routes.get("/bookInfo/:id", async function (req, res) {
  const csrfToken = req.csrfToken()
  if(!req.session.isAuthenticated){
    return res.status(401).render('401');
  }
  const bookId = req.params.id;

  const book = await db
    .getDb()
    .collection("book")
    .findOne(
      { _id: new ObjectId(bookId) },
      { _id:1, title: 0, author: 0, summary: 0 ,userId:1}
    );
    req.session.authorId = {
      id : new ObjectId(book.userId),
    }
  req.session.save(function(){
    res.render("bookInfo", { book: book, csrfToken: csrfToken });
  })
});

// route for Get request for Editing Book content


routes.get("/editBook/:id", async function (req, res) {
  const csrfToken = req.csrfToken()
   const bookId = req.params.id;
   const book = await db.getDb().collection('book').findOne({_id: new ObjectId(bookId)},{title:0,summary:0,userId:0 });
    console.log(book)
    const authorId = new ObjectId(book.userId)
    const currentUserId = new ObjectId( req.session.user.id);
    if(!currentUserId.equals(authorId)){
      return res.status(403).render('403')
    }
    res.render('editBook', {book:book, csrfToken:csrfToken });
     
    
    
    
});


// route for post request for edited book content

routes.post('/editBook/:id', async function(req,res){
    const bookId = req.params.id;
    const result = await db.getDb().collection('book').updateOne({_id : new ObjectId(bookId)}, {$set:{
        title: req.body.title,
        summary: req.body.summary,
        

    }});
    
      res.json({message:'book Edited'});
      
    
});

// route for Get request for search result page

routes.get('/searchResults', function(req,res){

 
  res.render('searchResult',);
});


// route for Get request for edit book Form

routes.get('/createNewBook', function(req,res){
  const csrfToken = req.csrfToken();
  if(!req.session.isAuthenticated){
    return res.status(401).render('401');
  }

  res.render('createNewBook', {csrfToken:csrfToken});
});

// route for Get request for delete book confirmation Page

routes.get("/deleteBook/:id", async function (req, res) {
  const csrfToken = req.csrfToken()
  const bookId = req.params.id;
  const book = await db
    .getDb()
    .collection("book")
    .findOne(
      { _id: new ObjectId(bookId) },
      { _id:1, title: 0, author: 0, summary: 0,userId:1 }
    );
    const currentUserId = new ObjectId( req.session.user.id);
    const authorId= new ObjectId(book.userId);
    if(!currentUserId.equals(authorId)){
      return res.status(403).render('403');
    }
  
  res.render("delete", { book: book, csrfToken:csrfToken });
});

// route for post request for confirmed book

routes.post('/deleteBook/:id', async function(req,res){
  const bookId = req.params.id;
  const result = await db.getDb().collection('book').deleteOne({_id: new ObjectId(bookId)});
 
    
     res.json(result);

 
});
// route for post request for signup page

routes.post('/signup',async function(req,res){
  const userData = req.body;
  const name = userData.name;
  const email = userData.email;
  const confirmPassword = userData['confirm-password'];
  const password = userData.password;

  if(!email|| !confirmPassword|| !password|| password.trim()<6|| password !== confirmPassword){
    req.session.inputData = {
      hasError: true,
      message: 'invalid inputs- please check your credentials',
      name: name,
      email: email,
      confirmPassword:confirmPassword,
      password: password
    };

    req.session.save(function(){
      res.redirect('/signup');
    })
    return
  }

  const existingUser = await db.getDb().collection('users').findOne({email: email});

  if(existingUser){
    req.session.inputData = {
      hasError: true,
      message: 'User already Exist',
      name: name,
      email: email,
      confirmPassword:confirmPassword,
      password: password
    };
    req.session.save(function(){
      res.redirect('/signup');
    })
    return
  
  }

  const hashPassword = await bcrypt.hash(password,12);
  const user = {
    name:name,
    email: email,
    password: hashPassword,
    
  }
  await db.getDb().collection('users').insertOne(user)

  res.redirect('/login');
});

// route for post request for Login page

routes.post('/login', async function(req,res){
  const userData = req.body;
  const email = userData.email;
  const password = userData.password;
  const user = {
    email: email,
    password:password
  }
  
  const existingUser = await db.getDb().collection('users').findOne({email: email});
  
  
  if(!existingUser){
    req.session.inputData = {
      hasError: true,
      message: 'invalid inputs- please check your credentials',
      email: email,
      password: password
    };

    req.session.save(function(){
      res.redirect('/login');
    })
    return
  }
   


  const equalPassword = await bcrypt.compare(password,existingUser.password);

  if(!equalPassword){
    console.log('wrong Password');
    return res.redirect('/login');
  }
  
  req.session.user = {id: existingUser._id, email: existingUser.email,name: existingUser.name};
  req.session.isAuthenticated = true;
  req.session.save(function(){
    res.redirect('/');
  });
  return
});

// route for post request for Logout button

routes.post('/logout', function(req,res){
  req.session.user = null;
  req.session.authorId = null;
  req.session.isAuthenticated = false;
  res.redirect('/');
});



module.exports = routes;
