const { infoBotsLogger } = require('../../middlewares/logger');
const fetch = require('node-fetch');

class Api {
    url = process.env.API_URL;

    async getInfoBotsRequest(bots) {
        const result = await this.request('GET', 'info', { data: bots });
        infoBotsLogger.info(result);
        return result;
    }

    async request(method = 'GET', url, data) {
        let result = {};
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            result = await response.json();

        } catch (error) {
            result = { error: error.message };
        }

        return result;
    }
};

module.exports = new Api();