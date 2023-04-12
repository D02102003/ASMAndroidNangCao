const express = require('express');
const bodyParser = require("body-parser");
const userModel = require('../models/admin');
const userModelUser = require('../models/user');
let alert = require('alert');
const cookieParser = require("cookie-parser");
var jwt = require('jsonwebtoken');


const app = express();
const exphbs = require('express-handlebars');
const multer = require('multer')


app.engine('.hbs', exphbs.engine({
    extname: "hbs",
    defaultLayout: 'main',
    layoutsDir: "views/layouts/"
}));
app.use(express.static('views/image'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', '.hbs');
app.set('views', './views');
app.get('/', (req, res) => {
    res.render('users/addOrUser.hbs', {
        layout: false, helpers: {
            successfully() { return 'Đăng kí'; },

        }
    });
});
let storage = multer.diskStorage({
    destination: 'views/image/',
    filename: (req, file, cb) => {
        if (file.mimetype === "image/jgp" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, file.originalname)
        }
        else {
            alert("File không phải là ảnh")
        }

    }

})

let upload = multer({
    storage: storage
})
app.post('/home', (req, res) => {
    console.log(req.body)
    console.log(req.body.id1)
    var email1 = String(req.body.email);
    var password1 = String(req.body.password);
    var regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

    if (!(email1.match(regex))) {

        alert('Email sai dinh dang')

    } else {
        userModel.findOne({
            email: email1,
            password: password1
        })
            .then(data => {

                if (data) {
                    console.log(data.filename);
                    var token = jwt.sign({ _id: data._id }, 'hieu123')
                    res.cookie("token", token, { httpOnly: true });
                    if ((jwt.verify(token, 'hieu123'))) {
                        if (data.role === 'admin') {
                            userModelUser.find({}).then(users => {

                                res.render('users/screen',
                                    {
                                        layout: false, users: users.map(user => user.toJSON()), helpers: {
                                            successfully() { return email1; },

                                        }
                                    }
                                )

                            })

                        } else {
                            userModelUser.find({}).then(users => {
                                console.log(email1);
                                res.render('users/screenKH',
                                    {
                                        layout: false, users: users.map(user => user.toJSON()), helpers: {
                                            successfully() { return email1; },

                                        }
                                    }
                                )

                            })
                        }
                    } else if (!(jwt.verify(token, 'hieu123'))) {
                        res.json('lỗi token')
                    }


                } else {
                    alert('Email hoặc pass sai')
                }
            })
            .catch(err => {
                res.status(500).json('loi')
            })
    }


});



app.get('/home', (req, res, next) => {
    try {
        var token = req.cookies.token;
        var idUser = jwt.verify(token, 'hieu123')

        userModel.findOne({
            _id: idUser
        }).then(data => {
            if (data) {
                if (data.role === "admin") {
                    userModelUser.find({}).then(users => {

                        res.render('users/screen',
                            {
                                layout: false, users: users.map(user => user.toJSON()), helpers: {
                                    successfully() { return users.email; },

                                }
                            }
                        )

                    })
                } else {
                    res.status(500).json('Lỗi bạn không có quyền vào trang này')
                }

            } else {
                res.json('Not permisson')
            }
        }).catch(err => {
            console.log(err);
        })
    } catch (error) {
        res.status(500).json('Lỗi bạn cần đăng nhập để vào được trang này')
    }

})

app.get('/listKH', (req, res) => {
    try {
        var token = req.cookies.token;
        var idUser = jwt.verify(token, 'hieu123')

        userModel.findOne({
            _id: idUser
        }).then(data => {
            if (data) {
                if (data.role === "admin") {
                    userModel.find({}).then(users => {
                        res.render('users/danhsachUser.hbs',
                            { layout: 'main', users: users.map(user => user.toJSON()) }
                        )
                
                    })
                } else {
                    res.status(500).json('Lỗi bạn không có quyền vào trang này')
                }

            } else {
                res.json('Not permisson')
            }
        }).catch(err => {
            console.log(err);
        })
    } catch (error) {
        res.status(500).json('Lỗi bạn cần đăng nhập để vào được trang này')
    }


   
})

app.get('/themuser',async (req, res) => {
   res.render('users/adduser.hbs',{layout: 'main'})

})
app.post('/themuser',upload.single('filename'),async (req, res) => {
    console.log(req.body);
    var email1 = String(req.body.email);
    var password1 = String(req.body.password);
    var fullName = String(req.body.fullName);
    var filename = String(req.body.filename);

    var regexNull = /^$/;
    var regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    if ((email1.match(regexNull)) || (password1.match(regexNull))
        || fullName.match(regexNull) || filename.match(regexNull)) {
        alert('Email và Password và Name không được trống')
    }
     else if (filename == "") {

    } else {

        userModel.create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            filename: req.file.filename,
            role: req.body.role
        }            
           
        )
        res.redirect('/admin/listKH');


    }

 
 })



