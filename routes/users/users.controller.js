const { jwtToken, checkEmail, registerUser, loginUser, getAllUser, deleteUser } = require('../../models/users/users.model');
const { getPagination } = require('../../services/paging');
const { BadRequest } = require('../../error/apiError');
const { mongoose } = require('mongoose');

//register user
async function httpRegisterUser(req, res, next) {
    try {
        const newUser = req.body;
        req.body.dob = new Date(req.body.dob);

        await registerUser(newUser);
        return res.status(201).json({ status: 'User has been created Successfully!!' ,newUser});
    }
    catch (err) {
        next(err);
        //next(new BadRequest(`User Registration Error`));
        //return;
    }
}

//login user
async function httpLoginUser(req, res, next) {
    try {
        const existUser = await checkEmail(req.body.email);
        const password = req.body.password;
        if (existUser) {
            const verifyUser = await loginUser(password, existUser);
            if (verifyUser) {
                const token = await jwtToken(existUser.id);
                //console.log("Login token: ", token);
                return res.status(200).json({ status: "Succesfully logeed In!", token });
            }
            else {
                next(new BadRequest('Please provide valid Password!'));
                //return res.status(400).json({ status: 'Please provide valid Password!' });
            }
        }
        else {
            next(new BadRequest('Please provide valid Email ID!'));
            //return res.status(400).json({ status: 'Please provide valid Email ID!' });
        }
    }
    catch (err) {
        next(err);
        //next(new BadRequest(`User can't Logged in!! ${err}`));
        //next(new Error("User can't Logged in!!"));
        //res.status(400).send({ Error: "User can't Logged in!!" })
        //console.log("User can't Logged in!!:\n", err);
    }
}

//get all user 
async function httpGetUser(req, res, next) {
    try {
        const id = req.query.id;
        const key = req.query.sortByKey || 'createdAt';
        const value = req.query.sortByValue || 1;
        let idArray = id;
        let allUser;
        const loginUserId = req.userId;

        const { skip, limit } = getPagination(req.query);
        if (id != undefined) {
            idArray = id.split(",");
            allUser = await getAllUser(idArray, skip, limit, key, value, loginUserId, {
                '__v': 0,
                'password': 0,
                ...(req.userId ? {
                } : {
                    //email: 0,
                    userName: 0,
                    dob: 0,
                    createdAt: 0,
                    updatedAt: 0,
                })
            });
        }
        else {
            allUser = await getAllUser(idArray, skip, limit, key, value, loginUserId, {
                '__v': 0,
                'password': 0,
                ...(req.userId ? {
                } : {
                    //email: 0,
                    userName: 0,
                    dob: 0,
                    createdAt: 0,
                    updatedAt: 0,
                })
            })
        }
        res.status(200).json(allUser);
    } catch (err) {
        next(err);
        //next(new BadRequest(`User can't Display!! ${err}`));
        //next(new Error("User can't display"));
        //res.status(400).send({ Error: "User can't display" })
    }
}

async function httpDeleteUser(req,res,next){
    try{
        const id = req.params.id;
        await deleteUser(id);
        res.status(200).json({Status:'User Succesfully deleted!!'});
    }
    catch(err){
        next(err);
    }
}

module.exports = {
    httpRegisterUser,
    httpLoginUser,
    httpGetUser,
    httpDeleteUser
}