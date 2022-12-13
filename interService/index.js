const axios = require('axios');

module.exports = {
    newAxios: (req, res, option) => {
        let token = req.headers['x-access-token'] || req.headers['authorization'];
        if (token) {
            let headers = {
                'authorization': token
            }
            if (req.headers.payment_gateway) {
                headers = { ...headers }
            }
            const client = axios.create({
                headers: headers,
                json: true
            });
            return client(option).catch(function (error) {

                return Promise.reject(error);
            });
        } else {
            let error = new Error("token is required!");
            error.status = 401;
            return Promise.reject(error);
        }
    },
    newAxiosWithoutAuth: (req, res, option) => {

            let headers = {};
            headers.interServiceAuthentication = process.env.INTER_SERVICE_SECRET_KEY
            if (req.headers.payment_gateway) {
                headers = { ...headers }
            }
            const client = axios.create({
                headers: headers,
                json: true
            });
            return client(option).catch(function (error) {

                return Promise.reject(error);
            });
    }
}
