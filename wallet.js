document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('wallet-html-loaded')) { // Проверка, что скрипт загружен на нужной странице
        // Обновляем баланс при загрузке страницы кошелька
        updateBalanceDisplay();

        // Обработчики событий для полей ввода и кнопок
        document.getElementById('ton-amount').addEventListener('input', updateTonConversion);
        document.getElementById('stars-amount').addEventListener('input', updateStarsConversion);
        document.getElementById('rub-amount').addEventListener('input', updateRubConversion);

        document.getElementById('top-up-ton-button').addEventListener('click', () => topUp('ton'));
        document.getElementById('top-up-stars-button').addEventListener('click', () => topUp('stars'));
        document.getElementById('top-up-sbp-button').addEventListener('click', () => topUp('sbp'));
    }
});

function updateTonConversion() {
    const amount = parseFloat(document.getElementById('ton-amount').value);
    if (!isNaN(amount) && amount > 0) {
        document.getElementById('ton-get-amount').textContent = (amount * 1.10).toFixed(2); // +10%
    } else {
        document.getElementById('ton-get-amount').textContent = '0.00';
    }
}

function updateStarsConversion() {
    const amount = parseFloat(document.getElementById('stars-amount').value);
    if (!isNaN(amount) && amount >= 100) {
        document.getElementById('stars-get-ton-amount').textContent = (amount / 100).toFixed(2); // 100 звезд = 1 TON
    } else {
        document.getElementById('stars-get-ton-amount').textContent = '0.00';
    }
}

function updateRubConversion() {
    const amount = parseFloat(document.getElementById('rub-amount').value);
    if (!isNaN(amount) && amount >= 105) {
        document.getElementById('rub-get-ton-amount').textContent = (amount / 105).toFixed(2); // 105 руб = 1 TON
    } else {
        document.getElementById('rub-get-ton-amount').textContent = '0.00';
    }
}

async function topUp(method) {
    let amountToReceiveTon = 0;
    let paymentAmount = 0; // Сумма, которую платит пользователь в своей валюте
    let paymentCurrency = '';
    switch (method) {
        case 'ton':
            paymentAmount = parseFloat(document.getElementById('ton-amount').value);
            if (isNaN(paymentAmount) || paymentAmount <= 0) {
                alert('Введите корректную сумму TON для пополнения.');
                return;
            }
            amountToReceiveTon = paymentAmount * 1.10;
            paymentCurrency = 'TON';
            break;
        case 'stars':
            paymentAmount = parseFloat(document.getElementById('stars-amount').value);
            if (isNaN(paymentAmount) || paymentAmount < 100) {
                alert('Введите корректное количество Звезд (минимум 100).');
                return;
            }
            amountToReceiveTon = paymentAmount / 100;
            paymentCurrency = 'Telegram Stars';
            break;
        case 'sbp':
            paymentAmount = parseFloat(document.getElementById('rub-amount').value);
            if (isNaN(paymentAmount) || paymentAmount < 105) {
                alert('Введите корректную сумму в RUB (минимум 105).');
                return;
            }
            amountToReceiveTon = paymentAmount / 105;
            paymentCurrency = 'RUB (СБП)';
            break;
        default:
            alert('Неизвестный метод пополнения.');
            return;
    }

    if (!confirm(Вы хотите пополнить баланс на ${amountToReceiveTon.toFixed(2)} TON, оплатив ${paymentAmount.toFixed(2)} ${paymentCurrency}?)) {
        return;
    }

    // --- Важный момент: Интеграция платежных систем ---
    // Здесь должна быть логика вызова внешних API платежных систем.
    // Это НЕ ДОЛЖНО делаться напрямую из фронтенда из соображений безопасности.
    // Нужно использовать бэкенд (например, Supabase Edge Functions или другой сервер).
    // Бэкенд будет:
    // 1. Генерировать платежную ссылку/инвойс через API TON Wallet, Telegram Stars API, или API банка для СБП.
    // 2. Отслеживать статус платежа (webhook).
    // 3. После успешного платежа, обновлять баланс пользователя в базе данных Supabase.

    alert(Инициирован платеж на ${paymentAmount.toFixed(2)} ${paymentCurrency}. Ожидайте пополнения ${amountToReceiveTon.toFixed(2)} TON. В реальном приложении здесь будет открыто окно платежной системы.);

    // Для демонстрации, просто обновляем баланс на фронтенде и в Supabase
    // В РЕАЛЬНОМ ПРИЛОЖЕНИИ ЭТОГО ДЕЛАТЬ НАПРЯМУЮ НЕЛЬЗЯ!
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', currentUser.id)
            .single();

        if (userError) {
            console.error('Ошибка при загрузке баланса для пополнения:', userError.message);
            alert('Ошибка пополнения. Попробуйте снова.');
            return;
        }

        const newBalance = userData.balance + amountToReceiveTon;

        const { error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', currentUser.id);

        if (updateError) {
            console.error('Ошибка при обновлении баланса:', updateError.message);
            alert('Ошибка пополнения. Попробуйте снова.');
            return;
        }

        currentUser.balance = newBalance; // Обновляем локальный баланс
        await updateBalanceDisplay(); // Обновляем отображение на странице
        alert(Баланс успешно пополнен на ${amountToReceiveTon.toFixed(2)} TON!);

    } catch (error) {
        console.error('Неожиданная ошибка при пополнении:', error.message);
        alert('Произошла непредвиденная ошибка. Попробуйте позже.');
    }
}
``
