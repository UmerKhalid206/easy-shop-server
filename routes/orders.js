const {Order} = require('../models/order');
const express = require('express');
const {OrderItem} = require('../models/order-item');
const router = express.Router();

// API to get orderList
router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name phone').sort({'dateOrdered': -1});     //find the order list and also populate the information of user name and phone fields only because in second parameter of populate it is defined that we only need name and phone   //sort the orderlist according to the field mentioned in commas which is dateOrdered it will be sorted older to newest  //if you wanted to sort newest to oldest then in the sort put dateOrdered in object and has its value to be -1 such as =>  {'dateOrdered': -1}

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

// API to get single order details
router.get(`/:id`, async (req, res) =>{
    const orderDetails = await Order.findById(req.params.id)
    // Note: populate will only extract the information from database using the id and relational databse that's the flexibility of mongoose
    .populate('user', 'name phone')        //populate to get the information of the user
    .populate({                       //as the orderItems are in an array and to populate each product detail from that array we have this method as we describe the path is "orderItems" inside orderDetails and on that path and give the information of the product according to the id of that product as well as if we want to get the information of category then mention it as well with its path
        path: 'orderItems', populate: {   //simply... In orderItems populate product details
            path: 'product', populate: 'category'}   //then in product path populate the information of category
        })  
    if(!orderDetails) {
        res.status(500).json({success: false})
    } 
    res.send(orderDetails);
})

//API to post an order
router.post('/', async (req, res) =>{

    // Promise.all() means when you have all the result compiled then store it in orderItemsIds array 
    const orderItemsIds =Promise.all(req.body.orderItems.map(async orderItem =>{   //Promise.all() is to resolve the promise as orderItemsIds is an array and that array is getting filled by an async map function that will have some delay or promise to combine all results thats why we are using promise.all()   //looping over the orderItems from the user in frontend        //we will get them after orderItems creation in database, first we need to loop in the orderItems which are sent from the user which will be an array of orderItems
    let newOrderItem = new OrderItem({       //at each iteration newOrderItem will get new values as it will be an array
        quantity: orderItem.quantity,     //getting the value of quantity on each iteration of map loop from orderItem and then assigning that value to the quantity property from OrderItem model
        product: orderItem.product        //extracting the product from the user selected product
    })

    newOrderItem = await newOrderItem.save();           //saving the newOrderItem which is an array into database
    return newOrderItem._id;             //we only want the Id's of new order items so here it will only return id's to the const orderItemsIds
    }))

    const orderItemsIdsResolved = await orderItemsIds;   //orderItemsIds is an array handling or combining promises in it so it will also return a promise so to resolve that promise we used await before orderItemsIds and then we store that resolved promise in orderItemsIdsResolved constant

    const totalPrices =await Promise.all(orderItemsIdsResolved.map(async orderItemId =>{   //getting a single item's id which is ordered in a whole order , as we know orderItemsIdsResolved is an array that contains all the items id's that are ordered in a single order
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')     //findById(orderItemId) will only get the quantity and Id of ordered product, so to get that products entire informations whose Id is here we will populate it and will only retrieve price from that product's detail
        const totalPrice = orderItem.product.price * orderItem.quantity;   //as we know orderItem const contains product price as well as its quantity so multiple both we will get the price of a single item but can have multiple quantity
        return totalPrice;
    }))
    
    const totalPrice = totalPrices.reduce((a,b) => a +b, 0);    //as we know totalPrices is an array containing the prices for each item separately at each index we have to sum up the whole array, that's why reduce is a method to sum up whole array   //reduce((a,b) => a +b, 0)  means the 0 stands for start from the index which is zero here and in first paramter it shows a is 0th index and b is 1st index at first iteration of reduce loop 

    let order = new Order({
        orderItems: orderItemsIdsResolved,      //we only need array of ID's that will not come from the user himself but from the created orderItemsIdsResolved above
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
        
    }) 
    order = await order.save();        //saving the order

    if(!order)               //if we not have any responds from backend means its not saved then
    return res.status(404).send('the order cannot be created')

    res.send(order);             //send the order which is saved as response
})


// API to update a single category's data 
router.put('/:id', async(req,res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,                //first parameter of findByIdAndUpdate function is to get the order by its ID and that ID is coming from req.params.id
        {
            status: req.body.status
        },
        {new: true}              //In the third parameter new: true means that have the updated data in the category variable and show the updated data in variable, on the other hand data is being updated in database already
    )

    if(!order)               //if we not have any responds from backend means its not updated  then
    return res.status(404).send('the order cannot be updated')

    res.send(order);         //if order is updated
})

// API to delete an order
router.delete('/:id', (req,res)=>{          //id of the specific order we want to delete will be inside the url as parameter
    Order.findByIdAndRemove(req.params.id).then(async order =>{    //when we find in the Order database for order which to be deleted then during that find we also have that entire order as response from databse then
        if(order){            //if order is there
            await order.orderItems.map(async orderItem =>{  //the await here is for orderItems of a single order that how much orderItems it contains and then map over it    //if order is there then from that order get the orderItems and map over those orderItems which are actually orderItems id's and so map will get a single id at one iteration and that id is in orderItem
                await OrderItem.findByIdAndRemove(orderItem) //the await here is for the single orderItem removal of the order and that order can contains many orderItems  //now find that orderItem(which is an ID of orderItem here) in the OrderItem database and then remove it
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else{
            return res.status(404).json({success: false, message: 'order not found!'})
        }
    }).catch(err =>{                //if some error happens in the server or so
        return res.status(400).json({success: false, error: err})
    })
})

// API to get totalSales in cash of e-shop
router.get('/get/totalsales', async (req,res)=>{
    const totalSales = await Order.aggregate([    //we will get the total sales from mongodb using the aggregate method of mongoose
    //i can join or group like in relational databse all tables or all documents inside a table and then i have one field in that table and use mongoose method like sum on that field and it will return me sum of all fields which name totalPrice, as we have total Prices of each order so here we need to sum all orders totalPrices in one 
    {$group: {_id: null , totalsales: {$sum : '$totalPrice'}}}    //it will return sum of totalPrices
])
    if(!totalSales){              //if totalSales is empty
        return res.status(400).send('The order sales cannot be registered')
    }

    // res.send({totalsales: totalSales})      // else send the totalSales
    res.send({totalsales: totalSales.pop().totalsales})      // else send the totalSales //.pop().totalsales means only return the totalsales value not the id only totalsale

})

// API to get a product count for statistics
router.get(`/get/count`, async (req, res)=>{     
    const orderCount = await Order.countDocuments()    //count Documents mean counting how many records are there in Order model and in call back it will return the count
    if(!orderCount){
        res.status(500).json({success: false})            
    }
    
    res.send({
    orderCount: orderCount})
})

module.exports =router;