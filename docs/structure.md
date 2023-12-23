## Структура
| Путь к папке/файлу | Описание |
| -------- | ------------ |
| docs | Документация |
| docs/commands.md | Запуск/остановка (команды) |
| docs/description.md | Описание работы приложения |
| docs/scenarios.md | Описание сценария |
| docs/structure.md | Описание структуры проекта |
| docs/technologies.md | Требования к проекту |
| lib | Библиотеки для работы бота |
| lib/entity | Сущности блоков чат-бота |
| lib/entity/Actions.js | Блок "Действия" |
| lib/entity/Conditions.js | Блок "Условия" |
| lib/entity/Delay.js | Работа с задержками |
| lib/entity/Message.js | Блок "Отправить сообщение" |
| lib/entity/Random.js | Блок "Случайный выбор" |
| lib/Api.js | API |
| lib/History.js | Работа с историями пользователя |
| lib/Logger.js | Работа с логами |
| lib/Processing.js | **Процессинг (основной функционал тут)** |
| logs | Логи |
| logs/express | Логи express |
| logs/express/error.json | Ошибки express |
| logs/express/request.json | Входящие запросы express |
| logs/api.json | Логи API |
| logs/post.json | Кастомные логи POST запросов |
| tools | Инструменты |
| tools/constants.js | Константы |
| tools/functions.js | Прочие функции |
| newserver.js | **Основной файл работы сервера** |