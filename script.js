```css
:root {
    --primary-orange: #FF8C00; /* Яркий оранжевый */
    --secondary-black: #1A1A1A; /* Глубокий черный */
    --text-light: #FFFFFF; /* Белый текст */
    --text-dark: #000000; /* Черный текст */
    --border-color: #333333; /* Темно-серый для границ */
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--secondary-black);
    color: var(--text-light);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    padding: 20px;
    box-sizing: border-box;
}

.app-container {
    background-color: #282828; /* Немного светлее черного для контейнера */
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    text-align: center;
    max-width: 400px;
    width: 100%;
}

h1 {
    color: var(--primary-orange);
    margin-bottom: 25px;
    font-size: 1.8em;
}

p {
    margin-bottom: 15px;
    font-size: 1.1em;
    line-height: 1.6;
}

button {
    display: block;
    width: 100%;
    padding: 15px;
    margin-bottom: 15px;
    border: none;
    border-radius: 8px;
    font-size: 1.1em;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.primary-btn {
    background-color: var(--primary-orange);
    color: var(--text-dark);
}

.primary-btn:hover {
    background-color: #FF7F00; /* Чуть темнее оранжевый */
    transform: translateY(-2px);
}

.secondary-btn {
    background-color: #444444; /* Темно-серый */
    color: var(--text-light);
}

.secondary-btn:hover {
    background-color: #555555; /* Чуть светлее серый */
    transform: translateY(-2px);
}

.status-message {
    color: var(--primary-orange);
    font-size: 0.9em;
    min-height: 20px; /* Чтобы избежать сдвига элементов */
    margin-top: 20px;
}



#### `script.js` (Базовый JavaScript и интеграция с Telegram Web Apps)

Здесь мы добавим проверку инициализации `Telegram.WebApp` и обработчики событий для кнопок.


javascript
document.addEventListener('DOMContentLoaded', () => {
    const tonBalanceSpan = document.getElementById('ton-balance');
    const openCaseBtn = document.getElementById('open-case-btn');
    const inventoryBtn = document.getElementById('inventory-btn');
    const crashBtn = document.getElementById('crash-btn');
    const upgradeBtn = document.getElementById('upgrade-btn');
    const statusMessage = document.getElementById('status-message');

    // Проверяем, что Telegram Web Apps SDK загружен
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        statusMessage.textContent = 'Telegram Web App готов!';
        console.log('Telegram Web App готов.');
        console.log('Инициализационные данные Telegram:', Telegram.WebApp.initDataUnsafe);

        // Установка фонового цвета Telegram Mini App
        // Telegram.WebApp.setBackgroundColor('#1A1A1A'); // Задаем черный фон
        // Telegram.WebApp.setHeaderColor('#FF8C00'); // Задаем оранжевый заголовок

    } else {
        statusMessage.textContent = 'Запустите приложение внутри Telegram.';
        console.warn('Telegram Web App SDK не загружен. Возможно, приложение запущено вне Telegram.');
    }

    // Пример обработчиков кнопок (пока просто вывод в консоль)
    openCaseBtn.addEventListener('click', () => {
        statusMessage.textContent = 'Открываем кейс... (функция пока не реализована)';
        console.log('Кнопка "Открыть Кейс" нажата');
        // Здесь будет вызов Edge Function для открытия кейса
    });

    inventoryBtn.addEventListener('click', () => {
        statusMessage.textContent = 'Переходим в инвентарь... (функция пока не реализована)';
        console.log('Кнопка "Инвентарь" нажата');
        // Здесь будет отображение инвентаря
    });

    crashBtn.addEventListener('click', () => {
        statusMessage.textContent = 'Запускаем игру "Ракета"... (функция пока не реализована)';
        console.log('Кнопка "Игра Ракета" нажата');
        // Здесь будет переход к игре Crash
    });

    upgradeBtn.addEventListener('click', () => {
        statusMessage.textContent = 'Переходим в апгрейд... (функция пока не реализована)';
        console.log('Кнопка "Апгрейд" нажата');
        // Здесь будет переход к системе апгрейда
    });

    // Можете добавить здесь начальную загрузку данных, например, баланса
    // fetch('/api/user-balance').then(...)
});
