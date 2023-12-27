/**
 * Класс для работы взаимодействия с историей ботов
 */
class History {

    /**
     * Метод поиска кнопки, которое отправляется как текст в телеграме
     * Суть: найти в истории элемент типа menu и по его массиву data найти первую попавшуюся кнопку
     * @param {Array} bots 
     * @param {string} message 
     * @returns {object}
     */
    findButtonLikeText(bots, message) {
        const result = {};
        bots.forEach(bot => {
            const history = bot.history;
            if (!history.length) return;
            history.forEach(item => {
                if (!item.data || !item.data.length) return;
                item.data.forEach(element => {
                    if (element.type !== 'menu') return;
                    if (!element.data.length) return;
                    const find = element.data.find(el => el.title == message);
                    if (find && !result.buttonId) {
                        result.buttonId = find.id;
                        result.bot = bot;
                    }
                })
            })
        })

        return result;
    }

    /**
     * Поиск бота с крайним вопросом или с пустой историей
     * @param {Array} bots 
     * @returns {Array}
     */
    findQuestionOrEmpty(bots) {
        bots.sort((a, b) => b.session_id - a.session_id); // отсортируем

        bots = bots.filter((elem, index, self) => // оставим уникальных ботов
            index === self.findIndex((e) => (
                e.bot_id === elem.bot_id
            ))
        );

        const last = bots.find(item => {
            return this.getQuestionId(item.history) || !item.history.length; // если крайнее сообщение было ответом на вопрос или новая сессия
        });

        return last ? [last] : bots;
    }

    /**
     * Поиск первого вопроса, на котором остановился бот
     * @param {Array} history 
     * @returns {number}
     */
    getQuestionId(history) {
        if (!Array.isArray(history)) return 0;
        if (!history.length) return 0;
        return history[0].questionId;
    }

    /**
     * Поиск ID шага, на котором был остановлен элемент истории
     * @param {Array} history 
     * @param {number} index 
     * @returns {String | boolean}
     */
    findBlockByIndex(history, index = 0) {
        try {
            return history[index].step;
        } catch (error) {
            return null;
        }
    }

}

module.exports = new History();