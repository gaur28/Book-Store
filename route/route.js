
const { render } = require("ejs");
const express = require("express");
const bcrypt = require('bcryptjs');
const mongodb = require("mongodb");
const db = require("../data/database");
const { default: swal } = require("sweetalert2");
const ObjectId = mongodb.ObjectId;

const routes = express.Router();
routes.get('/signup', function(req,res){
  let sessionInputData = req.session.inputData;

  if(!sessionInputData){
    sessionInputData = {
      hasError:false,
      name: '',
      email: '',
      confirmEmail: '',
      password: '',
    };
  }req.session.inputData = null;

  res.render('signup');
});
routes.get('/login', function(req,res){

  let sessionInputData = req.session.inputData;

  if(!sessionInputData){
    sessionInputData = {
      hasError:false,
      name: '',
      email: '',
      password: '',
    };
  }req.session.inputData = null;

  res.render("login");
});

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

routes.get("/", async function (req, res) {

  const books = await db
    .getDb()
    .collection("book")
    .find({}, { _id: 1, title: 1, summary: 1, name:1,email:1 })
    .toArray();
  if(req.session.isAuthenticated){
      const currentUserId = req.session.user.id;
      console.log(currentUserId)
      const myBooks = await db.getDb().collection('book').find({userId: new ObjectId(currentUserId)},{ title: 0, summary: 0,userId:1, name:0,email:0}).toArray();
      console.log(myBooks);
      return res.render("index", { books: books, mybooks:myBooks});
  }
  res.render('index',{books:books})
 
});
routes.post('/searchResults', async function(req,res){
  const bookTitle = req.body.searchResult;
  console.log(bookTitle)
  const book = await db.getDb().collection('book').find({title: bookTitle}, {title:1, name:0, summary:0, email:0}).toArray(); 
  console.log(book)
  
  res.render('searchResult', {book:book});
  
  });


routes.get("/bookInfo/:id", async function (req, res) {
  if(!req.session.isAuthenticated){
    return res.status(401).render('401');
  }
  const bookId = req.params.id;
  const book = await db
    .getDb()
    .collection("book")
    .findOne(
      { _id: new ObjectId(bookId) },
      { _id:1, title: 0, author: 0, summary: 0 }
    );
  console.log(book);
  res.render("bookInfo", { book: book });
});

routes.get("/editBook/:id", async function (req, res) {
   const bookId = req.params.id;
   const book = await db.getDb().collection('book').findOne({_id: new ObjectId(bookId)},{title:0,summary:0,userId:0 });
    console.log(book)
    const authorId = new ObjectId(book.userId)
    const currentUserId = new ObjectId( req.session.user.id);
    if(!currentUserId.equals(authorId)){
      return res.status(403).render('403')
    }

    res.render('editBook', {book:book});
     
    
    
    
});

routes.post('/editBook/:id', async function(req,res){
    const bookId = req.params.id;
    const result = await db.getDb().collection('book').updateOne({_id : new ObjectId(bookId)}, {$set:{
        title: req.body.title,
        summary: req.body.summary,
        

    }});
    
    
      res.json({message:'book Edited'});
      
    
});
routes.get('/searchResults', function(req,res){
  res.render('searchResult');
});



routes.get('/createNewBook', function(req,res){

  if(!req.session.isAuthenticated){
    return res.status(401).render('401');
  }
  res.render('createNewBook');
});

routes.get("/deleteBook/:id", async function (req, res) {
 
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
  
  res.render("delete", { book: book });
});


routes.post('/deleteBook/:id', async function(req,res){
  const bookId = req.params.id;
  const result = await db.getDb().collection('book').deleteOne({_id: new ObjectId(bookId)});
  const authorId = new ObjectId(result.userId)
  const currentUserId = new ObjectId(req.session.user.id) ;
  
    
     res.json(result);

 
});

routes.post('/signup',async function(req,res){
  const userData = req.body;
  const name = userData.name;
  const email = userData.email;
  const confirmEmail = userData['confirm-email'];
  const password = userData.password;

  if(!email|| !confirmEmail|| !password|| password.trim()<6|| email !== confirmEmail){
    req.session.inputData = {
      hasError: true,
      message: 'invalid inputs- please check your credentials',
      name: name,
      email: email,
      confirmEmail:confirmEmail,
      password: password
    };

    req.session.save(function(){
      res.redirect('/signup');
    })
    return
  }

  const existingUser = await db.getDb().collection('users').findOne({email: email});

  if(existingUser){
   console.log('already user');
  return res.redirect('/signup');
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
    console.log("Not a user! create a account first");
    return res.redirect('/login');
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
  
});

routes.post('/logout', function(req,res){
  req.session.user = null;
  req.session.isAuthenticated = false;

  res.redirect('/');
});



module.exports = routes;
