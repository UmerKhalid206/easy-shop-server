const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

//API to show list of all categories 
router.get(`/`, async (req, res) =>{        
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})

// API to find a category by its ID for its details
router.get('/:id', async(req,res)=>{
    const category = await Category.findById(req.params.id);

    if(!category){        //if category is not found
        res.status(500).json({message: 'The category with the given ID was not found'})
    }
    res.status(200).send(category);            //if category is found
})


//API to add category
router.post('/', async (req, res) =>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    }) 
    category = await category.save();        //saving the category

    if(!category)               //if we not have any responds from backend means its not saved then
    return res.status(404).send('the category cannot be created')

    res.send(category);             //send the category which is saved as response
})

// API to update a single category's data 
router.put('/:id', async(req,res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,                //first parameter of findByIdAndUpdate function is to get the category by its ID and that ID is coming from req.params.id
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        {new: true}              //In the third parameter new: true means that have the updated data in the category variable and show the updated data in variable, on the other hand data is being updated in database already
    )

    if(!category)               //if we not have any responds from backend means its not updated  then
    return res.status(404).send('the category cannot be updated')

    res.send(category);         //if category is updated
})

// API to delete a category
router.delete('/:id', (req,res)=>{          //id of the specific category we want to delete will be inside the url as parameter
    Category.findByIdAndRemove(req.params.id).then(category =>{
        if(category){
            return res.status(200).json({success: true, message: 'the category is deleted!'})
        } else{
            return res.status(404).json({success: false, message: 'category not found!'})
        }
    }).catch(err =>{                //if some error happens in the server or so
        return res.status(400).json({success: false, error: err})
    })
})



module.exports =router;