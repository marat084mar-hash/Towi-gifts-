import { supabase } from '../config/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const telegramBlocker = document.getElementById('telegram-blocker');
    const mainAppContent = document.getElementById('main-app-content');
    const userTelegramIdElement = document.getElementById('user-telegram-id');
    const userAvatarElement = document.getElementById('user-avatar');
    const userInitialsElement = document.getElementById('user-initials');

    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();

        telegramBlocker.classList.add('hidden');
        mainAppContent.classList.remove('hidden');

        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            userTelegramIdElement.textContent = @${user.username || 'id' + user.id};

            // Загрузка аватарки или отображение инициалов
            if (user.photo_url) {
                userAvatarElement.src = user.photo_url;
                userAvatarElement.classList.remove('hidden');
                userInitialsElement.classList.add('hidden');
            } else {
                const initials = (user.first_name ? user.first_name[0] : (user.username ? user.username[0] : 'U')).toUpperCase();
                userInitialsElement.textContent = initials;
                userInitialsElement.classList.remove('hidden');
                userAvatarElement.classList.add('hidden');
            }

            // Загружаем баланс пользователя из Supabase
            loadUserBalance(user.id);
        } else {
            userTelegramIdElement.textContent = '@unknown_user';
            // Показываем заглушку инициалов 'U' если нет данных
            userInitialsElement.textContent = 'U';
            userInitialsElement.classList.remove('hidden');
        }

    } else {
        telegramBlocker.classList.remove('hidden');
        mainAppContent.classList.add('hidden');
        console.error("This application must be opened within Telegram Web App.");
    }
});

async function loadUserBalance(telegramId) {
    try {
        // Проверяем, существует ли пользователь в базе данных
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('telegram_id', telegramId)
            .single();
        if (userError && userError.code === 'PGRST116') { // Запись не найдена
            console.log(User ${telegramId} not found, creating new entry.);
            // Создаем новую запись для пользователя
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{ telegram_id: telegramId, balance: 0.00 }]) // Устанавливаем начальный баланс 0
                .select('balance')
                .single();

            if (createError) {
                console.error('Error creating new user:', createError.message);
                document.getElementById('user-balance').textContent = Ошибка;
                window.Telegram.WebApp.showAlert(Ошибка загрузки баланса: ${createError.message});
                return;
            }
            user = newUser;
        } else if (userError) {
            console.error('Error loading user balance:', userError.message);
            document.getElementById('user-balance').textContent = Ошибка;
            window.Telegram.WebApp.showAlert(Ошибка загрузки баланса: ${userError.message});
            return;
        }

        document.getElementById('user-balance').textContent = ${parseFloat(user.balance).toFixed(2)} TON;

    } catch (error) {
        console.error('Unexpected error during balance load:', error.message);
        document.getElementById('user-balance').textContent = Ошибка;
        window.Telegram.WebApp.showAlert(Непредвиденная ошибка: ${error.message});
    }
}


function navigateTo(pageName) {
    console.log(Navigating to ${pageName} page.);
    // В реальном приложении можно использовать:
    // 1. window.location.href = pages/${pageName}.html;
    // 2. AJAX для загрузки контента в mainAppContent
    // 3. Более сложный роутер для SPA

    // Пока что простое оповещение
    window.Telegram.WebApp.showAlert(Переход на страницу: ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} (в разработке));
}

// --- Логика модального окна пополнения ---
const topUpModal = document.getElementById('top-up-modal');
const tonPaymentSection = document.getElementById('ton-payment-section');
const starsPaymentSection = document.getElementById('stars-payment-section');
const tonAmountInput = document.getElementById('ton-amount');
const starsAmountInput = document.getElementById('stars-amount');
const tonBonusDisplay = document.getElementById('ton-bonus-display');

function openTopUpModal() {
    topUpModal.classList.remove('hidden');
    // Сбрасываем выбранные секции при открытии
    tonPaymentSection.classList.add('hidden');
    starsPaymentSection.classList.add('hidden');
    tonAmountInput.value = '';
    starsAmountInput.value = '';
    tonBonusDisplay.textContent = 'Вы получите: 0.00 TON (+10%)';
}

function closeTopUpModal() {
    topUpModal.classList.add('hidden');
}

function selectPaymentMethod(method) {
    if (method === 'ton') {
        tonPaymentSection.classList.remove('hidden');
        starsPaymentSection.classList.add('hidden');
        tonAmountInput.focus();
    } else if (method === 'stars') {
        starsPaymentSection.classList.remove('hidden');
        tonPaymentSection.classList.add('hidden');
        starsAmountInput.focus();
    }
}

