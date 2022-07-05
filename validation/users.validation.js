const { body, validationResult } = require('express-validator');
const { checkEmail } = require('../models/users/users.model');

function dateValidator(dt) {
    let x = 1000 * 60 * 60 * 24;

    let currentDate = new Date();
    let userDate = new Date(dt);

    let diff = (currentDate - userDate);
    diff = Math.ceil(diff / x);
    diff = Math.abs(Math.round(diff / 365.25));
    if (diff > 18 && diff <= 100) {  // year between 1922 to 2004
        return true;
    }
    else {
        throw new Error('Age should greater than 18 and less than 100');
    }
}

async function emailValidator(emailID) {
    if (!await checkEmail(emailID)) {
        return true;
    }
    throw new Error('Email ID is already Exist.');
}

// function checkPassword(password) {
//     console.log(passwordStrength(password).value)


//     let errors = "";
//     if (password.length < 6) {
//         errors.push("Your password must be at least 6 characters");
//     }
//     if (password.search(/[A-Z]/) < 0) {
//         errors.push("Your password must contain at least one capital letter.");
//     }
//     if (password.search(/[a-z]/) < 0) {
//         errors.push("Your password must contain at least one small letter.");
//     }
//     if (password.search(/[0-9]/) < 0) {
//         errors.push("Your password must contain at least one digit.");
//     }
//     console.log(errors);
//     if (errors.length > 0) {
//         throw new Error(errors);
//     }

//     // password.isLength({ min: 6 })
//     // .toUpperCase();
// }

function registerUserValidator() {
    return [
        body('firstName', "Numbers not allowed in Firstname").isString().notEmpty().withMessage("FirstName is required"),
        body('lastName', "Numbers not allowed in Lastname").isString(),
        body('email', "Invalid Email Format").isEmail().custom(emailValidator),
        body('password', "Password must contain atleast 6 characters")
            .isLength({ min: 6 })
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,}$/).withMessage('Password must contain atleast 6 Characters including 1 Uppercase, 1 Lowercase, 1 special character, 1 Number'),
            // [~!@#$%^&*()_+{}\\[\\]:;,.<>/?-] my regex pattern for only 1 special character
        body('userName', "Username contains only strings and numbers").isAlphanumeric(),
        body('dob', "Invalid Date Format").isDate()
        // .custom(dateValidator)
    ];
}

function loginUserValidator() {
    return [
        body('email', "Invalid Email Format").isEmail(),
        body('password', "Password should be at least 6 characters long").isLength({ min: 6 }),
    ];
}

function Validation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map(error => error.msg)
        });
    }
    else {
        next();
    }
}

module.exports = {
    dateValidator,
    registerUserValidator,
    loginUserValidator,
    Validation,
}