const tg = window.Telegram.WebApp;
const db = window.supabase; // Используем window.supabase, как мы его определили в config/supabase.js

document.addEventListener('DOMContentLoaded', async () => {
    tg.ready();
    tg.expand();

    // --- БЛОКИРОВКА ДОСТУПА НЕ ИЗ TELEGRAM ---
    if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        document.body.innerHTML = 
            <style>
                body { background-color: #18222d; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; text-align: center; padding: 20px;}
                h1 { color: #8c52ff; }
                p { margin-top: 15px; }
            </style>
            <h1>Доступ запрещен</h1>
            <p>Пожалуйста, откройте это приложение через официального Telegram-бота.</p>
            <p>Это Telegram Web App и оно работает только внутри Telegram.</p>
        ;
        // Если вы тестируете локально и вам нужен обход, можно временно раскомментировать
        // return; // Закомментируйте эту строку, если хотите тестировать заглушкой в браузере
    }

    // --- Использование данных пользователя ---
    let user = tg.initDataUnsafe.user; // Теперь мы уверены, что user существует

    document.getElementById('user-username').textContent = user.username ? @${user.username}` : user.first_name;
    if (user.photo_url) {
        document.getElementById('user-avatar').src = user.photo_url;
    } else {
        document.getElementById('user-avatar').src = 'https://i.pravatar.cc/150?u=' + user.id; // Заглушка с уникальным ID, выглядит как "случайный" аватар
    }

    // --- Загружаем баланс из базы ---
    if (db) {
        await fetchBalance(user);
    } else {
        console.error("Supabase клиент не инициализирован. Проверьте config/supabase.js");
        document.getElementById('user-balance-value').textContent = 'DB Error';
    }

    // --- Настройка модального окна пополнения ---
    setupDepositModal();

    // --- Активация текущей кнопки в нижней навигации ---
    highlightActiveNavLink();

    document.body.style.visibility = 'visible'; // Показываем контент только после загрузки
});
async function fetchBalance(user) {
    try {
        let { data: profile, error } = await db
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();

        if (error && error.code === 'PGRST116') { // PGRST116 = "Row not found" (пользователя нет в БД)
            console.warn(Пользователь с ID ${user.id} не найден в БД, создаем новый профиль.);
            const { data: newProfile, error: createError } = await db
                .from('profiles')
                .insert([{ id: user.id, username: user.username || 'unknown', balance: 0 }]) // Добавляем 'unknown' если username нет
                .select()
                .single();
            if (createError) throw createError;
            profile = newProfile;
        } else if (error) {
            throw error; // Другие ошибки Supabase
        }

        if (profile) {
            document.getElementById('user-balance-value').textContent = ${profile.balance.toFixed(2)} TON;
        }
    } catch (e) {
        console.error("Ошибка при получении/создании профиля пользователя:", e.message);
        document.getElementById('user-balance-value').textContent = 'ERR TON';
    }
}

function setupDepositModal() {
    const modal = document.getElementById('deposit-modal');
    const btn = document.getElementById('deposit-btn');
    const close = document.getElementById('close-modal-btn');
    const payTonBtn = document.getElementById('pay-ton-btn');
    const payStarsBtn = document.getElementById('pay-stars-btn');

    if (btn) btn.onclick = () => modal.style.display = 'flex';
    if (close) close.onclick = () => modal.style.display = 'none';

    if (payTonBtn) payTonBtn.onclick = () => tg.showAlert('Пополнение TON в разработке!');
    if (payStarsBtn) payStarsBtn.onclick = () => tg.showAlert('Пополнение Telegram Stars в разработке!');

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Функция для подсветки активной ссылки в нижней навигации
function highlightActiveNavLink() {
    const navLinks = document.querySelectorAll('.bottom-nav .menu-button');
    const currentPath = window.location.pathname.split('/').pop(); // Получаем имя файла (e.g., cases.html)

    navLinks.forEach(link => {
        // Получаем имя файла из href ссылки
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
            // Опционально: отключаем клик по активной ссылке
            link.style.pointerEvents = 'none';
        } else {
            link.classList.remove('active');
            link.style.pointerEvents = 'auto';
        }
    });
}
