const Admin = require("./models/admin");


const populate = async () => {

    const adminData = {
        max_product_price: 55,
        max_product_limit: 5,
        max_sales_day: 3,
        sales_are_running: false,
        products_in_review: 0,
        admin_review_days: 14,
        cron_schedule: "*/2 * * * *",
        cron_sale_day: "0 3 * * *",
        cron_sale_min: "*/2 * * * *",
    }

    const result = await Admin.create(adminData)

    console.log(result)

}


module.exports = { populate }