const { Category } = require('../models/category');
const {Product} = require('../models/product')
const express = require('express');
const router = express.Router();         //router is a function inside express for handling the routes like get, post, put, delete etc
const mongoose = require('mongoose');
const multer = require('multer');


const   FILE_TYPE_MAP = {      //it will include the type of files i need to be uploaded on my server
    'image/png': 'png',        //'image/png' is the key whereas 'png' is the value, 'image/png' is because of MIME type format, its a media type known as Multipurpose Internet Mail Extensions
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

//from disk storage of multer github home page
const storage = multer.diskStorage({
    destination: function (req, file, cb) {     //control of destination , destination contains a function with 3 parameters req=> for request, file=> to have file, cb=> is the call back that will control if any error happens while uploading and we assign the destination where we should store the file
    const isValid = FILE_TYPE_MAP[file.mimetype] //checking the validation if the file we want to upload is valid or not, and we will use the same concept as of from extension below in filename, that means if the given mime type is found in FILE_TYPE_MAP then it will assign the respected value to isValid
    let uploadError = new Error('invalid image type')  // defining an error, default value of the error is invalid image type
    if(isValid){        //if isValid contains the value and we know that value will be from FILE_TYPE_MAP then
        uploadError = null;          //make the default value of uploadError to be null
    }

    cb(uploadError, 'public/uploads')  //use the uploadError in cb if isValid is true then its null otherwise it will have an error as => 'invalid image type'      //in the cb at first argument we can define the error, so if there is an error throw it here
    },
    filename: function (req, file, cb) {            //control of filename
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)  //creating the uniqueSuffix that contains current date concatenated with - and again concatenated with random math number multipled by 1E9 but we will have our own method
        const fileName = file.originalname.split(' ').join('-');       //it means get the originalname of the file from file which is uploaded then split the spaces from it and have - instead of spaces using join('-')     or you can write it as  const fileName = file.originalname.replace(' ', '-') => it means replace all spaces with a dash -
        const extension = FILE_TYPE_MAP[file.mimetype]  //so the file.mimetype will come with the format like 'image/png' and then it will be checked in the object of FILE_TYPE_MAP defined above and then will assign the respected value of regarding key to const extension    //in multer when i want to configure the filename i can find here something called mimetype, file.mimetype will include the information of the mime type as image/png or etc
    //   cb(null, fileName + '-' + Date.now())   //so the filename concatenated with the Date.now() which gives us date and time as number
    cb(null, `${fileName}-${Date.now()}.${extension}`)
}
  })
  
  const uploadOptions = multer({ storage: storage })      //we need to mention uploadOptions in the post API where we are creating a product by getting data from frontend

// API to get all the products List
router.get(`/`, async (req, res)=>{     //now as we are using only the slash => `/` it will work as ${api}/products because we are using ${api}/products in the app.js as the productsRouter home

    //example => localhost:3000/api/v1/products?categories=234243,875632
    let filter = {};                   //declaring outside because of scooping nature of javascript
    if(req.query.categories){            //if the categories are mentioned to filter the products in query, if categories are not set then it will show all the products in database
        filter = {category: req.query.categories.split(',')}         //we are assigning the property category with value that's coming from req.query and that value can be more than one,  split will split the array from comma so if there are more than one categories mentioned
    }
    // const productList = await Product.find();         //to find all products list
    // const productList = await Product.find().populate('category');       //it will give the complete details of categories along with the productList
    // const productList = await Product.find().select('name image -_id');     //.select() is used to select the properties which we want to show so here we are specifying name and image and -_id that means neglect or minimize the id from response    //it will find all the products according to the Product model
    const productList = await Product.find(filter).populate('category');       //as we know for specific type of filtering or finding we pass that specific category into find function as find({category: 'category Name'}), so we are doing that same on above in the if condition that we are assigning filter with the category as a specific property and that property's value would be assigned by req.query.categories.split(',')

    if(!productList){
        res.status(500).json({success: false})            //if we don't have any product from database or Product.find() have any error then status is 500 and send a custom msg to be success:false
    }
    
    res.send(productList)
})

// API to get a single product details
router.get(`/:id`, async (req, res)=>{     
    const product = await Product.findById(req.params.id).populate('category');    //populate means any other field or ID connected to any databse will be displayed as details as mentioned its category inside populate that means it will show us the whole category information as well with this
    if(!product){
        res.status(500).json({success: false})            
    }
    
    res.send(product)
})


