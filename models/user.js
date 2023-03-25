const mongoose = require('mongoose');
const UserSchame = mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    phone: String,
    address: String,
    city: String,
    people:String,
    filename: String
    
    
    
})
const User = mongoose.model('User',UserSchame);
module.exports =User;