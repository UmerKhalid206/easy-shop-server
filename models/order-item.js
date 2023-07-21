const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({       //schema of orders
    quantity: {
        type: Number,
        required: true
    },
    product:{              //we need to link this orderItem which is=> 'product' with the product model or databse
        type: mongoose.Schema.Types.ObjectId,            //so link with other database we need to have its type as objectID
        ref: 'Product'                //reference is with Product model or database
    }
})

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);
