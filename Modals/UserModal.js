const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const UserSchema = mongoose.Schema({
    name: String,
    profile: String,
    email: String,
    password: String,
    state: String,
    city: String,
    swapedSkills:Array,
    designation: String,
    employeer: String,
    country: String,
    state: String,
    city: String,
    country: String,
    userName: String,
    github: String,
    instagram: String,
    twitter: String,
    facebook: String,
    website: String,
    linkedin: String,
    mobile: Number,
    uuid: {
        type: String,
        default:uuidv4,
        unique: true
    }
},{timestamps: true})

const User = mongoose.model("user", UserSchema)
module.exports = User