const {render} = require('ejs')
// const csurf = require('tiny-csrf');
const express = require('express');
const helmet = require("helmet");
// const bodyParser = require('body-parser');
const session = require('express-session');
// const cookieParser = require('cookie-parser');
const { xss } = require('express-xss-sanitizer');
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
app.use(helmet());

app.use(helmet.frameguard({ action: "SAMEORIGIN" }));
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss())
app.use(session({
    secret: '23456789iamasecret987654321loook',
    resave:false,
    saveUninitialized: false,
    store:sessionStore,
    cookie: {
        maxAge:30*24*60*60*1000 ,
        sameSite: 'lax',
        // _csrf= req.csrfToken() 
    }
}));
// app.use(cookieParser('super cookie secret'));


// app.use(csurf(
//     "123456789iamasecret987654321Book"
// ))





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



app.use(routes);

db.connectToDatabase().then(function(){
    app.listen(3000);

})
