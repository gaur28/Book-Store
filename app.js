const {render} = require('ejs')
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session');
const fs = require('fs');
const mongodb = require('mongodb');
const path = require('path');
const routes = require('./route/route');
const db = require('./data/database');

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
app.use(function(req,res,next){
    const isAuth = req.session.isAuthenticated;
    
    if(!isAuth){
      return next();
    }
    res.locals.isAuth = isAuth
    next()
  });

app.use(express.json());
app.use(routes);

db.connectToDatabase().then(function(){
    app.listen(3000);

})
