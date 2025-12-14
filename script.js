document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Отменяем стандартную отправку формы

    // Получаем значения полей
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Простая валидация
    if (password !== confirmPassword) {
        alert('Пароли не совпадают!');
        return;
    }

    if (password.length < 6) {
        alert('Пароль должен быть не менее 6 символов!');
        return;
    }

    // Отправляем данные на сервер
    const data = {
        username: username,
        email: email,
        password: password
    };

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Регистрация успешна!');
            window.location.href = 'dashboard.html'; // Переадресация после успеха
        } else {
            alert('Ошибка: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке данных.');
    });
});
