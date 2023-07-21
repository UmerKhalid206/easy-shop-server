// defining schemas and models for products
const mongoose = require('mongoose')
// products schema
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''           //default value
    },
    image: {
        type: String,
        default: ''
    },
    images : [{                //will have multiple images here so it will be an array of string
        type: String
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    category: {           //category is of type of Category, when we add product we need only the id of category not the whole category, means the link between the table of product to the table of category is the ID here
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',       //the ID is connected to the category schema     //how the id above is connected to the category schema we will define here
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,              //this is because no one can enter value smaller than 0 like a negative number
        max: 255
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {            //when to add product api will called it will create the date at that time as default
        type: Date,
        default: Date.now,
    },
})

// for mongoose id without underscore in it
productSchema.virtual('id').get(function (){
    return this._id          //this._id used to get the _id from schema and tohexString() will convert _id into id keyword but now its not allowed to use tohexString() in js
})

// it will allow/enable productSchema to use the virtuals
productSchema.set('toJSON', {
    virtuals: true,
});

//model
exports.Product = mongoose.model('Product', productSchema);

