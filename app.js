const express = require('express');
const app = express();
const bodyParser = require('body-parser')     //requiring body parser to change the data coming from frontend into json so it can be used in backend
const morgan = require('morgan')        //morgan is a library to log or show the requests thats been called onto the server in console with status code and the routes etc
const mongoose = require('mongoose')
const cors = require('cors');
require('dotenv/config')         //requiring the dotenv which we installed to access the .env file which is enviroment variables
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler')

app.use(cors());
app.options('*', cors())              //it means use the cors with whole server using the HTTP requests, like for get, post, update etc

// // Middleware to add the CORS header to every response
// app.use((req, res, next) => {
//     // Replace "*" with the specific origin you want to allow, or use req.headers.origin to dynamically allow the requesting origin.
//     res.header('Access-Control-Allow-Origin', 'req.headers.origin');
//     // Additional CORS headers to allow various types of requests
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     next();
//   });

// middleware
app.use(bodyParser.json())   //by help of this we don't need to convert data coming from frontend into json again and again   //using parser but in modern developement we don't use it, we convert the data instead by using .json() function
app.use(morgan('tiny'))           //tiny is like an additional feature or format
app.use(authJwt())               //authJwt will authenticate the jwt token
app.use(errorHandler)        //calling the errorHandler middleware
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))    //first its the path of the folder '/public/uploads', then its a method of express to make it static and inside static() method its _dirname that return us the root path of this application concatenated with the path i want to be static,   so any file uploaded to public/uploads folder will not be an API, it will be static

// Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');        //requiring routes related to products from ./routers/products
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');


const api = process.env.API_URL;


app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes)        //products related all routes are on this router
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

// Database
mongoose.connect(process.env.CONNECTION_STRING, {   //it will return a promise to handle that we will use .then and catch method, in second argument its the options inside object
dbName: 'eshop-database'
})    
.then(()=>{
    console.log('Database connection successful')
}).catch((err)=>{
    console.log(err)
})

// for Developement
// server
app.listen(3000, ()=>{      //in second argument its the call back that will be executed if server started running successfully
    console.log('Server is running http://localhost:3000');
});

// for production

// var server = app.listen(process.env.PORT || 3000, function () {
//     var port = server.address().port;
//     console.log("Express is working on port " + port)
// })

// untill 69
// vid 78 is remaining in part 2 > 08 folder