// API to add a new product
router.post(`/`, uploadOptions.single('image'), async (req, res)=>{    //uploadOptions.single('image') uploadOptions returns the storage path whereas .single() is a method to upload single file and 'image' is the field name in where i want to send from frontend    //now as we are using only the slash => `/` it will work as ${api}/products because we are using ${api}/products in the app.js as the productsRouter home
   
    const category = await Category.findById(req.body.category)    //frontend will send the ID of the category in which we want to add the product       //what if frontend user sends the wrong category and that category does not exist in database so find that in database and validate category
    if(!category) return res.status(400).send('Invalid Category')

    const file = req.file;         //getting the file from the request/frontend
    if(!file) return res.status(400).send('No image in the request, Please upload')     //this is because we don't want to have any request without file

    const fileName = req.file.filename   //it will only give the filename not the url or path  //this filename is coming from the filename method in the storage of multer specified above
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`; //generating dynamic basePath      //req.protocol will give us the protocol of request as http and req.get('host') will give us the host as if its localhost:3000 or what and then its the folder path /public/uploads
    console.log('req.protocol', req.protocol)
    let product = new Product({             //setting the Product model with the values coming from frontend
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,     //basePath is http://localhost:3000/public/uploads/ and fileName is image-2323232 and in total when both combined it becomes like this => "http://localhost:3000/public/uploads/image-2323232"  // we want to have url path as well not the filename only    //here we want to have the full path of the image where it is stored, so multer already send us the request the file
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,     
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    product = await product.save();
    if(!product)           //if product is not saved
    return res.status(500).send('The product cannot be created')
    
    res.send(product)         //send the created product
})


// API to update a single produts's data 
router.put('/:id', async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){       //isValidObjectId is a mongoose function to validate the objectID it will return a boolean
       return res.status(400).send('Invalid product ID')
    }  
    const category = await Category.findById(req.body.category)    //frontend will send the ID of the category in which we want to add the product       //what if frontend user sends the wrong category and that category does not exist in database so find that in database and validate category
    if(!category) return res.status(400).send('Invalid Category')

    const product = await Product.findByIdAndUpdate(
        req.params.id,                //first parameter of findByIdAndUpdate function is to get the product by its ID and that ID is coming from req.params.id
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,     
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        {new: true}              //In the third parameter new: true means that have the updated data in the product variable and show the updated data in variable, on the other hand data is being updated in database already
    )

    if(!product)               //if we not have any responds from backend means its not updated  then
    return res.status(404).send('the product cannot be updated')

    res.send(product);         //if product is updated
})

// API to delete a product
router.delete('/:id', (req,res)=>{          //id of the specific category we want to delete will be inside the url as parameter
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product){
            return res.status(200).json({success: true, message: 'the product is deleted!'})
        } else{
            return res.status(404).json({success: false, message: 'product not found!'})
        }
    }).catch(err =>{                //if some error happens in the server or so
        return res.status(400).json({success: false, error: err})
    })
})

// API to get a product count for statistics
router.get(`/get/count`, async (req, res)=>{     
    // const productCount = await Product.countDocuments((count)=> count)    //mongoose does not support countDocuments() any longerx
    const productCount = await Product.countDocuments()    //count Documents mean counting how many records are there in Product model and in call back it will return the count
    if(!productCount){
        res.status(500).json({success: false})            
    }
    
    res.send({
    productCount: productCount})
})


// API to get featured products
router.get(`/get/featured/:count`, async (req, res)=>{     
    const count = req.params.count ? req.params.count : 0          //if get count value from req.params.count otherwise set it to 0
    const products = await Product.find({isFeatured: true}).limit(+count)      //find() accepting an object to find only the products containing that particular field, so now it will only get those products whose isFeatured have a true value and then set the limit according to count value, but req.params.count will have value in string format and limit() does not support a string value so to convert count value into number i put a + operator before count, hence we have count to show how many featured product not all featured
    if(!products){
        res.status(500).json({success: false})            
    }
    
    res.send(products)
})

// API to upload multiple images/image-gallery of product after product is created
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async(req,res)=>{    //uploadOptions.array('images, 10') means this request can accept multiple files in images field and 10 means the max count means maximum number of images in one request

    if(!mongoose.isValidObjectId(req.params.id)){       //isValidObjectId is a mongoose function to validate the objectID it will return a boolean
        return res.status(400).send('Invalid product ID')
     }
     const files = req.files;         //getting the files from request into files constant
     let imagesPaths = [];      
     const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`; //generating dynamic basePath      //req.protocol will give us the protocol of request as http and req.get('host') will give us the host as if its localhost:3000 or what and then its the folder path /public/uploads      
     if(files){                     //if files are there
        files.map(file => {                //map over files
            imagesPaths.push(`${basePath}${file.filename}`)   //push single file's basePath and filename into imagesPaths
        })
     }
     const product = await Product.findByIdAndUpdate(
        req.params.id,                //first parameter of findByIdAndUpdate function is to get the product by its ID and that ID is coming from req.params.id
        {
            images: imagesPaths
        },
        {new: true}              //In the third parameter new: true means that have the updated data in the product variable and show the updated data in variable, on the other hand data is being updated in database already
   )
   
   if(!product)               //if we not have any responds from backend means its not updated  then
   return res.status(404).send('the product cannot be updated')

   res.send(product); 
})

module.exports = router;