const mongoose = require("mongoose");
const { ApiError } = require("./apiError");

function apiErrorHandler(err, req, res, next) {
    let message;
    //console.error(err);
    //console.log("Error name:", err.name);

    if (err instanceof mongoose.Error.CastError) {
        message = "Resource not found.";
        res.status(404).json({ success: false, Error: message });
        return;
    }

    if (err instanceof mongoose.Error.ValidationError) {
        message = "Invalid Input Data.";
        res.status(400).json({ success: false, Error: message });
        return;
    }

    if (err instanceof ApiError) {
        //console.log("Api Error block");
        res.status(err.code).json({ success: false, Error: err.message });
        return;
    }
    res.status(err.statusCode || 500).json("Something went wrong!!");
}

module.exports = apiErrorHandler;