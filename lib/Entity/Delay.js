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
                const remainder = sec % 60;
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
        let sec = element.count
        if (element.type == 'minutes') sec = sec * 60
        if (element.type == 'hours') sec = sec * 60 * 60
        if (element.type == 'days') sec = sec * 60 * 60 * 24
        ctx.result.push({ type: 'delay', sec, smartDelay: true, step: ctx.nextStep.id });
    }

    /**
     * Разделяет дату на задержки
     */
    modifyData() {

    }

    /**
     * Поиск длительной задержки в 
     */
    findLong() {

    }
}

module.exports = new Delay();