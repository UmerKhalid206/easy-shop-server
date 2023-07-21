function errorHandler(err, req, res, next) {
    if(err.name === 'UnauthorizedError'){           //we have the error name and other properties in the err object
        //jwt authentication error
        return res.status(401).json({message: 'The user is not authorized'})
    }

    if(err.name === 'ValidationError'){
        // validation error
       return res.status(401).json({message: err})
    }

    // for general error show this message
    return res.status(500).json(err)
}

module.exports = errorHandler;