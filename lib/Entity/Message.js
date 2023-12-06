/**
 * Класс для работы с блоком "Отправить сообщение"
 */
class Message {

    /**
     * Поиск информации о кнопке/вопросе по ID из сценария
     * @param {Array} data - сценарий
     * @param {Array} types - массив типов элементов в виде строки
     * @param {String} id - ID кнопки/вопроса
     * @returns {object | boolean}
     */ 
    findButtonInfoById(data, types, id) {
        let result = [];
        let entityForFind = 'buttons';
        if (types.length == 1 && types[0] === 'question') entityForFind = 'answers';
        try {
            if (!Array.isArray(types)) throw new Error();
            result.block = data.find(el => {
                let elements;
                let item;
                if (el.type !== 'message') return false; // Ищем блок "Сообщение"
                if (!(el.data && (elements = el.data.elements))) return false; // Если отсутствуют вложенные элементы в блоке, пропускаем
                if (!Array.isArray(elements)) return false; // Вложенные элементы должны быть массивом
                if (!(item = elements.find(i => types.includes(i.type) && i[entityForFind]))) return false; // находим нужный элемент во вложенном элементе
                return result.button = item[entityForFind].find(e => e.id == id); // ищем по ID
            });
        } catch (error) {
            result = [];
        }

        return result;
    }
}

module.exports = new Message();