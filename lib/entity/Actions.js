const Api = require("../Api");

/**
 * Класс для работы с блоком "Действия"
 */
class Actions {

    /**
     * Добавляет данные в сформированный массив процессинга
     * @param {object} ctx 
     * @param {Array} stepElements 
     */
    async addDataProcessing(ctx, stepElements) {
        stepElements.forEach(async (el) => {
            switch (el.type) {
                case 'tag':
                    if (!el.id) return;
                    Api.actionTag('add', ctx.session_id, { tags: [el.id] });
                    break;
                case 'tagDelete':
                    if (!el.id || !el.tagDelete) return;
                    const userTags = Api.actionTag('get', ctx.session_id);
                    if (Array.isArray(userTags)) {
                        const findTag = userTags.find(tag => tag.name == el.tagDelete)
                        if (findTag) await Api.actionTag('delete', ctx.session_id, { tag_id: findTag.id });
                    }
                    break;
                case 'field':
                    if (!el.value || !el.field) return;
                    Api.answerToQuestion({ bot_id: ctx.bot_id, session_id: ctx.session_id, answer: el.value, field: el.field });
                    break;
            }
        })
    }
}

module.exports = new Actions();