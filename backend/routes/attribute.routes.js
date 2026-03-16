const express = require('express');
const router = express.Router();
const attributeController = require('../controllers/attribute.controller');


router.get('/', attributeController.getAttributes);
router.post('/', attributeController.createAttribute);

router.get('/value/:attribute_id', attributeController.getAttributeValues);
router.post('/value', attributeController.addAttributeValue);

router.post('/assign', attributeController.assignAttributeToProduct);

router.put('/:id', attributeController.updateAttribute);
router.delete('/:id', attributeController.deleteAttribute);
router.delete("/attributes/value/:id", attributeController.deleteAttributeValue);

module.exports = router;