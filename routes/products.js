const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const Admin = require("../models/admin");
const ensureAuthenticated = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const timeoutMiddleware = require("../middleware/timeout");
const multerMiddleware = require("../middleware/multer");
const path = require("path");
const fs = require("fs");

const saveDirectory = getSaveDirectory();

function getSaveDirectory() {
  const railwayVolumeMountPath = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  return railwayVolumeMountPath
    ? railwayVolumeMountPath
    : path.join(__dirname, "..", "uploads");
}

const validateProductRequest = [
  check("name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters long."),
  check("price").trim().escape().notEmpty().withMessage("Price is required"),
  check("description")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 3, max: 500 })
    .withMessage("Description must be between 3 and 500 characters long."),
];

router.get("/", ensureAuthenticated, async (req, res) => {
  const products = await Product.find({ user: req.user, deleted: false });

  await updateAdminDb();

  res.render("products", { products, user: req.user });
});

router.get("/add", ensureAuthenticated, async (req, res) => {
  try {
    const adminDb = await Admin.findOne({});

    res.render("add", { adminDb, errors: [], user: req.user });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/delete", ensureAuthenticated, async (req, res) => {
  try {
    const itemId = req.body.elementId;

    await Product.findByIdAndUpdate(
      itemId,
      { $set: { deleted: true } },
      { new: true }
    );

    await updateAdminDb();

    res.redirect("/products");
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/add",
  multerMiddleware,
  validateProductRequest,
  ensureAuthenticated,
  timeoutMiddleware,
  async (req, res) => {
    try {
      const adminDb = await Admin.findOne({});

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(400)
          .render("add", { adminDb, errors: errors.array() });
      }

      const userProductsCount = await Product.countDocuments({
        user: req.user._id,
        deleted: false,
      });

      const MAX_PRODUCT_LIMIT = req.user.max_products;

      if (!req.files["pdfFile"] || !req.files["thumbnailFile"]) {
        return res.render("add", {
          adminDb,
          user: req.user,
          errors: [{ msg: `Both PDF file and Thumbnail are required!` }],
        });
      }

      const thumbnailFile = req.files["thumbnailFile"][0];
      const pdfFile = req.files["pdfFile"][0];

      req.body.price = parseFloat(req.body.price);

      if (typeof req.body.price != "number") {
        return res.render("add", {
          adminDb,
          user: req.user,
          errors: [{ msg: `Price must be a number!` }],
        });
      }

      const checkboxNames = [
        "Drama",
        "Adventure",
        "Sci-Fi",
        "Horror",
        "Fantasy",
        "Self-Help",
        "Romance",
        "Finance",
      ];

      const checked = [];

      checkboxNames.forEach((name) => {
        if (req.body[name] === name) {
          checked.push(name);
        }
      });

      const productData = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        thumbnail: thumbnailFile.path,
        file: pdfFile.path,
        user: req.user._id,
        owner_username: req.user.username,
        categories: checked,
      };

      if (
        productData.price < 1 ||
        productData.price > adminDb.max_product_price
      ) {
        return res.render("add", {
          adminDb,
          user: req.user,
          errors: [
            {
              msg: `Price can't be lower as $1 or greater then $${adminDb.max_product_price}`,
            },
          ],
        });
      }

      if (userProductsCount >= MAX_PRODUCT_LIMIT) {
        return res.render("add", {
          adminDb,
          user: req.user,
          errors: [
            {
              msg: `You can currently add only ${MAX_PRODUCT_LIMIT} product with your current tier.`,
            },
          ],
        });
      }

      await Product.create(productData);

      await updateAdminDb();

      res.redirect("/products");
    } catch (error) {
      console.error("An error occurred:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

const updateAdminDb = async () => {
  try {
    const productInReviewCount = await Product.countDocuments({
      in_review: true,
      deleted: false,
    });

    await Admin.updateOne(
      {},
      { $set: { products_in_review: productInReviewCount } }
    );
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

module.exports = router;
