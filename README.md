# Сервер работы чат-бота с пользователем

## Требования
| Технология | Версия |
| ---------- | ------ |
| Node | >=12.22.9 |

## Запуск/остановка
| Команда | Описание |
| ---------- | ------ |
| npm run start | обычный запуск сервера |
| npm run dev | запуск сервера в режиме разработки (см. nodemon) |
| pm2 start newserver | запуск в фоновом режиме |
| pm2 stop newserver | остановка сервера в фоновом режиме |

## Структура
| Путь к папке/файлу | Описание |
| -------- | ------------ |
| lib | Библиотеки для работы бота |
| lib/entity | Сущности блоков чат-бота |
| lib/entity/Actions.js | Блок "Действия" |
| lib/entity/Conditions.js | Блок "Условия" |
| lib/entity/Delay.js | Работа с задержками |
| lib/entity/Message.js | Блок "Отправить сообщение" |
| lib/entity/Random.js | Блок "Случайный выбор" |
| lib/Api.js | API |
| lib/History.js | Работа с историями пользователя |
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
| tools/logger.js | Работа с логами |
| newserver.js | **Основной файл работы сервера** |

## Краткое описание работы сервера
Сервер работает на библиотеке express

Принимает 2 запроса:
* GET - служит для проверки работоспособности бота (при необходимости можно отключить)
* POST - основные входящие запросы с которыми происходит работа (сюда запросы приходят с другого бэкенда)

При клике на кнопку в чате или при отправке сообщения пользователем посылается запрос на основной бэкенд, в котором происходит обработка сессий и прочих параметров. Далее запрос переходит СЮДА, где происходит работа со сценариями ботов (у пользователя их может быть несколько). Отработав сценарии ботов, формируются данные для запроса на другой бэкенд. Оттуда уже результат приходит пользователю.

Запуск приложения происходит в файле **newserver.js**

В роутинге (POST /) происходит работа процессинга бота (lib/Processing) и логирование запросов

Описание свойств тела POST запроса, с которым предстоит работать:
| Свойство | Тип |  Описание |
| -------- | ---- |  --------- |
| bots | Array | Массив ботов с которыми взаимодействовал пользователь |
| bots[].bot_id | string | Идентификатор сценария |
| bots[].session_id | string | Идентификатор сессии пользователя |
| message | string | Сообщение пользователя или ID кнопки на которую нажал пользователь |
| type_do | string | Тип сущности (button/message/delay) |
| sec | number | Количество секунд для приходящей задержки (delay) с крона |

Обработка данных и отправка пользователю:
1. Получаем информацию по сценариям и сессиям
2. Фильтруем данные на крайний вопрос (сценарий, на котором остановился пользователь, когда бот задал ему вопрос) или отсутствующую историю (на точке старта, когда соответствует условию)
3. Запускаем обработку полученных сценариев
4. В каждом сценарии формируются данные для отправки
5. Данные для отправки модифицируются с учётом задержек в сценарии
6. Отправка данных пользователю (точнее на другой бэкенд)