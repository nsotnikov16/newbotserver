const Api = require("../Api");

/**
 * Класс для работы с блоком "Случайный выбор"
 */
class Random {

    /**
     * Ищет следующий шаг для процессинга
     * @param {object} ctx 
     * @param {Array} stepElements 
     * @returns 
     */
    async findNextStep(ctx, stepElements) {
        const random = await Api.getOptionRandom({bot_id: ctx.bot_id, random_id: ctx.nextStep.id});
        if (random.variant) {
            return stepElements.find((item, index) => index == +random.variant)
        }
        return false;
    }
}

module.exports = new Random();