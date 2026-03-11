// Переменные для хранения информации о пользователе (временно, до интеграции с Supabase)
let user = {
    balanceTon: 0.00,
    username: 'guest',
    nftCooldownEndTime: null // Timestamp, когда закончится КД (для звезд)
};

// Функция для показа модального окна пополнения
function showTopUpModal() {
    document.getElementById('topUpModal').classList.add('active');
}

// Функция для скрытия модального окна пополнения
function hideTopUpModal() {
    document.getElementById('topUpModal').classList.remove('active');
}

// Функция для пополнения баланса (логика будет на бэкенде)
function topUp(currency) {
    alert(Вы выбрали пополнение через ${currency}. Это будет реализовано через Supabase!);
    hideTopUpModal();

    // Пример временной логики для КД:
    if (currency === 'stars') {
        const now = new Date();
        const cooldownDurationMinutes = 5; // 5 минут КД для примера
        user.nftCooldownEndTime = new Date(now.getTime() + cooldownDurationMinutes * 60 * 1000);
        alert(После пополнения звездами активирован КД на вывод NFT на ${cooldownDurationMinutes} минут.);
        updateUI(); // Обновить UI, чтобы показать КД, если пользователь перейдет в инвентарь
    }

    // Здесь будет вызов API Supabase для начала процесса пополнения
    // и обновления пользовательского баланса.
    // После успешного пополнения:
    user.balanceTon += 5; // Пример
    updateUI(); // Обновить баланс на экране
}

// Функция для обновления UI (баланс, имя пользователя)
function updateUI() {
    document.getElementById('userBalance').innerText = Balance: ${user.balanceTon.toFixed(2)} TON;
    document.getElementById('username').innerText = @${user.username};
    // Другие обновления UI, если есть
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    // Здесь можно было бы загружать данные пользователя с Supabase
});
