const expressJwt = require('express-jwt')  //we have to install previous version because the latest version gives the error     //library for authenticating API's with jwt

//it has problem in logic that if a jwt is generated when a user logs in and then that user again login and have a new jwt then the previous generated jwt will still works if we pass it as authorization
function authJwt(){                  //if someone tries to access the server with API then the secret key with api would be compared to the secret that we setted in environment, if it matches then it will allow the request to access the server
    const secret = process.env.secret;
    const api = process.env.API_URL;
    // error in latest version that expressJwt() is not a function
    return expressJwt({         //it has some options in it
        secret,          //the secret key from our environment variable
        algorithms: ['HS256'],          //its the algorithm that jwt library uses, its from jwt.io website    
        isRevoked: isRevoked     //for authorized users       //expressJWT has a great method for reviewing or revoking the token under some specific conditions, here is the option or property isRevoked that can accept a function and in that function we can check/specify that user is admin or not
    // above this comment everything is done for only authorized user which will have token and below in the unless function those are for un-authorized users
    }).unless({              //excluding the login API from requiring the jwt token otherwise it requires jwt but jwt is only generated when user is logged in
        path: [
            // {url: `${api}/products`, methods: ['GET', 'OPTIONS']}, //but with the string `${api}/products` we are only bound to get data from the mentioned route but what if have to get data from http://localhost:3000/api/v1/products/get/featured/3  , then we have to specify it separately so to avoid that we will be using regular expression  //bring me the only get requests and their options but don't allow post request so people could not be able to post a new product on products route '/api/v1/products', =>  as this line of code says an un-authenticated user can only access this route for GET purpose  //we don't need the user to be authenticated so he can get the product lists 
            {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},  //it will still give us the error because we need to define public folder as static in our app middleware //for uploads folder to be public and images in it can be accessible without authorization   
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},      //regular expression giving the ability to specify everything after the products due to (.*)/     //its like building the regex   // you can test your regular expression regex on website regex101.com,  //its always better to use reg expressions to have more api's and less code
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},   //for categories
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })     
}

async function isRevoked(req, payload, done){   //req is when we want to use req body or what the user sending,  payload contains the data which is inside the token
    if(!payload.isAdmin){            //payload does not have or have false value of isAdmin then
        done(null, true)          //in this case we are saying reject the token, so it means if any authorized api called and our user is not admin then reject it
    }

    done();                     //else if he is an admin then done that request
    // as here we only have admin or customer so if you have more role's then you can specify in here and set what is revoked and what is allowed
}

module.exports = authJwt;