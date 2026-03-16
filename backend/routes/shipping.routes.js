const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shipping.controller');

router.post('/zone', shippingController.createZone);
router.get('/zones', shippingController.getZones);

router.post('/method', shippingController.createMethod);
router.get('/method/:zone_id', shippingController.getMethodsByZone);

router.put('/method/:id', shippingController.updateMethod);
router.delete('/method/:id', shippingController.deleteMethod);

module.exports = router;