const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.post('/', notificationController.createNotification);

router.get('/:user_id', notificationController.getUserNotifications);

router.put('/read/:id', notificationController.markAsRead);

router.put('/read-all/:user_id', notificationController.markAllAsRead);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
