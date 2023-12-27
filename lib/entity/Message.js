/**
 * Класс для работы с блоком "Отправить сообщение"
 */
class Message {

    /**
     * Поиск информации о кнопке/ответе по ID из сценария
     * @param {Array} data - сценарий
     * @param {Array} types - массив типов элементов в виде строки
     * @param {String} id - ID кнопки/ответа
     * @returns {object | boolean} {block - шаг, element - кнопка/вопрос, parent - родитель кнопки/ответа на вопрос}
     */
    findButtonInfoById(data, types, id) {
        let result = {};
        let entityForFind = 'buttons';
        if (types.length == 1 && types[0] === 'question') entityForFind = 'answers';
        try {
            if (!Array.isArray(types)) throw new Error();
            result.block = data.find(el => {
                let elements;
                if (el.type !== 'message') return false; // Ищем блок "Сообщение"
                if (!(el.data && (elements = el.data.elements))) return false; // Если отсутствуют вложенные элементы в блоке, пропускаем
                if (!Array.isArray(elements)) return false; // Вложенные элементы должны быть массивом
                if (!(result.parent = elements.find(i => types.includes(i.type) && i[entityForFind] && i[entityForFind].some(e => e.id == id)))) return false; // находим нужный элемент во вложенном элементе
                return result.element = result.parent[entityForFind].find(e => e.id == id); // ищем по ID кнопку
            });
        } catch (error) {
            result = {};
            console.log(error)
        }

        return result;
    }

    /**
     * Добавляет данные в сформированный массив процессинга
     * @param {object} ctx 
     * @param {Array} stepElements 
     */
    addDataProcessing(ctx, stepElements) {
        if (ctx.nextStep.question) {
            const findIndexQuestion = stepElements.findIndex(el => el.id == ctx.questionId)
            if (findIndexQuestion != -1) stepElements = stepElements.filter((el, index) => index > findIndexQuestion)
        }

        stepElements.forEach(el => {
            if (ctx.questionStop) return;
            const type = el.type
            let data;
            // Тип элемента в шаге
            switch (type) {
                case 'menu':
                case 'text':
                    data = this.createData(el, type);
                    if (data) ctx.result.push(data);
                    break;
                case 'question':
                    data = this.createData(el, type);
                    // останавливаем для анкетирования
                    ctx.result.push({ step: ctx.nextStep.id, questionId: (el.id ? el.id : null) });
                    ctx.nextStep = false;
                    ctx.questionStop = true
                    if (data) ctx.result.push(data);
                    break;
                case 'link':
                    ctx.result.push({ type: 'message', text: el.url });
                    break;
                case 'video':
                case 'download':
                    ctx.result.push({ type: 'file', src: el.src })
                    break;
                case 'img':
                    ctx.result.push({ type: 'img', src: el.src })
                    break;
                case 'delay':
                    ctx.result.push({ ...el })
                    break;
            }
        })
    }

    /**
     * Создать данные для дополнения массива процессинга
     * @param {object} el 
     * @param {string} type 
     * @returns {object | boolean}
     */
    createData(el, type) {
        const obj = {
            type: 'buttons',
            data: []
        };
        if (type == 'menu') obj.type = 'menu';

        if (el.text) obj.data.push({ type: 'message', text: el.text });
        const entities = type == 'question' ? 'answers' : 'buttons';
        if (el[entities].length) {
            el[entities].forEach(item => {
                if (item.noReply) return // если кнопка "Подписчик не ответил", то пропускаем
                obj.data.push({
                    id: item.id,
                    type: 'button',
                    title: item.title,
                    btnType: item.type ? item.type : 'message',
                    nextId: item.nextId ? item.nextId : false,
                    url: item.url ? item.url : false,
                })
            })
        }

        if (obj.data.length) {
            return obj.data.some(e => e.type == 'button') ? obj : obj.data[0];
        }

        return false;
    }
}

module.exports = new Message();