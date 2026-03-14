document.addEventListener('DOMContentLoaded', () => {
    // ... (код инициализации пользователя, как в прошлый раз)
    const tg = window.Telegram.WebApp;
    tg.ready();
    document.body.style.visibility = 'visible';

    if (tg.initDataUnsafe?.user) {
        updateUserInfo(tg.initDataUnsafe.user);
    } else {
        const mockUser = {
            id: 12345678,
            username: 'dev_user',
            first_name: 'Dev',
            photo_url: 'https://i.pravatar.cc/150'
        };
        updateUserInfo(mockUser);
    }
    function updateUserInfo(user) {
        const userAvatarElement = document.getElementById('user-avatar');
        const usernameElement = document.getElementById('user-username');
        if (userAvatarElement && user.photo_url) {
            userAvatarElement.src = user.photo_url;
        }
        if (usernameElement) {
            usernameElement.textContent = user.username ? @${user.username} : user.first_name;
        }
    }

    // --- Логика модального окна ---
    const depositButton = document.getElementById('deposit-btn');
    const depositModal = document.getElementById('deposit-modal');
    const closeModalButton = document.getElementById('close-modal-btn');
    const payTonButton = document.getElementById('pay-ton-btn');
    const payStarsButton = document.getElementById('pay-stars-btn');

    depositButton.addEventListener('click', () => {
        depositModal.style.display = 'flex'; // Показываем окно
    });

    closeModalButton.addEventListener('click', () => {
        depositModal.style.display = 'none'; // Скрываем окно
    });

    // Закрытие по клику на фон
    depositModal.addEventListener('click', (event) => {
        if (event.target === depositModal) {
            depositModal.style.display = 'none';
        }
    });

    payTonButton.addEventListener('click', () => {
        // TODO: Интеграция с TON кошельком
        tg.showAlert('Интеграция с кошельком TON в разработке!');
    });

    payStarsButton.addEventListener('click', () => {
        // TODO: Интеграция с Telegram Stars
        // Пример вызова оплаты
        // tg.openInvoice('...', (status) => { ... });
        tg.showAlert('Интеграция с Telegram Stars в разработке!');
    });

    // ... (остальной код)
});
