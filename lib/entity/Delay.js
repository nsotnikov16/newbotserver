const { cronDelay } = require("../../tools/constants");

/**
 * Класс для работы с задержками
 */
class Delay {

    /**
     * Обработка задержки с крона
     * @param {object} ctx 
     */
    handleCron(ctx) {
        if (ctx.type_do === 'delay' && ctx.sec) {
            const findDelay = ctx.data.find(el => el.id == ctx.message);
            if (findDelay) {
                ctx.lastBlock = ctx.message;
                const remainder = ctx.sec % 60;
                if (remainder > 0) ctx.result.push({ type: 'delay', sec: remainder });
            }
        };
    }

    /**
     * Добавляет данные для задержки в сформированный массив процессинга
     * @param {object} ctx 
     * @param {object} element 
     */
    addDataProcessing(ctx, element) {
        let sec = element.count;
        if (element.type == 'minutes') sec = sec * 60;
        if (element.type == 'hours') sec = sec * 60 * 60;
        if (element.type == 'days') sec = sec * 60 * 60 * 24;
        // smartDelay означает, что взята из блока "Умная задержка", а не из блока "Отправить сообщение"
        ctx.result.push({ type: 'delay', sec, smartDelay: true, step: ctx.nextStep.id });
    }

    /**
     * Разделяет данные для отправки на задержки
     * @param {Array} data - сформированный массив для отправки клиенту
     * @returns {object}
     */
    modifyData(data) {
        const result = [];
        const delays = [];

        this.objLongDelay = {}; // Для длительной задержки

        let flag = false;
        let step;
        let questionId;

        for (let i = 0; i < data.length; i++) {
            const d = data[i];

            // Если длительная задержка из блока "Умная задержка", то прерываем процесс
            // Этот этап нужен для того, чтобы обработать все шаги до длительной задержки
            // и после чего отправить задержку на крон
            if (this.findLongDelay(d, i)) break; 

            if (d.step && !d.smartDelay) {
                if (d.questionId != 'undefined') questionId = d.questionId
                step = d.step;
                continue;
            }

            if (!flug) {
                result.push([]);
                delays.push(false);
            }

            if (d.type == 'delay') {
                flag = false;
                delays.push(d.sec);
                result.push([]);
                continue;
            }

            result[result.length - 1].push(d);
            flag = true;
        }

        return { result, delays, step, questionId, objLongDelay: this.objLongDelay };
    }

    /**
     * Поиск длительной задержки
     * @param {object} item - элемент данных для отправки
     * @returns {boolean}
     */
    findLong(item) {
        if (item.type == 'delay' && item.smartDelay && item.sec >= cronDelay) {
            this.objLongDelay = {
                where: item.sec,
                step: item.step
            }
            return true;
        }
        return false;
    }
}

module.exports = new Delay();