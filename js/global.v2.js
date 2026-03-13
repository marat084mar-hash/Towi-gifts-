document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;

    // 1. Проверяем, что приложение открыто в Telegram
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        // Если да, инициализируем приложение
        tg.ready();
        tg.expand(); // Раскрываем приложение на весь экран

        // 2. Отображаем данные пользователя
        displayUserData(tg.initDataUnsafe.user);

        // 3. Инициализируем модальное окно пополнения
        initDepositModal();

    } else {
        // 4. Если открыто не в Telegram, блокируем интерфейс
        document.body.innerHTML = 
            <div class="auth-error">
                <h1>Authentication Error</h1>
                <p>Please open this app through our official Telegram bot.</p>
                <p>@Tow1Gift_bot</p> <!-- Добавил имя твоего бота -->
            </div>
        ;
        // Если вдруг стили не подтянулись, добавляем базовые для ошибки
        document.head.insertAdjacentHTML('beforeend', 
            <style>
                body { 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    text-align: center; 
                    background-color: #100f14;
                    font-family: 'Inter', sans-serif;
                }
            </style>
        );
    }
});

function displayUserData(user) {
    const usernameElement = document.getElementById('username');
    const balanceContainer = document.querySelector('.balance-container'); 

    if (usernameElement) {
        usernameElement.textContent = @${user.username || 'user'};
    }

    // Создаем и вставляем аватар, если его еще нет
    // Проверяем, есть ли уже img#user-avatar, чтобы не дублировать
    if (balanceContainer && !document.getElementById('user-avatar')) {
        const avatar = document.createElement('img');
        avatar.id = 'user-avatar';
        avatar.alt = 'Avatar';
        avatar.style.width = '48px';
        avatar.style.height = '48px';
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '12px';
        avatar.style.objectFit = 'cover'; // Обрезка изображения

        // Telegram WebApp не предоставляет URL аватара напрямую.
        // Ты можешь получить его через API твоего бота, отправив запрос
        // на бэкенд, который запросит фото пользователя через bot.get_user_profile_photos(user_id)
        // Пока что используем заглушку или условный путь.
        // TODO: Реализовать запрос аватара через твой бэкенд
        avatar.src = https://api.telegram.org/file/bot<YOUR_BOT_TOKEN>/user_photos/${user.id}/<FILE_UNIQUE_ID>.jpg; 
        // Временно можно использовать Gravatar или заглушку:
        // avatar.src = https://www.gravatar.com/avatar/${md5(user.id)}?d=identicon; 

        const balanceDiv = balanceContainer.querySelector('div'); // Находим div внутри balance-container
        if (balanceDiv) {
             balanceDiv.prepend(avatar); // Вставляем аватар перед текстом баланса
        }
    }

    // TODO: Здесь будет логика получения баланса из Supabase по user.id
    // const userBalance = await fetchBalance(user.id);
    // document.getElementById('balance').textContent = ${userBalance.toFixed(2)} TON;
}
function initDepositModal() {
    const modal = document.getElementById('deposit-modal');
    const openBtn = document.querySelector('.add-balance-btn');
    const closeBtn = document.querySelector('.close-modal');

    // Открытие окна по клику на +
    if (openBtn) {
        openBtn.onclick = (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            // Легкая вибрация телефона при открытии
            if (window.Telegram.WebApp) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        };
    }

    // Закрытие окна
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }

    // Закрытие при клике на фон
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}


// Логика выбора оплаты
function pay(method) {
    const tg = window.Telegram.WebApp;
    
    switch(method) {
        case 'ton':
            tg.showConfirm("Connect Tonkeeper to pay with TON?", (confirmed) => {
                if (confirmed) {
                    // TODO: Здесь будет логика инициации оплаты TON через TonConnect
                    tg.showAlert("Initiating TON payment...");
                }
            });
            break;
        case 'stars':
            // TODO: Здесь будет логика оплаты через Telegram Stars API
            // Возможно, потребуется запрос к твоему бэкенду
            tg.showAlert("Telegram Stars payment coming soon!");
            break;
        case 'sbp':
            // TODO: Здесь будет логика инициации оплаты через СБП/карту
            // Обычно это открытие внешней ссылки на платежную систему
            tg.openLink("https://твоя-ссылка-на-оплату.com");
            break;
    }
}

// TODO: Пример функции для Supabase (добавь ее в js/config/supabase.js или в global.js, если она там используется)
/*
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchBalance(userId) {
    const { data, error } = await supabase
        .from('users') // Предполагаем, что у тебя есть таблица 'users'
        .select('balance')
        .eq('telegram_id', userId) // Убедись, что у тебя есть колонка 'telegram_id'
        .single();
    
    if (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }
    return data.balance;
}
*/
