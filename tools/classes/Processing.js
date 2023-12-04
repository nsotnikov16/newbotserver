const Api = require('./Api');

class Processing {

    _body = {};
    _bots = [];

    constructor(body) {
        this._body = body;
        this._bots = body.bots;
    }

    async start() {
        try {
            if (!Array.isArray(this._bots)) this.setError('Отсутствует массив ботов');
            if (!this._bots.length) this.setError('Массив ботов пустой');
            
        } catch (error) {
            console.log(error)
        }
    }

    async getInfoBots() {

    }

    setError(message) {
        throw new Error(message);
    }
}

module.exports = Processing