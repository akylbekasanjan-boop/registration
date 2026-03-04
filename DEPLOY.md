# 🚀 Деплой на Render (бесплатно)

## Шаг 1: Загрузить код на GitHub

1. Зайди на https://github.com и создай новый репозиторий
2. Назови его "voronka" или любое имя
3. Загрузи файлы проекта:
   - Скачай папку "воронка" с компьютера
   - Загрузи все файлы в репозиторий

## Шаг 2: Деплой на Render

1. Зайди на https://render.com
2. Нажми "New +" → "Web Service"
3. Подключи GitHub аккаунт
4. Выбери репозиторий с проектом
5. Настрой:
   - **Name**: voronka
   - **Environment**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start
   
6. В секции **Environment Variables** добавь:
   - `TELEGRAM_BOT_TOKEN` = `8508840106:AAGJZabotcTGvUWTPPN2mQkZFRDA_xqX3D4`
   - `ADMIN_CHAT_ID` = `-1003581170115`

7. Нажми "Deploy Web Service"

## Готово! ✅

После деплоя получишь ссылку вида:
`https://voronka.onrender.com`

Открой её — форма регистрации будет работать!
Заявки будут приходить в группу "лиды" в Telegram.