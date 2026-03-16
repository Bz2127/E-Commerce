const axios = require('axios');

const CHAPA_BASE_URL = 'https://api.chapa.co/v1';
const CHAPA_AUTH_KEY = process.env.CHAPA_AUTH_KEY || 'CHASECK_TEST-1GS4iujRWAaOczJQGI8QcVVKV0dPi9FP';

const chapaClient = axios.create({
    baseURL: CHAPA_BASE_URL,
    headers: { Authorization: `Bearer ${CHAPA_AUTH_KEY}` }
});

const initializePayment = async (data) => {
    return chapaClient.post('/transaction/initialize', data);
};

const verifyPayment = async (tx_ref) => {
    return chapaClient.get(`/transaction/verify/${tx_ref}`);
};

module.exports = { initializePayment, verifyPayment, CHAPA_AUTH_KEY };
