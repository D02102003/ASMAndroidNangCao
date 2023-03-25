const express = require('express');
const userModel = require('../models/user');
const app = express();
const exphbs = require('express-handlebars');
const multer = require('multer')

const bodyParser = require("body-parser");

app.engine('.hbs', exphbs.engine({
    extname: "hbs",
    defaultLayout: 'main',
    layoutsDir: "views/layouts/"
}));
app.use(bodyParser.urlencoded({ extended: true }));
//app.engine( "hbs", engine({ extname: "hbs", defaultLayout: false, layoutsDir: "views/layouts/", }) );

app.set('view engine', '.hbs');
app.set('views', './views');
app.get('/', (req, res) => {
    res.render('users/addOrEdit.hbs', { layout: 'main' });
})

let storage = multer.diskStorage({
    destination: 'views/image/',
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

let upload = multer({
    storage: storage
})

app.post('/search', (req, res) => {

    var tenSanPham = String(req.body.search);
    console.log(tenSanPham);
    userModel.find({
        fullName: tenSanPham
    })
        .then(data => {
            const name = data.fullName;
            const ma = data.email;
            const donGia = data.password;
            const mau = data.phone;
            const loai = data.address;
            const maKH = data.city;
            const tenKH = data.people;
            const avata = data.filename;

            if (data) {
                console.log(data);
                res.render('users/findSP.hbs', { data: data.map(data => data.toJSON()) })
            } else {
                alert('Loi')
            }
        })
        .catch(err => {
            res.status(500).json('loi')
        })
})

app.post('/add', upload.single('filename'), (req, res) => {
    
    if (req.body.id == '') {
        userModel.create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            people: req.body.people,
            filename: req.file.filename,
        })
        res.render('users/addOrEdit.hbs',{layout:'main',helpers: {
            successfully() { return 'ADD SUCSSECCFULLY'; },
           
          }})
    } else {
        // userModel.updateOne({_id: req.body.id},{$set :{
        //     fullName: req.body.fullName,
        //     email: req.body.email,
        //     password: req.body.password,
        //     phone: req.body.phone,
        //     address: req.body.address,
        //     city: req.body.city,
        //     people: req.body.people,
        //     filename: req.file.filename,
        // }})
        // res.render('users/addOrEdit.hbs',{layout:'main'});
        update(req,res);
    }
    // const u = new userModel(req.body);
    // try {
    //      u.save();
    //     res.render('users/addOrEdit.hbs');
    // } catch (error) {
    //     res.status(500).send(error);
    // }

});

// function add(req, res) {
//     const u = new userModel(req.body);
//     try {
//         u.save();
//         res.render('users/addOrEdit.hbs');
//     } catch (error) {
//         res.status(500).send(error);
//     }
// }
function update(req, res) {
    userModel.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true }, (err, doc) => {
        if (!err) {
            res.redirect('/user/list');
        } else {
            console.log(err);
            res.render('users/addOrEdit.hbs',{layout:'main'});
        }
    })
}
app.get('/list', (req, res) => {
    userModel.find({}).then(users => {
        res.render('users/view-users.hbs',
            { users: users.map(user => user.toJSON()) },
        )

    })
})

app.get('/edit/:id', (req, res) => {
    userModel.findById(req.params.id, (err, user) => {
        if (!err) {
            res.render('users/addOrEdit.hbs', { user: user.toJSON() })
        }
    })
})
app.get('/delete/:id', async (req, res) => {
    try {
        const user = await userModel.find(req.params.id, req.body);
        if (!user) {
            res.status(400).send("No item found");
        }

        else {
            res.redirect('/user/list')
        }


    } catch (error) {
        res.status(500).send(error);
    }
})



module.exports = app;