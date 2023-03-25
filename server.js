const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const userController = require('./controller/userControllers');
const userControllerAdmin = require('./controller/admin');
const { render } = require('./controller/userControllers');
const url = "mongodb+srv://hieuttph:hieuttph123@atlascluster.yjodynw.mongodb.net/dbUserManager?retryWrites=true&w=majority"

const app =express();
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('.hbs', exphbs.engine({ 
    extname: "hbs", 
    defaultLayout: 'main', 
    layoutsDir: "views/layouts/" }));
  
  //app.engine( "hbs", engine({ extname: "hbs", defaultLayout: false, layoutsDir: "views/layouts/", }) );
  
  app.set('view engine', '.hbs');
  app.set('views', './views');


app.use(express.json())
mongoose.connect(url,{useUnifiedTopology:true,useNewUrlParser:true});

app.get('/',(req,res)=>{
    res.render('users/signUp.hbs',{layout: 'main'})
});

app.use('/user',userController);
app.use('/admin',userControllerAdmin);

app.get('/admin/signIn',(req,res)=>{
    res.render('users/signIn.hbs',{layout: 'main'})
});


app.listen(3000);