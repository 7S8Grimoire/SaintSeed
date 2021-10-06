const { default: axios } = require('axios');

exports.api = axios.create({
    baseURL: process.env.REST_BASE_URL,    
    headers: {
        Authorization: process.env.REST_AUTHORIZATION,
        Cache: process.env.REST_CACHE
    }
});