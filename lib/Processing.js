const Api = require('./Api');
const History = require('./History');
const Message = require('./Entity/Message');

/**
 * Основной класс для работы с процессом бота
 */
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
            const info = await Api.getInfoBots(this.bots);
            this.modifyBots(info);
            this.bots.forEach(bot => this.launchBot(bot));
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Модификация ботов (поиск кнопки/вопроса или с нулевой историей)
     * @param {Array} infoBots 
     */
    async modifyBots(infoBots) {
        const { buttonId, historyElement } = History.findButtonLikeText(infoBots, this.body.message);
        if (!buttonId) {
            this.bots = History.findQuestionOrEmpty(infoBots);
        } else {
            this.body.type_do = 'button';
            this.body.message = buttonId;
            this.bots = [historyElement];
        }
    }

    async launchBot(bot) {
        this.bot_id = bot.bot_id;
        this.session_id = bot.session_id;
        const data = this.createData(bot);
    }

    async createData({data, history}, { type_do, message, sec }) {
        let result = []; // Формирующий массив
        this.nextElement = null; // Следующий шаг
        this.indexLastBlock = 0; // Дефолтный индекс последнего блока (он будет увеличиваться в зависимости от истории)
        this.data = data; // сценарий бота
        this.message = message; // сообщение из запроса (либо текст, либо ID для кнопок или задержки)
        this.sec = sec; // количество секунд (если type_do == 'delay')
        this.type_do = type_do; // тип приходящего сообщения - message, button, delay
        this.questionStop = false; // Остановка цикла, если был задан вопрос

        // Ищем крайний шаг в истории 
        this.lastBlock = History.findBlockByIndex(history, this.indexLastBlock);
        // Ищем ID вопроса, заданного ботом
        this.questionId = History.getQuestionId(history);

        switch (type_do) {
            case 'button':
                this.buttonProcessing();
                break;
        
            default:
                this.defaultProcessing();
                break;
        }

        return result;
    }

    /**
     * Обработка клика пользователя по кнопкам (они же и вопросы) из блока "Отправить сообщение"
     */
    async buttonProcessing() {
        const button = Message.findButtonInfoById(this.data, ['menu', 'text'], this.message);
        const answer = Message.findButtonInfoById(this.data, ['question'], this.message);
        // если есть кнопка со следующим шагом, то следующий элемент для обработки и будет этим шагом
        if (button.element && button.element.nextId) this.nextElement = button.element.nextId;
        // для кнопок(ответов) 
        if (answer.element) {
            // если есть следующий шаг, то следующий элемент для обработки и будет этим шагом
            if (answer.element.nextId) {
                this.nextElement = answer.element.nextId;
            } else {
                this.nextElement = answer.block.nextId;
            }

            if (this.questionId) {
                const questionEl = elementWhereAnswer.data.elements.find(el => el.id == this.questionId)
                const answer = getAnswerData(questionEl, answer.element.title, answer.element.id)
                if (answer) answerToQuestion({ bot_id: this.bot_id, session_id: this.session_id, ...answer.element });
            }
        }
    }

    // Обработка сообщений от пользователя или задержки с сервера
    async defaultProcessing() {

    }


    setError(message) {
        throw new Error(message);
    }
}

module.exports = Processing