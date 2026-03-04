require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройки Telegram бота
// TODO: Замените на свои данные
// Поддержка разных форматов переменных
const TELEGRAM_BOT_TOKEN = process.env['TELEGRAM-BOT-TOKEN'] || process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env['ADMIN-CHAT-ID'] || process.env.ADMIN_CHAT_ID || '';

let bot = null;

// Подключаем бота для получения Chat ID
if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN') {
    try {
        const TelegramBot = require('node-telegram-bot-api');
        bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
        
        console.log('✅ Telegram бот подключён');
        
        // Слушаем сообщения чтобы получить Chat ID
        bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            console.log('📱 Получен Chat ID:', chatId);
            console.log('   Добавь этот ID в .env: ADMIN_CHAT_ID=' + chatId);
        });
        
    } catch (e) {
        console.log('⚠️ Telegram бот не подключён:', e.message);
    }
}

// Хранилище заявок (в памяти)
const registrations = [];

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Регистрация
app.post('/api/register', async (req, res) => {
    try {
        const { name, phone } = req.body;
        
        if (!name || !phone) {
            return res.json({ success: false, message: 'Заполните все поля' });
        }
        
        // Сохраняем заявку
        const registration = {
            id: registrations.length + 1,
            name: name.trim(),
            phone: phone.trim(),
            timestamp: new Date().toISOString()
        };
        registrations.push(registration);
        
        console.log('📝 Новая заявка:', registration);
        
        // Отправляем в Telegram
        if (bot && ADMIN_CHAT_ID && ADMIN_CHAT_ID !== 'YOUR_CHAT_ID') {
            const message = `🎉 *Новая регистрация!*\n\n` +
                `👤 *Имя:* ${name}\n` +
                `📱 *Телефон:* ${phone}\n` +
                `🕐 *Время:* ${new Date().toLocaleString('ru-RU')}`;
            
            try {
                await bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });
                console.log('✅ Уведомление отправлено в Telegram');
            } catch (e) {
                console.log('❌ Ошибка отправки в Telegram:', e.message);
            }
        } else {
            console.log('⚠️ Telegram бот не настроен - уведомление не отправлено');
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка:', error);
        res.json({ success: false, message: 'Ошибка сервера' });
    }
});

// API: Получить все заявки (для админки)
app.get('/api/registrations', (req, res) => {
    res.json({ 
        success: true, 
        registrations: registrations.reverse() 
    });
});

// API: Админка
app.get('/admin', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админка - Регистрации</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-card .number {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
        }
        .stat-card .label {
            color: #666;
            font-size: 14px;
        }
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
        }
        .refresh-btn:hover { background: #5568d3; }
        table {
            width: 100%;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 15px;
            text-align: left;
        }
        th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
        tr:nth-child(even) { background: #f9f9f9; }
        tr:hover { background: #f0f0f0; }
        .empty {
            text-align: center;
            padding: 40px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 Админка - Регистрации</h1>
        <div class="stats">
            <div class="stat-card">
                <div class="number" id="totalCount">0</div>
                <div class="label">Всего заявок</div>
            </div>
        </div>
        <button class="refresh-btn" onclick="loadData()">🔄 Обновить</button>
        <br><br>
        <table>
            <thead>
                <tr>
                    <th>№</th>
                    <th>Имя</th>
                    <th>Телефон</th>
                    <th>Время</th>
                </tr>
            </thead>
            <tbody id="tableBody">
                <tr><td colspan="4" class="empty">Загрузка...</td></tr>
            </tbody>
        </table>
    </div>
    <script>
        async function loadData() {
            try {
                const response = await fetch('/api/registrations');
                const data = await response.json();
                
                document.getElementById('totalCount').textContent = data.registrations.length;
                
                const tbody = document.getElementById('tableBody');
                if (data.registrations.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="empty">Заявок пока нет</td></tr>';
                    return;
                }
                
                tbody.innerHTML = data.registrations.map(r => {
                    const date = new Date(r.timestamp).toLocaleString('ru-RU');
                    return '<tr><td>' + r.id + '</td><td>' + r.name + '</td><td>' + r.phone + '</td><td>' + date + '</td></tr>';
                }).join('');
            } catch (e) {
                console.error(e);
            }
        }
        loadData();
        setInterval(loadData, 10000);
    </script>
</body>
</html>
    `);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`
🚀 Сервер запущен!
   Лендинг: http://localhost:${PORT}
   Админка: http://localhost:${PORT}/admin
    `);
});