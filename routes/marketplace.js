//TODO: shadow on hover book card
//TODO: make individual product page with long description and tags
//TODO: replace purchase button with product page button

//---------------------------------

//TODO: implement payment system with crypto
//TODO: book link download-able after paying



const express = require('express');
const router = express.Router();


const Product = require("../models/products");

const { check, validationResult } = require("express-validator");
const ensureAuthenticated = require("../middleware/auth");
const timeoutMiddleware = require("../middleware/timeout");


router.get("/", ensureAuthenticated, async (req, res) => {

    //todo: add try / catch

    const monthlyFavorites = await Product.find({ in_review: false, deleted: false, declined: false, favorite: true}).limit(5)
    const booksForSale = await Product.find({ in_review: false, deleted: false, declined: false,})

    const tag = req.query.tag;
    const search = req.query.searchQuery

    let taggedProducts;
    let tagged = false;

    if (tag) {

        taggedProducts = await Product.find({ in_review: false, deleted: false, declined: false, categories: {$in: [tag] } })
        tagged = true;

    } else {
        taggedProducts = booksForSale
    }

    if(search) {

    const searchString = req.query.searchQuery;
    taggedProducts = await Product.find({ name: {$regex: searchString, $options: 'i'}, in_review: false, deleted: false, declined: false})
    tagged = true;

    }

    const aggregate = await Product.aggregate([
        { $unwind: "$categories" },
        { $group: { _id: "$categories", count: { $sum: 1 } } }
    ])

    aggregate.sort((a, b) => a._id.localeCompare(b._id));

    res.render("marketplace", {user: req.user, monthlyFavorites, taggedProducts, tagged, categories: aggregate,})

})


router.post("/purchase", ensureAuthenticated, async (req, res) => {

    const itemId = req.body.elementId;
    const userId = req.user._id;
    
    console.log(itemId)
    console.log(userId)

    res.send("Implenting as we speak! :)")

})

const validateRequest = [
    check("searchQuery")
      .trim()
      .escape()
      .notEmpty()
      .toLowerCase()
  ];

router.post("/search", ensureAuthenticated, validateRequest, async (req, res) => {

    try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res
        .status(400)
        .redirect("/marketplace");
      }

     const searchString = req.body.searchQuery;

      res.redirect(`/marketplace/?searchQuery=${searchString}`)


    } catch (error) {
    console.error("An error occurred:", error);
      res.status(500).send("Internal Server Error");
    }

} )

module.exports = router;
