const {render} = require('ejs')
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session');
const fs = require('fs');
const mongodb = require('mongodb');
const path = require('path');
const routes = require('./route/route');
const db = require('./data/database');
const ObjectId = mongodb.ObjectId;

const MongodbStore = MongoDBStore(session);
const sessionStore = new MongodbStore({
    uri: 'mongodb://localhost:27017',
    databaseName: 'books2',
    collection: 'session'
});

const app = express();
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'super-secret',
    resave:false,
    saveUninitialized: false,
    store:sessionStore,
    cookie: {
        maxAge:30*24*60*60*1000 

    }
}));
app.use( function(req,res,next){
    //const currentUserId =  req.session.user;
//     console.log(currentUserId);
    const isAuth = req.session.isAuthenticated;
        
    //const authorId = req.session.authorId;     
    if(!isAuth  ){
      return next();
    }


    res.locals.isAuth = isAuth;
   // res.locals.authorId= new ObjectId(authorId.id).equals(new ObjectId(currentUserId.id))  
    next()
  });

  app.use(function(req,res,next){
    const currentUserId =  req.session.user;
    const authorId = req.session.authorId;     
    if(!authorId || !currentUserId ){
        return next();
      }

      id = new ObjectId(currentUserId.id).equals(new ObjectId(authorId.id));
      console.log(id)
      res.locals.authorId= id         

      next();
  });


app.use(express.json());
app.use(routes);

db.connectToDatabase().then(function(){
    app.listen(3000);

})
