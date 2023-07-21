const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({       //schema of orders
    orderItems: [{                    //maybe we will have multiple order items so we enclosed this object in array
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',      //relation to the OrderItem table or OrderItem model
        required: true
    }],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    zip:{
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type:String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice:{
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',                        //relationing/linking with User model to get user information here
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

// for mongoose id without underscore in it
orderSchema.virtual('id').get(function (){
    return this._id          //this._id used to get the _id from schema and tohexString() will convert _id into id keyword but now its not allowed to use tohexString() in js
})
// it will allow/enable orderSchema to use the virtuals
orderSchema.set('toJSON', {
    virtuals: true,
});

exports.Order = mongoose.model('Order', orderSchema);

/* 
Order Example: 

{
    "orderItems": [
        {
            "quantity": 3,
            "product": "5md98dmkj9ewndcdks987"             //its a product ID not its name
        },
        {
            "quantity": 2,
            "product": "7skfbk34cskjn12lmd455" 
        }
    ],
    "shippingAddress1": "Flowers Street , 45",
    "shippingAddress2": "1-B",
    "city": "Prague",
    "zip": "00000",
    "country": "Czech Republic",
    "phone": "+420702241333",
    "user": "5ha3kasb7ansqkwj12aj546"
}

*/