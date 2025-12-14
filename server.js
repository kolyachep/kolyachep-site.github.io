const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'compsite')));

// Подключение к SQLite
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к БД:', err);
    } else {
        console.log('Подключено к SQLite');
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);
    }
});

// Маршруты для HTML-страниц
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'compsite', 'index.html')));
app.get('/software', (req, res) => res.sendFile(path.join(__dirname, 'compsite', 'software.html')));
app.get('/glossary', (req, res) => res.sendFile(path.join(__dirname, 'compsite', 'glossary.html')));
app.get('/hardware', (req, res) => res.sendFile(path.join(__dirname, 'compsite', 'hardware.html')));
app.get('/anketa', (req, res) => res.sendFile(path.join(__dirname, 'compsite', 'anketa.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'compsite', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'compsite', 'dashboard.html'))); // Добавлен маршрут для dashboard

// Регистрация
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Все поля обязательны'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Пароль должен быть не менее 6 символов'
        });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Ошибка хеширования пароля'
            });
        }

        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hash],
            function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        return res.status(400).json({
                            success: false,
                            message: 'Email или имя уже заняты'
                        });
                    }
                    return res.status(500).json({
                        success: false,
                        message: 'Ошибка сервера'
                    });
                }
                res.json({
                    success: true,
                    message: 'Пользователь зарегистрирован'
                });
            }
        );
    });
});

// Вход
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email и пароль обязательны'
        });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Неверный пароль'
                });
            }

            res.json({
                success: true,
                message: 'Вход выполнен',
                user: { id: user.id, username: user.username, email: user.email }
            });
        });
    });
});

// Обработка 404 для несуществующих маршрутов
app.use((req, res) => {
    res.status(404).send('Страница не найдена');
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
