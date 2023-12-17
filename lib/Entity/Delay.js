/**
 * Класс для работы с задержками
 */
class Delay {

    /**
     * Обработка задержки с крона
     * @param {Object} ctx 
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