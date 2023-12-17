const Api = require('./Api');
const History = require('./History');
const Message = require('./Entity/Message');
const Delay = require('./Entity/Delay');
const { isEmptyElements } = require('../tools/functions');
const Random = require('./Entity/Random');
const Actions = require('./Entity/Actions');
const Conditions = require('./Entity/Conditions');

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

        //console.log(bot);
        const data = this.createData(bot, this.body);
    }

    async createData({ data, history }, { type_do, message, sec }) {
        this.result = []; // Формирующий массив (типы и данные для отправки пользователю)
        this.nextStep = null; // Следующий шаг
        this.indexLastBlock = 0; // Дефолтный индекс последнего блока (он будет увеличиваться в зависимости от истории)
        this.data = data; // сценарий бота
        this.history = history; // история пользователя с ботом
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
            case 'delay':
                Delay.handleCron(this); // обработка ответа длительной задержки с крона
            default:
                this.defaultProcessing();
                break;
        }

        this.nextStepProcessing();
    }

    /**
     * Обработка клика пользователя по кнопкам (они же и ответы на вопросы) из блока "Отправить сообщение"
     */
    async buttonProcessing() {
        const button = Message.findButtonInfoById(this.data, ['menu', 'text'], this.message);
        const answer = Message.findButtonInfoById(this.data, ['question'], this.message);
        // если есть кнопка со следующим шагом, то следующий элемент для обработки и будет этим шагом
        if (button.element && button.element.nextId) this.nextStep = button.element.nextId;
        // для кнопок(ответов) 
        if (answer.element) {
            // если есть следующий шаг, то следующий элемент для обработки и будет этим шагом
            if (answer.element.nextId) {
                this.nextStep = answer.element.nextId;
            } else {
                this.nextStep = answer.block.nextId;
            }

            if (this.questionId && answer.parent.id == this.questionId) {
                Api.answerToQuestion({
                    bot_id: this.bot_id,
                    session_id: this.session_id,
                    question: answer.parent.text,
                    field: answer.parent.field,
                    _id: answer.parent.id
                })
            }
        }
    }

    // Обработка сообщений от пользователя
    async defaultProcessing() {
        if (this.lastBlock == 'end') return this.result = []; // если последний шаг в истории, то прерываем и обнуляем данные

        let startBlock = this.data.find(el => el.id == this.lastBlock); // ищем стартовый блок
        if (this.lastBlock && this.questionId && startBlock) startBlock.question = true; // если стартовый блок содержит вопрос, то отметим это

        // На случай, если в сценарии удалили блок, который был в истории, тогда будем искать по предыдущему блоку
        while (!startBlock && this.lastBlock) {
            this.indexLastBlock++;
            this.lastBlock = History.findBlockByIndex(this.history, this.indexLastBlock);
            startBlock = this.data.find(el => el.id == this.lastBlock);
        }

        if (!startBlock) startBlock = this.data.find(el => el.component == 'Start'); // Если вообще ничего не найдено, то начнем со старта

        this.nextStep = this.data.find(el => el.id == startBlock.nextId);

        if (startBlock && startBlock.question) {
            this.nextStep = startBlock;
            const questionElement = startBlock.data.elements.find(el => el.id == this.questionId);
            if (questionElement) { // Если сообщение пользователя (не кнопка) являлось ответом на вопрос бота
                Api.answerToQuestion({
                    bot_id: this.bot_id,
                    session_id: this.session_id,
                    question: questionElement.text,
                    field: questionElement.field,
                    _id: questionElement.id
                })
            }
        }
    }

    async nextStepProcessing() {
        while (this.nextStep) {
            if (this.nextStep.published || isEmptyElements(this.nextStep)) continue;
            if (this.questionStop) break;
            let stepElements = this.nextStep.data.elements;
            switch (this.nextStep.type) {
                case 'message':
                    Message.addDataProcessing(this, stepElements);
                    break;
                case 'delay':
                    Delay.addDataProcessing(this, stepElements[0]);
                    break;
                case 'random':
                    const findRandom = Random.findNextStep(this, stepElements);
                    if (findRandom) {
                        this.nextStep = findRandom;
                        continue;
                    }
                    break;
                case 'actions':
                    Actions.addDataProcessing(this, stepElements);
                    break;
                case 'conditions':
                    Conditions.addDataProcessing(this, stepElements);
                    break;
            }

            if (this.questionStop) break;
            this.result.push({ step: this.nextStep.id });
            this.nextStep = this.data.find(el => el.id == this.nextStep.nextId);
        }

        if (this.result.length == 1 && this.result.find(el => el.random)) this.result.push({ step: this.lastBlock });
    }

    setError(message) {
        throw new Error(message);
    }
}

module.exports = Processing