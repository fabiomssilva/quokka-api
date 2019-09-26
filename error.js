module.exports.error = (err,req, res) => {
    console.log(err);
    res.status(500);
    res.send( {error: err.message} )
};

module.exports.error404 = (err,req, res) => {
    console.log(err);
    res.status(404);
    res.send( {
        error: 'not found',
        statusCode: 404,
        message: err,
    } )
};