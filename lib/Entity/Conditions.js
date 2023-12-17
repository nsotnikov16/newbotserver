const Api = require("../Api");

/**
 * Класс для работы с блоком "Условие"
 */
class Conditions {
    /**
     * Добавляет данные в сформированный массив процессинга
     * @param {object} ctx 
     * @param {Array} stepElements 
     */
    async addDataProcessing(ctx, stepElements) {
        const tags = await Api.actionTag('get', session_id);
        const userInfo = await Api.getUserAnswers({ bot_id: ctx.bot_id, session_id: ctx.session_id });
        let groups = {}
        stepElements.forEach(el => {
            if (!el.group) return;
            if (!groups[el.group]) groups[el.group] = [];
            groups[el.group].push(el);
        });

        const groupKeys = Object.keys(groups);
        let groupTrue = false;

        for (let i = 1; i <= groupKeys.length; i++) {
            if (!groups[i].some(el => el.nextId)) continue;
            if (this.groupIsTrueCondition(groups[i], tags, userInfo)) {
                groupTrue = i;
                break;
            }
        }

        if (groupTrue) ctx.nextStep.nextId = groups[groupTrue][0].nextId;
    }


    /**
     * Поиск группы условий, где все пункты истина
     * @param {Array} group 
     * @param {Array} tags 
     * @param {Array} userInfo 
     * @return {boolean}
     */
    groupIsTrueCondition(group, tags, userInfo) {
        let result = [];

        group.forEach(el => {
            const type = el.type;
            const condition = el.condition;
            const value = el[el.type];

            const finds = userInfo.filter(f => {
                let fieldName = el.fieldName;
                if (type == 'name') fieldName = 'Имя';
                if (type == 'sex') fieldName = 'Пол';
                return f.field == fieldName;
            })

            let findValue = null;

            if (finds.length) findValue = finds[finds.length - 1].answer;

            if (type == 'tag' && tags.some(t => t.id == el.id)) return result.push(1);

            if (['name', 'field'].includes(type) && condition && userInfo && userInfo.length) {

                if (!findValue) return result.push(0);

                if (condition == 'Совпадает' && (value === findValue)) return result.push(1);

                if (condition == 'Содержит' && findValue.includes(value)) return result.push(1);

                if (condition == 'Начинается с' && findValue.startsWith(value)) return result.push(1);

                if (condition == 'Не содержит' && !findValue.includes(value)) return result.push(1);
            }

            if (type == 'sex' && findValue == value) return result.push(1);
        })

        return result.length && !result.includes(0);
    }
}

module.exports = new Conditions();