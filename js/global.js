document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready(); // Сообщаем Telegram, что приложение готово

    // Показываем основное содержимое только после инициализации
    document.body.style.visibility = 'visible';
    // --- 1. Инициализация данных пользователя ---
    if (tg.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;
        console.log("User data:", user);
        
        // Эта функция будет обновлять UI на всех страницах
        updateUserInfo(user);
        
        // TODO: Здесь мы будем вызывать функцию для получения баланса из нашей БД
        // fetchUserBalance(user.id); 
    } else {
        // Для отладки в браузере, если вы не в Telegram
        console.warn("Telegram user data not found. Using mock data for development.");
        const mockUser = {
            id: 12345678,
            username: 'dev_user',
            first_name: 'Dev',
            photo_url: 'https://i.pravatar.cc/150' // URL для аватара-заглушки
        };
        updateUserInfo(mockUser);
        // fetchUserBalance(mockUser.id);
    }

    // --- 2. Функция для обновления UI ---
    function updateUserInfo(user) {
        // Находим элементы по ID, которые должны быть на всех страницах
        const userAvatarElement = document.getElementById('user-avatar');
        const usernameElement = document.getElementById('user-username');
        
        if (userAvatarElement && user.photo_url) {
            userAvatarElement.src = user.photo_url;
        }
        if (usernameElement) {
            usernameElement.textContent = user.username ? @${user.username} : user.first_name;
        }
    }

    // --- 3. Функция для отображения баланса (пока заглушка) ---
    function updateUserBalance(balance) {
        const balanceElement = document.getElementById('user-balance');
        if (balanceElement) {
            // toFixed(2) оставляет 2 знака после запятой
            balanceElement.textContent = ${parseFloat(balance).toFixed(2)} TON;
        }
    }

    // --- 4. Окно пополнения ---
    const depositButton = document.getElementById('deposit-btn');
    const depositModal = document.getElementById('deposit-modal'); // Предполагаем, что у модального окна есть такой ID
    
    if (depositButton && depositModal) {
        depositButton.addEventListener('click', () => {
            // TODO: Реализовать логику показа модального окна
            alert('Открыто окно пополнения (логика будет добавлена)');
        });
    }

    // Сделаем функции глобально доступными, если нужно вызывать их из других скриптов
    window.app = {
        updateUserInfo,
        updateUserBalance
    };
});
