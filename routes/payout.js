const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Admin = require("../models/admin");
const ensureAuthenticated = require("../middleware/auth");

const endReviewPeriod = async (user) => {
  try {
    const adminDb = await Admin.findOne({});

    if (!user.manualreview) {
      if (user.inreview == true) {
        const reviewStartDate = user.accountcreated;
        const maxdays = new Date(reviewStartDate);
        maxdays.setDate(reviewStartDate.getDate() + adminDb.admin_review_days);

        if (new Date() >= maxdays) {
          user.inreview = false;
          await user.save();
        }
      }
    }
  } catch (error) {
    console.error("Error in endReviewPeriod:", error);
  }
};

const calculatePayout = (user) => {
  try {
    if (user.inreview) {
      return { formattedDate: "In review", payoutDateExpired: false };
    } else {
      const reviewEndDate = user.accountcreated;
      const userestimatedpayoutdays = user.estimatedpayout;
      const estimatedPayoutDate = new Date(reviewEndDate);
      estimatedPayoutDate.setDate(
        reviewEndDate.getDate() + 14 + userestimatedpayoutdays
      ); // 14 days review + 30 days

      const formattedDate = estimatedPayoutDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const payoutDateExpired = new Date() >= estimatedPayoutDate;

      return { formattedDate, payoutDateExpired };
    }
  } catch (error) {
    console.error("Error in calculatePayout:", error);
    return { formattedDate: "Error", payoutDateExpired: false };
  }
};

const updatePayout = async (user) => {
  try {
    const { formattedDate, payoutDateExpired } = await calculatePayout(user);

    const renderMsg = [];

    const renderObj = {
      estimated: "",
      msg: "",
    };

    if (user.currentbalance < 10) {
      renderObj.msg =
        "Reach a balance of at least $10 to be paid out for your sales.";
    }

    if (user.inreview == false && payoutDateExpired == false) {
      renderObj.estimated = formattedDate;
    } else {
      renderObj.estimated = "On hold";
    }

    if (payoutDateExpired) {
      user.issue = true;
      await user.save();
      renderMsg.push({
        msg: "<h3>There is an issue with your account, please contact customer support.</h3>",
      });
    }

    return { array: renderMsg, object: renderObj };
  } catch (error) {
    console.error("Error in updatePayout:", error);
  }
};

router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    await endReviewPeriod(req.user);
    const userResult = await updatePayout(req.user);

    let userbalance = req.user.currentbalance.toFixed(2);

    res.render("payout", {
      user: req.user,
      userbalance,
      renderObj: userResult.object,
      renderMsg: userResult.array,
    });
  } catch (error) {
    console.error("Error in /payout route:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
