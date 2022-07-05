const bcrypt = require('bcrypt');
const { use } = require('../../routes/users/users.router');

const { generateJwtToken } = require('../../services/jwt');
const userDatabse = require('./users.mongo');

async function jwtToken(id) {
    return await generateJwtToken(id);
}

//store the password in hashing value with salt prefix
async function hashValue(user) {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    return user;
}

//check email Id is exists or not
async function checkEmail(value) {
    return await userDatabse.findOne({ email: value });
}

//register user
async function registerUser(user) {
    const token = await jwtToken(user.id);
    await hashValue(user);
    await userDatabse.create(user);
}

//login User
async function loginUser(password, existUser) {
    return await bcrypt.compare(password, existUser.password);
}

//display all the user
async function getAllUser(id, skip, limit, key, value, loginUserId, selectValues) {
    if (id != null) {
        return await userDatabse.find({ _id: id }, selectValues)
            .sort({ [key]: value })
            .skip(skip)
            .limit(limit);
    } else {
        return await userDatabse.find({  }, selectValues)
            .sort({ [key]: value })
            .skip(skip)
            .limit(limit);
    }
    //_id: { $ne: loginUserId } between find query  { } in else part 
}

async function deleteUser(id){
    return await userDatabse.deleteOne({_id:id});
}

module.exports = {
    jwtToken,
    checkEmail,
    registerUser,
    loginUser,
    getAllUser,
    deleteUser
}