const express = require("express");
const router = express.Router();

const {
  initializePayment,
  verifyPayment,
  getTransactions,
  getPaymentLogs,
  processMissedPayments 
} = require("../controllers/payment.controller");

router.post("/initialize", initializePayment);

router.get("/verify/:tx_ref", verifyPayment);

router.get("/transactions", getTransactions);

router.get("/logs", getPaymentLogs);
router.post('/process-missed', processMissedPayments);


module.exports = router;