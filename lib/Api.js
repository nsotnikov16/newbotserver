const { apiLogger } = require('../tools/logger');
const fetch = require('node-fetch');

class Api {
    /**
     * Получить полную информацию по ботам, с которым взаимодействовал пользователь
     * @param {Array} bots 
     * @returns {object}
     */
    async getInfoBots(bots) {
        const result = await this.request('POST', 'info', { data: bots });
        apiLogger.info({ method: 'getInfoBots', result });
        return result;
    }

    /**
     * Отправляет сформированный объект для пользователя
     * @param {object} data 
     * @returns {object}
     */
    async send(data) {
        const result = await this.request('POST', '', data);
        apiLogger.info({ method: 'send', data, result });
        return result;
    }

    /**
     * Работа с тегами: Удалить/Добавить/Получить
     * @param {string} type 
     * @param {string} session_id 
     * @param {object} data 
     * @returns {object}
     */
    async actionTag(type, session_id, data = {}) {
        let url = process.env.API_URL_2;
        if (type === 'delete') url += '/udelete_tag';
        if (type === 'add') url += '/uadd_tag';
        if (type == 'get') url += `/uget_tag?session_id=${session_id}`;
        const result = await this.request(type == 'get' ? 'GET' : 'POST', url, { ...data, ...{ session_id } })
        apiLogger.info({ method: 'actionTag', type, session_id, result });
        return result;
    }

    /**
     * Закрепляет ответ на вопрос в анкету пользователя
     * @param {object} data 
     * @returns {object}
     */
    async answerToQuestion(data) {
        const result = await this.request('POST', '/addanswer', data);
        apiLogger.info({ method: 'answerToQuestion', bot_id: data.bot_id, session_id: data.session_id, result });
        return result;
    }

    /**
     * Получить анкету пользователя (ответы на все заданные вопросы ботом)
     * @param {object} data 
     * @returns {object}
     */
    async getUserAnswers(data) {
        const result = await this.request('GET', `/getanswerall?bot_id=${data.bot_id}&session_id=${data.session_id}`);
        apiLogger.info({ method: 'getUserAnswers', data, result });
        return result;
    }

    /**
     * Создать задержку на крон
     * @param {object} data 
     * @returns {object}
     */
    async createQueue(data) {
        const result = await this.request('POST', '/cron', data);
        apiLogger.info({ method: 'createQueue', data, result });
        return result;
    }

    /**
     * Получить вариант для шага "Случайный выбор"
     * @param {object} data 
     * @returns {object}
     */
    async getOptionRandom(data) {
        const url = process.env.API_URL_2 + `/get_variant?bot_id=${data.bot_id}&random_id=${data.random_id}`;
        const result = await this.request('GET', url);
        apiLogger.info({ method: 'getOptionRandom', data, result });
        return result;
    }

    /**
     * Общий метод для работы с запросами
     * @param {string} method 
     * @param {string} url 
     * @param {object} data 
     * @returns {object}
     */
    async request(method = 'GET', url = '', data) {
        let result = {};
        if (!url.includes('http')) url = process.env.API_URL + url;
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                ...method != 'GET' ? { body: JSON.stringify(data) } : ''
            })

            result = await response.json();

        } catch (error) {
            result = { error: error.message };
        }

        return result;
    }
};

module.exports = new Api();