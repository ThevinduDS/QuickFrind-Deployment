// routes/homePage.routes.js
const express = require("express");
const router = express.Router();
const homePageController = require("../controllers/homePage.control");

router.get("/early-providers", homePageController.getEarlyAddedProviders);

module.exports = router;