tonAmountInput.addEventListener('input', (event) => {
    const amount = parseFloat(event.target.value);
    if (!isNaN(amount) && amount >= 0.2) {
        const bonusAmount = amount * 1.10;
        tonBonusDisplay.textContent = Вы получите: ${bonusAmount.toFixed(2)} TON (+10%);
    } else {
        tonBonusDisplay.textContent = 'Вы получите: 0.00 TON (+10%)';
    }
});


async function initiateTonPayment() {
    const amount = parseFloat(tonAmountInput.value);
    if (isNaN(amount) || amount < 0.2) {
        window.Telegram.WebApp.showAlert('Пожалуйста, введите сумму не менее 0.2 TON.');
        return;
    }
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    // В реальном приложении здесь будет взаимодействие с TON Connect или Tonkeeper
    // или создание ссылки для оплаты через Telegram Bot, который интегрирован с TON.
    // Пример Deep Link для Tonkeeper/TON Space:
    // const tonDeepLink = https://app.tonkeeper.com/transfer/${YOUR_BOT_TON_ADDRESS}?amount=${amount * 10**9}; // amount в nanoTON

    window.Telegram.WebApp.showAlert(
        Пополнение TON на ${amount.toFixed(2)} TON.\n +
        Начислено будет ${((amount * 1.10).toFixed(2))} TON с учетом 10% бонуса.\n +
        Для реальной оплаты требуется интеграция с TON API/Bot.
    );
    console.log(Инициировано TON пополнение для пользователя ${userId} на сумму ${amount.toFixed(2)} TON.);
    closeTopUpModal();

    // Пример: после успешной оплаты (это должен обрабатывать ваш БОТ/сервер)
    // await updateBalanceInSupabase(userId, (amount * 1.10));
}

async function initiateStarsPayment() {
    const amount = parseInt(starsAmountInput.value);
    if (isNaN(amount) || amount < 50) {
        window.Telegram.WebApp.showAlert('Пожалуйста, введите сумму не менее 50 Stars.');
        return;
    }

    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    // Для Telegram Stars используется Telegram Web App Payments API
    // Этот метод требует, чтобы у вашего бота был настроен Telegram Payments.
    // const invoicePayload = stars_topup_${userId}_${amount}_${Date.now()};
    // window.Telegram.WebApp.openInvoice(invoiceUrl, (status) => {
    //     if (status === 'paid') {
    //         // Обработка успешной оплаты
    //         // Здесь нужен ваш бэкенд для проверки и начисления.
    //         // await updateBalanceInSupabase(userId, amount / PRICE_STARS_TO_TON); // Пересчет звезд в TON
    //         window.Telegram.WebApp.showAlert(Успешное пополнение ${amount} Stars. Вывод подарков заблокирован на 21 день.);
    //     } else if (status === 'cancelled') {
    //         window.Telegram.WebApp.showAlert('Пополнение отменено.');
    //     } else {
    //         window.Telegram.WebApp.showAlert('Произошла ошибка при пополнении.');
    //     }
    // });


    window.Telegram.WebApp.showAlert(
        Пополнение Telegram Stars на ${amount} Stars.\n +
        Вывод подарков будет заблокирован на 21 день.\n +
        Для реальной оплаты требуется интеграция Telegram Payments API с вашим ботом.
    );
    console.log(Инициировано Stars пополнение для пользователя ${userId} на сумму ${amount} Stars.);
    closeTopUpModal();

    // Пример: после успешной оплаты (это должен обрабатывать ваш БОТ/сервер)
    // await updateBalanceInSupabase(userId, amount / SOME_CONVERSION_RATE);
    // await applyWithdrawalBlock(userId, 21); // Заблокировать вывод на 21 день
}

// Вспомогательная функция для обновления баланса (для БЭКЕНДА!)
// async function updateBalanceInSupabase(telegramId, amountToAdd) {
//     const { data, error } = await supabase.rpc('update_user_balance', {
//         user_id_param: telegramId,
//         amount_to_add_param: amountToAdd
//     });

//     if (error) {
//         console.error('Error updating balance:', error);
//         window.Telegram.WebApp.showAlert(Ошибка обновления баланса: ${error.message});
//     } else {
//         console.log('Balance updated successfully:', data);
//         loadUserBalance(telegramId); // Перезагружаем баланс на UI
//     }
// }

// Вспомогательная функция для блокировки вывода (для БЭКЕНДА!)
// async function applyWithdrawalBlock(telegramId, days) {
//     const { data, error } = await supabase
//         .from('users')
//         .update({ withdrawal_block_until: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() })
//         .eq('telegram_id', telegramId);

//     if (error) {
//         console.error('Error applying withdrawal block:', error);
//     } else {
//         console.log('Withdrawal block applied successfully.');
//     }
// }
