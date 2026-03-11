// Переменные для хранения информации о пользователе (временно, до интеграции с Supabase)
let user = {
    balanceTon: 0.00,
    username: 'guest',
    nftCooldownEndTime: null // Timestamp, когда закончится КД (для звезд)
};
// --- ФУНКЦИИ МОДАЛЬНОГО ОКНА ПОПОЛНЕНИЯ ---
function showTopUpModal() {
    console.log('--- showTopUpModal() вызван ---');
    const modal = document.getElementById('topUpModal');
    if (modal) {
        modal.classList.add('active');
        console.log('Модальное окно пополнения: КЛАСС ACTIVE ДОБАВЛЕН.');
        console.log('Текущие классы модального окна:', modal.className);
        console.log('Текущий opacity:', window.getComputedStyle(modal).opacity);
        console.log('Текущий display:', window.getComputedStyle(modal).display);
        console.log('Текущий visibility:', window.getComputedStyle(modal).visibility);
        console.log('Текущий z-index:', window.getComputedStyle(modal).zIndex);
    } else {
        console.error('Ошибка: Элемент с ID "topUpModal" не найден!');
        alert('Критическая ошибка: не могу найти модальное окно пополнения! Проверьте HTML.');
    }
}

function hideTopUpModal() {
    const modal = document.getElementById('topUpModal');
    if (modal) {
        modal.classList.remove('active');
        console.log('Модальное окно пополнения: КЛАСС ACTIVE УДАЛЕН.');
    }
}

// Функция для пополнения баланса (реальная логика будет на бэкенде через Supabase)
function topUp(currency) {
    // ИЗМЕНЕННАЯ СТРОКА: Убрана шаблонная строка
    alert('Вы выбрали пополнение через ' + currency + '. Это будет реализовано через Supabase!');
    hideTopUpModal();

    // Пример временной логики для КД:
    if (currency === 'stars') {
        const now = new Date();
        const cooldownDurationMinutes = 5; // 5 минут КД для примера
        user.nftCooldownEndTime = new Date(now.getTime() + cooldownDurationMinutes * 60 * 1000);
        alert('После пополнения звездами активирован КД на вывод NFT на ' + cooldownDurationMinutes + ' минут.');
    }

    // Имитация обновления баланса:
    user.balanceTon += 5; // Увеличиваем баланс на 5 TON для примера
    updateUI(); // Обновляем отображение баланса на странице
    console.log('Баланс обновлен: ' + user.balanceTon + ' TON. Cooldown: ' + user.nftCooldownEndTime);
}

// --- ФУНКЦИИ ОБНОВЛЕНИЯ UI ---
function updateUI() {
    const userBalanceElement = document.getElementById('userBalance');
    if (userBalanceElement) {
        userBalanceElement.innerText = 'Balance: ' + user.balanceTon.toFixed(2) + ' TON';
    }

    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.innerText = '@' + user.username;
    }
    console.log('UI обновлен.');
}

// Инициализация UI при загрузке страницы
document.addEventListener('DOMContentLoaded', updateUI);
``
