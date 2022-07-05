class ApiError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        //Error.captureStackTrace(this,this.constructor);
        //this.message=message;
    }

    // static badRequest(msg){
    //     return new ApiError(400,msg);
    // }

    // static internal(msg){
    //     return new ApiError(500,msg);
    // }
}

class BadRequest extends ApiError {
    constructor(message) {
        super(400, message);
    }
}

class InternalServerError extends ApiError {
    constructor(message) {
        super(500, message);
    }
}

module.exports = {
    ApiError,
    BadRequest,
    InternalServerError
};