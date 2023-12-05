const api = require('./Api');
const history = require('./History');

class Processing {

    body = {};
    bots = [];

    constructor(body) {
        this.body = body;
        this.bots = body.bots;
    }

    async start() {
        try {
            if (!Array.isArray(this.bots)) this.setError('Отсутствует массив ботов');
            if (!this.bots.length) this.setError('Массив ботов пустой');
            const info = await api.getInfoBots(this.bots);
            const { buttonId, historyElement } = history.findButtonLikeText(info, this.body.message);
            if (!buttonId) {
                this.bots = history.findQuestionOrEmpty(info);
            } else {
                this.body.type_do = 'button';
                this.body.message = buttonId;
                this.bots = [historyElement];
            }

            this.bots.forEach(bot => this.launchBot(bot));

        } catch (error) {
            console.log(error)
        }
    }

    async launchBot(bot) {
        console.log(bot);
    }

    setError(message) {
        throw new Error(message);
    }
}

module.exports = Processing