const mongoose = require('mongoose');
const UserSchame = mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    filename: String
    
    
    
})
const User = mongoose.model('Admin',UserSchame);
module.exports =User;