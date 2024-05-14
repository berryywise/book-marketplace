//TODO: search bar for book titles
//TODO: make individual product page with long description and tags
//TODO: replace purhcase button with product page button
//TODO: shadow on hover book card

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

    const tag = req.query.tag;
    let taggedProducts;

    if (tag) {

        taggedProducts = await Product.find({ in_review: false, deleted: false, declined: false, categories: {$in: [tag] } })

    } else {
        taggedProducts = booksForSale
    }

    const aggregate = await Product.aggregate([
        { $unwind: "$categories" },
        { $group: { _id: "$categories", count: { $sum: 1 } } }
    ])

    aggregate.sort((a, b) => a._id.localeCompare(b._id));

    res.render("marketplace", {user: req.user, monthlyFavorites, taggedProducts, categories: aggregate})

})

router.post("/purchase", ensureAuthenticated, async (req, res) => {

    const itemId = req.body.elementId;
    const userId = req.user._id;
    
    console.log(itemId)
    console.log(userId)

    res.send("Implenting as we speak! :)")

})

module.exports = router;
