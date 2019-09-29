module.exports.error = (err, req, res, statusCode, message) => {
    res.status(statusCode);
    return res.send( {
        error: message,
        statusCode: statusCode,
        message: err,
    })
}

module.exports.error500 = (err,req, res) => {
    return exports.error(err,req,res,500,'Internal Server Error');
};

module.exports.error404 = (err,req, res) => {
    return exports.error(err,req,res,404,'Not Found');
};