app.get('/thongtinAdmin',async (req, res) => {
    try {
        var token = req.cookies.token;
        var idUser = jwt.verify(token, 'hieu123')
    //     console.log(idUser)

        await userModel.find({ _id: idUser }).then(users => {
                res.render('users/thongtinadmin.hbs',
                { layout: false, users: users.map(user => user.toJSON()) }
            )
            
        }).catch(err =>{
            res.json('bạn không có quyền')
        })
    } catch (error) {
        res.json('bạn cần đăng nhập')
    }
       

   

})
app.get('/thongtinKH',async (req, res) => {
    try {
        var token = req.cookies.token;
        var idUser = jwt.verify(token, 'hieu123')
    //     console.log(idUser)

        await userModel.find({ _id: idUser }).then(users => {
                res.render('users/thongtinkhachhang.hbs',
                { layout: false, users: users.map(user => user.toJSON()) }
            )
            
        }).catch(err =>{
            res.json('bạn không có quyền')
        })
    } catch (error) {
        res.json('bạn cần đăng nhập')
    }
       

   

})








app.get('/edit1/:id', (req, res) => {
    userModel.findById(req.params.id, (err, user) => {
        if (!err) {
            res.render('users/addOrUser.hbs', {
                user: user.toJSON(), helpers: {
                    successfully() { return 'Sửa Thông tin'; }


                }
            })
            console.log(user);
        }
    })
})
app.get('/edit/:id', (req, res) => {
    userModel.findById(req.params.id, (err, user) => {
        if (!err) {
            res.render('users/edituser.hbs', {
                user: user.toJSON(), helpers: {
                    successfully() { return 'Sửa Thông tin'; }


                }
            })
            console.log(user);
        }
    })
})





app.get('/deleteuser/:id', async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id, req.body);
        if (!user) {
            res.status(400).send("No item found");
        }

        else {
            res.redirect('/admin/listKH')
        }


    } catch (error) {
        res.status(500).send(error);
    }
})

// app.get('/admim/signIn',(req,res)=>{
//     res.render('users/singIn.hbs', { layout: 'main' });
// })

app.post('/adduser1', upload.single('filename'), (req, res) => {
    console.log(req.body);
    var email1 = String(req.body.email);
    var password1 = String(req.body.password);
    var fullName = String(req.body.fullName);
    var filename = String(req.body.filename);

    var regexNull = /^$/;
    var regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    if ((email1.match(regexNull)) || (password1.match(regexNull))
        || fullName.match(regexNull) || filename.match(regexNull)) {
        alert('Email và Password và Name không được trống')
    }
    else if (!(email1.match(regex))) {

        alert('Email sai dinh dang')

    } else if (filename == "") {

    } else {

        userModel.findOneAndUpdate({ _id: req.body.id }, {
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            filename: req.file.filename,
            role: req.body.role
        }, { new: true }, (err, doc) => {
            if (!err) {

                res.redirect('/admin/listKH');

            } else {
                console.log(err);
                res.render('users/addOrUser.hbs', { layout: 'main' });
            }
        })


    }



});

app.get('/logout', function (req, res) {
    cookie = req.cookies;
    console.log(req.cookies);
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', { expires: new Date(0) });
    }
    res.redirect('/');
});

app.post('/adduser', upload.single('filename'), (req, res) => {
    console.log(req.body);
    var email1 = String(req.body.email);
    var password1 = String(req.body.password);
    var fullName = String(req.body.fullName);
    var filename = String(req.body.filename);

    var regexNull = /^$/;
    var regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    if ((email1.match(regexNull)) || (password1.match(regexNull))
        || fullName.match(regexNull) || filename.match(regexNull)) {
        alert('Email và Password và Name không được trống')
    }
    else if (!(email1.match(regex))) {

        alert('Email sai dinh dang')

    } else if (filename == "") {

    } else {
        if (req.body.id == "") {
            userModel.create({
                fullName: req.body.fullName,
                email: req.body.email,
                password: req.body.password,
                filename: req.file.filename,
            })
            res.render('users/signIn.hbs');
        } else {
            userModel.findOneAndUpdate({ _id: req.body.id }, {
                fullName: req.body.fullName,
                email: req.body.email,
                password: req.body.password,
                filename: req.file.filename,
            }, { new: true }, (err, doc) => {
                if (!err) {


                    userModel.find({ _id: req.body.id }).then(users => {
                        if (users.role === 'admin') {
                            res.render('users/thongtinadmin.hbs',
                                { layout: false, users: users.map(user => user.toJSON()) }
                            )
                        } else {
                            res.render('users/thongtinkhachhang.hbs',
                                { layout: false, users: users.map(user => user.toJSON()) }
                            )
                        }

                    })

                } else {
                    console.log(err);
                    res.render('users/addOrUser.hbs', { layout: 'main' });
                }
            })
        }

    }



});


module.exports = app;