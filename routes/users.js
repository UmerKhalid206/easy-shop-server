const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');           //faster than bcryptjs
// const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// API to get list of the users
router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');      //.select('-passwordHash') will exclude passwordHash field from the list

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

// API to find a single user by its ID for its details
router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user){        //if user is not found
        res.status(500).json({message: 'The user with the given ID was not found'})
    }
    res.status(200).send(user);            //if user is found
})

//API to add admin
router.post('/', async (req, res) =>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),     //hashing the password using the bcryptjs library, whereas 10 is the salt its like a secret you can use anything here
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    }) 
    user = await user.save();        //saving the user

    if(!user)               //if we not have any responds from backend means its not saved then
    return res.status(404).send('the user cannot be created')

    res.send(user);             //send the user which is saved as response
})

// API to update user

router.put('/:id',async (req, res)=> { 

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})


// API for Login
router.post('/login', async (req,res)=>{
const user = await User.findOne({email: req.body.email})        //searching for user in database using email
const secret = process.env.secret;
if(!user){               //if user not found 
    return res.status(400).send('The user not found');
}


if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {      //comparing the user entered password with the passwordHash that comes from database in user constant
    const token = jwt.sign(           //when the user is authenticated
        {
            userId: user.id,      //this generated token will have userId that we are passing here encoded in it    //the user id that we get from the user constant using req.body.email 
            isAdmin: user.isAdmin  //we will also send isAdmin value from here in this token as encoded form and in frontend we will decode the token to extract this information
        },
        secret,                   //the secret key to generate token
        {expiresIn: '1d'}        //third parameter of the sign method is options and in that option i have the expiry time
    )
res.status(200).send({user: user.email, token: token})    //sending the useremail as user and token for now
} else{
    res.status(400).send('password is wrong');
}

})

// api to register as user

router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

// API to delete a user
router.delete('/:id', (req,res)=>{          //id of the specific category we want to delete will be inside the url as parameter
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user){
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else{
            return res.status(404).json({success: false, message: 'user not found!'})
        }
    }).catch(err =>{                //if some error happens in the server or so
        return res.status(400).json({success: false, error: err})
    })
})

// API to get a users count for statistics
router.get(`/get/count`, async (req, res)=>{     
    // const productCount = await Product.countDocuments((count)=> count)    //mongoose does not support countDocuments() any longerx
    const userCount = await User.countDocuments()    //count Documents mean counting how many records are there in Product model and in call back it will return the count
    if(!userCount){
        res.status(500).json({success: false})            
    }
    
    res.send({
    userCount: userCount})
})

module.exports =router;