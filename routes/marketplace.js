//TODO: add all available books on marketplace
//TODO: nice user interface for marketplace
//TODO: add tags on books when uploading
//TODO: add filter options for books - TAGS and by price
//TODO: sponsored books at the top level
//TODO: search bar for book titles
//TODO: mark favorite on admin panel

//---------------------------------

//TODO: implement payment system with crypto
//TODO: book link download-able after paying



const express = require('express');
const router = express.Router();


const Product = require("../models/products");


const ensureAuthenticated = require("../middleware/auth");

router.get("/", ensureAuthenticated, async (req, res) => {

    const monthlyFavorites = await Product.find({ in_review: false, deleted: false, declined: false, favorite: true}).limit(5)
    const booksForSale = await Product.find({ in_review: false, deleted: false, declined: false,})

    res.render("marketplace", {user: req.user, monthlyFavorites, booksForSale})

})

router.post("/purchase", ensureAuthenticated, async (req, res) => {

    const itemId = req.body.elementId;
    const userId = req.user._id;
    
    console.log(itemId)
    console.log(userId)

    res.send("Implenting as we speak! :)")

})

module.exports = router;
