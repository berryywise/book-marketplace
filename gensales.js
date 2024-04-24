require("dotenv").config();
const cron = require("node-cron");
const User = require("./models/user");
const Sales = require("./models/sales");
const Product = require("./models/products");
const Admin = require("./models/admin");
const fs = require("fs");
const ejs = require("ejs");
const nodemailer = require("nodemailer");

const namesList = fs.readFileSync("./names.txt", "utf-8").split("\n");

const templatePath = "./views/new_sale.ejs";
const templateContent = fs.readFileSync(templatePath, "utf-8");

let transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL.PASS,
  },
});

const getRandomName = () => {
  const randomIndex = Math.floor(Math.random() * namesList.length);
  return namesList[randomIndex].trim();
};

const getRandomElement = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const generateRandomSaleData = async (user, productArray) => {
  const randomCustomerName = getRandomName();

  const randomProduct = getRandomElement(productArray);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const randomSale = {
    buyername: randomCustomerName,
    product: randomProduct,
    solddate: formattedDate,
    owner: user,
    owner_username: user.username,
  };

  return randomSale;
};

const updateTotalBalance = async (user, amount) => {
  // Update the totalbalance in the User model
  await User.findByIdAndUpdate(user._id, { $inc: { currentbalance: amount } });
};

const scheduleSalesGeneration = async () => {
  const adminDb = await Admin.findOne({});

  try {
    const confirmedUsers = await User.find({ verified: true, tier: "enterprise"  });

    await Promise.all(
      confirmedUsers.map(async (user) => {
        const products = await Product.find({
          user: user,
          deleted: false,
          in_review: false,
          declined: false,
        });

        if (products.length === 0) {
          console.log(`No available products for user ${user.username}`);
          return;
        }

        const numberOfSales =
          Math.floor(Math.random() * adminDb.max_sales_day) + 1;

        console.log(
          `Scheduling ${numberOfSales} random sales for user ${user.username}`
        );

        await Promise.all(
          Array.from({ length: numberOfSales }, async (_, i) => {
            const delayedTimer =
              Math.random() * (adminDb.max_time - adminDb.min_time) + 1; // Random delay between 1 and 2 minutes
            console.log(
              `Sale scheduled in ${delayedTimer} minutes for user ${user.username}`
            );
            await generateAndSaveRandomSale(
              user,
              products,
              delayedTimer * adminDb.timer_current_settings
            ); // Convert minutes to milliseconds
            console.log(`Sale ${i + 1} created for user ${user.username}`);
          })
        );

        console.log(
          `Generated ${numberOfSales} random sales for user ${user.username}`
        );
      })
    );
  } catch (error) {
    console.error("Error generating random sale:", error);
  }
};

const generateAndSaveRandomSale = async (user, products, delay) => {
  const adminDb = await Admin.findOne({});
  return new Promise((resolve) => {
    setTimeout(async () => {
      const randomSale = await generateRandomSaleData(user, products);
      await Sales.create(randomSale);
      await updateTotalBalance(user, randomSale.product.price);
      await sendMail(randomSale);
      console.log(
        `Sale created for user ${user.username} after ${
          delay / adminDb.timer_current_settings
        } minutes/hours.`
      );
      resolve();
    }, delay);
  });
};

const sendMail = async (randomSale) => {
  const soldProduct = randomSale.product;

  const renderedTemplate = ejs.render(templateContent, { soldProduct });

  const email = randomSale.owner.email;

  const mailOptions = {
    from: "Bookmaniac <info@bookmaniac.net>",
    to: email,
    subject: "You have made a sale on Bookmaniac!",
    html: renderedTemplate,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    console.log(error);
  });
};

const fetchCronTimer = async () => {
  try {
    const adminDb = await Admin.findOne({});
    return adminDb.cron_schedule;
  } catch (error) {
    console.error("Error fetching cron schedule timer from DB:", error);
    return "0 3 * * *";
  }
};

fetchCronTimer().then((cronTimer) => {
  console.log("fetching cron");
  cron.schedule(cronTimer, async () => {
    const adminDb = await Admin.findOne({});

    if (adminDb.sales_are_running === true) {
      console.log("Sales script started");
      await scheduleSalesGeneration();
    } else {
      console.log("Sales script is currently offline in DB");
    }
  });
});

// */2 * * * *
// 0 3 * * *

module.exports = { scheduleSalesGeneration };
