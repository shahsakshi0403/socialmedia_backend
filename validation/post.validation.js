const { body, validationResult } = require('express-validator');

function postValidator() {
    return [
        //.isString(), "Only alphabets allowed"
        body('title').optional().notEmpty().withMessage("Title should not be empty"),
        body('content', "content maximum limit : 30 characters").optional().isLength({ max: 30 })
            .notEmpty().withMessage("content should not be empty")
            .isLength({ min: 4 }).withMessage("Content should be atleast 4 characters long"),
    ];
}

function checkActionValidator(value) {
    let pattern = /^[0-9]+$/;

    if (value !== undefined) {
        if (value.split(":")[0] == 'lt' || value.split(":")[0] == 'gt' || value.split(":")[0] == 'lte' || value.split(":")[0] == 'gte' || value.split(":")[0] == 'eq') {
            if (value.split(":")[1].match(pattern)) {
                return true;
            } else {
                throw new Error("Enter Proper Number Value");
                //return res.status(401).json({ Message: "Enter Proper like Number Value" });
            }
        } else {
            throw new Error("Enter Proper Operator Value between (gt,lt,gte,lte,eq)");
            //return res.status(401).json({ Message: "Enter Proper Operator Value between (gt,lt,gte,lte,eq)" });
        }
    }
    return true;
}

// function checkDislikeValidator(req, res, next) {
//     let pattern = /^[0-9]+$/;
//     const dislike = req.query.dislike;
//     if (dislike !== undefined) {
//         if (dislike.split(":")[0] == 'lt' || dislike.split(":")[0] == 'gt' || dislike.split(":")[0] == 'lte' || dislike.split(":")[0] == 'gte' || dislike.split(":")[0] == 'eq') {
//             if (dislike.split(":")[1].match(pattern)) {
//                 next();
//                 return;
//             } else {
//                 return res.status(401).json({ Message: "Enter Proper dislike Number Value" });
//             }
//         } else {
//             return res.status(401).json({ Message: "Enter Proper Operator Value between (gt,lt,gte,lte,eq)" });
//         }
//     }
//     next();
// }

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
    postValidator,
    checkActionValidator,
    Validation,
}