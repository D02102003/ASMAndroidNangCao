const express = require('express');
const bodyParser = require("body-parser");
const userModel = require('../models/admin');
let alert = require('alert'); 


const app = express();
const exphbs = require('express-handlebars');
const multer = require('multer')


app.engine('.hbs', exphbs.engine({
    extname: "hbs",
    defaultLayout:'main',
    layoutsDir: "views/layouts/"
}));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', '.hbs');
app.set('views', './views');
app.get('/', (req, res) => {
    res.render('users/addOrUser.hbs', { layout: 'main' });
});
app.post('/signInSuccessfully', (req, res) => {
    console.log(req.body)
    var email1 = String(req.body.email);
    var password1 = String(req.body.password);
    var regex =/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/ ;

    if(!(email1.match(regex))){
        
        alert('Email sai dinh dang')
        
    }else{
        userModel.findOne({
            email:email1,
            password:password1
        })
        .then(data =>{
            
            if(data){
                console.log(data.filename);
                res.render('users/screen.hbs',{layout:false})
            }else{
                alert('Email hoặc pass sai')
            }
        })
        .catch(err=>{
            res.status(500).json('loi')
        })
    }

    
});

// app.get('/admim/signIn',(req,res)=>{
//     res.render('users/singIn.hbs', { layout: 'main' });
// })
let storage = multer.diskStorage({
    destination:'views/image/',
    filename : (req,file,cb) =>{
        if(file.mimetype === "image/jgp" || file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
            cb(null,file.originalname)
        }
         else{
            alert("File không phải là ảnh")
        }
        
    }
    
})

let upload = multer({
    storage: storage
})

app.post('/adduser', upload.single('filename'), (req, res) => {
    
    var email1 = String(req.body.email);
    var password1 = String(req.body.password);
    var fullName = String(req.body.fullName);
    var filename = String(req.body.filename);
    var regexNull = /^$/;
    var regex =/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/ ;
    if((email1.match(regexNull))|| (password1.match(regexNull)) 
    || fullName.match(regexNull)|| filename.match(regexNull)){
        alert('Email và Password và Name không được trống')
    }
    else if(!(email1.match(regex))){
        
        alert('Email sai dinh dang')
        
    } else if(filename == ""){

    } else{
        userModel.create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            filename: req.file.filename,
        })
                res.render('users/signIn.hbs');
    }
       
  

});


module.exports = app;