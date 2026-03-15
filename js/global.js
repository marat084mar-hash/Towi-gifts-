const db = window.supabase; // Используем window.supabase, как мы его определили в config/supabase.js

document.addEventListener('DOMContentLoaded', async () => {
    if (!tg) {
        console.error("Telegram WebApp не доступен");
        return;
    }

    tg.ready();
    tg.expand();
    document.body.classList.add('visible'); // Показываем тело страницы с анимацией

    // --- БЛОКИРОВКА ДОСТУПА НЕ ИЗ TELEGRAM ---
    if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        document.body.innerHTML = `
            <style>
                body {
                    background-color: #0f172a;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: 'Poppins', sans-serif;
            text-align: center;
            padding: 20px;
            opacity: 1 !important; /* Гарантируем видимость для сообщения об ошибке */
            visibility: visible !important;
                }
                h1 { color: #8c52ff; font-size: 28px; margin-bottom: 15px; }
                p { margin-top: 10px; color: #94a3b8; font-size: 16px; }
            </style>
            <h1>Доступ запрещен</h1>
            <p>Пожалуйста, откройте это приложение через официального Telegram-бота.</p>
            <p>Это Telegram Web App и оно работает только внутри Telegram.</p>
        `;

        // Для локальной разработки, если вы хотите игнорировать эту проверку, раскомментируйте 3 строки ниже.
        // Закомментируйте 'return' выше, чтобы заглушка сработала
        // const mockUser = { id: 12345, username: 'dev_user', first_name: 'Developer', photo_url: 'https://i.pravatar.cc/150' };
        // tg.initDataUnsafe = { user: mockUser };
        // console.warn("Внимание: Обход проверки Telegram WebApp для локальной разработки.");
        return; // Закомментируйте эту строку, если используете заглушку
    }

    // Теперь user точно есть (либо настоящий, либо заглушка, если вы её включили)
    let user = tg.initDataUnsafe.user;

    // Отображаем данные пользователя в хедере
    const usernameElement = document.getElementById('user-username');
    if (usernameElement) {
        usernameElement.textContent = user.username ? `@${user.username}` : user.first_name;
    }

    // Обновлённая логика для аватара с отображением первой буквы
    setupUserAvatar(user);
if (!tg) {
console.error("Telegram WebApp не доступен");
return;
}

    // Загружаем баланс из базы данных
    if (db) {
        await fetchBalance(user);
    } else {
        console.error("Supabase клиент не инициализирован. Проверьте config/supabase.js");
        const balanceElement = document.getElementById('user-balance-value');
        if (balanceElement) {
            balanceElement.textContent = 'DB Error';
        }
    }
tg.ready();
tg.expand();
document.body.classList.add('visible'); // Показываем тело страницы с анимацией

// --- БЛОКИРОВКА ДОСТУПА НЕ ИЗ TELEGRAM ---
if (!tg.initDataUnsafe || !tg.initDataUnsafe.user) {
document.body.innerHTML = `
<style>
body {
background-color: #0f172a;
color: white;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
height: 100vh;
font-family: 'Poppins', sans-serif;
text-align: center;
padding: 20px;
opacity: 1 !important; /* Гарантируем видимость для сообщения об ошибке */
visibility: visible !important;
}
h1 { color: #8c52ff; font-size: 28px; margin-bottom: 15px; }
p { margin-top: 10px; color: #94a3b8; font-size: 16px; }
</style>
<h1>Доступ запрещен</h1>
<p>Пожалуйста, откройте это приложение через официального Telegram-бота.</p>
<p>Это Telegram Web App и оно работает только внутри Telegram.</p>
`;

// Для локальной разработки, если вы хотите игнорировать эту проверку, раскомментируйте 3 строки ниже.
// Закомментируйте 'return' выше, чтобы заглушка сработала
// const mockUser = { id: 12345, username: 'dev_user', first_name: 'Developer', photo_url: 'https://i.pravatar.cc/150' };
// tg.initDataUnsafe = { user: mockUser };
// console.warn("Внимание: Обход проверки Telegram Web App для локальной разработки.");
return; // Закомментируйте эту строку, если используете заглушку
}

    // Настраиваем модальное окно пополнения
    setupDepositModal();
// Теперь user точно есть (либо настоящий, либо заглушка, если вы ее включили)
let user = tg.initDataUnsafe.user;

    // Устанавливаем динамический заголовок страницы и активную кнопку навигации
    setPageSpecifics();
// Отображаем данные пользователя в хедере
const usernameElement = document.getElementById('user-username');
if (usernameElement) {
usernameElement.textContent = user.username ? `@${user.username}` : user.first_name;
}

    // Предоставляем контейнер для специфичных скриптов
    window.dynamicContentContainer = document.getElementById('dynamic-content-container');
    if (!window.dynamicContentContainer) {
        console.error("Ошибка: #dynamic-content-container не найден на странице!");
    }
});
const avatarElement = document.getElementById('user-avatar');
if (avatarElement) {
if (user.photo_url) {
avatarElement.src = user.photo_url;
} else {
avatarElement.src = `https://i.pravatar.cc/150?u=${user.id}`;
}
}

function setupUserAvatar(user) {
    const avatarElement = document.getElementById('user-avatar');
    if (!avatarElement) return;
// Загружаем баланс из базы данных
if (db) {
await fetchBalance(user);
} else {
console.error("Supabase клиент не инициализирован. Проверьте config/supabase.js");
const balanceElement = document.getElementById('user-balance-value');
if (balanceElement) {
balanceElement.textContent = 'DB Error';
}
}

    // Очищаем элемент
    avatarElement.innerHTML = '';
    avatarElement.style.background = 'none';
// Настраиваем модальное окно пополнения
setupDepositModal();

    function createLetterAvatar(letter) {
        const letterElement = document.createElement('div');
        letterElement.textContent = letter;
        letterElement.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #8c52ff;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            font-family: Arial, sans-serif;
        `;
        avatarElement.appendChild(letterElement);
    }
// Устанавливаем динамический заголовок страницы и активную кнопку навигации
setPageSpecifics();

    if (user.photo_url) {
        // Пытаемся загрузить аватар из Telegram
        const img = new Image();
        img.onload = () => {
            avatarElement.innerHTML = `<img src="${user.photo_url}" alt="${user.first_name || 'Пользователь'}" style="width: 100%; height: 100%; border-radius: 50%;">`;
        };
        img.onerror = () => {
            // Если не загрузилось, показываем первую букву имени
            if (user.first_name) {
                const firstLetter = user.first_name.charAt(0).toUpperCase();
                createLetterAvatar(firstLetter);
            }
            // Иначе оставляем поле пустым
        };
        img.src = user.photo_url;
    } else {
        // Если нет photo_url, показываем первую букву или оставляем пустым
        if (user.first_name) {
            const firstLetter = user.first_name.charAt(0).toUpperCase();
            createLetterAvatar(firstLetter);
        }
        // Иначе поле остаётся пустым
    }
// Предоставляем контейнер для специфичных скриптов
window.dynamicContentContainer = document.getElementById('dynamic-content-container');
if (!window.dynamicContentContainer) {
console.error("Ошибка: #dynamic-content-container не найден на странице!");
}
});

async function fetchBalance(user) {
    try {
        let { data: profile, error } = await db
            .from('profiles')
            .select('balance_ton, balance_stars')
            .eq('id', Number(user.id))
            .single();

        if (error && error.code === 'PGRST116') {
            console.warn(`Пользователь с ID ${user.id} не найден в БД, создаём новый профиль.`);
            const { data: newProfile, error: createError } = await db
                .from('profiles')
                .insert([{
                    id: Number(user.id),
            username: user.username || 'unknown',
            avatar_url: user.photo_url || '',
            balance_ton: 0,
            balance_stars: 0
        }])
        .select('balance_ton, balance_stars')
        .single();

            if (createError) throw createError;
            profile = newProfile;
        } else if (error) {
            throw error;
        }

        // Обновляем отображение баланса TON
        const balanceTonElement = document.getElementById('user-balance-value');
        if (balanceTonElement) {
            balanceTonElement.textContent = `${parseFloat(profile.balance_ton).toFixed(2)} TON`;
        }

        // Дополнительно: отображаем баланс Stars, если нужно
        const balanceStarsElement = document.getElementById('user-balance-stars');
        if (balanceStarsElement) {
            balanceStarsElement.textContent = `${profile.balance_stars} Stars`;
        }
    } catch (e) {
        console.error("Критическая ошибка при получении/создании профиля пользователя:", e);
        const balanceElement = document.getElementById('user-balance-value');
        if (balanceElement) {
            balanceElement.textContent = '0.00 TON'; // Вместо ERR TON показываем 0.00 TON
        }
    }
try {
let { data: profile, error } = await db
.from('profiles')
.select('balance_ton, balance_stars')
.eq('id', user.id)
.single();

if (error && error.code === 'PGRST116') { // Пользователь не найден
console.warn(`Пользователь с ID ${user.id} не найден в БД, создаем новый профиль.`);
const { data: newProfile, error: createError } = await db
.from('profiles')
.insert([{
id: user.id,
username: user.username || 'unknown',
avatar_url: user.photo_url || '',
balance_ton: 0,
balance_stars: 0
}])
.select('balance_ton, balance_stars')
.single();

if (createError) throw createError;
profile = newProfile;
} else if (error) {
throw error;
}
function setupDepositModal() {
    const modal = document.getElementById('deposit-modal');
    const btn = document.getElementById('deposit-btn');
    const close = document.getElementById('close-modal-btn');
    const payTonBtn = document.getElementById('pay-ton-btn');
    const payStarsBtn = document.getElementById('pay-stars-btn');

    if (btn) btn.onclick = () => modal.style.display = 'flex';
    if (close) close.onclick = () => modal.style.display = 'none';
// Обновляем отображение баланса TON
const balanceTonElement = document.getElementById('user-balance-value');
if (balanceTonElement) {
balanceTonElement.textContent = `${parseFloat(profile.balance_ton).toFixed(2)} TON`;
}

    if (payTonBtn) payTonBtn.onclick = () => tg.showAlert('Пополнение TON в разработке!');
    if (payStarsBtn) payStarsBtn.onclick = () => tg.showAlert('Пополнение Telegram Stars в разработке!');
// Дополнительно: отображаем баланс Stars, если нужно
const balanceStarsElement = document.getElementById('user-balance-stars');
if (balanceStarsElement) {
balanceStarsElement.textContent = `${profile.balance_stars} Stars`;
}
} catch (e) {
console.error("Ошибка при получении/создании профиля пользователя:", e.message);
const balanceElement = document.getElementById('user-balance-value');
if (balanceElement) {
balanceElement.textContent = 'ERR TON';
}
}
}

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
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

function setPageSpecifics() {
    const pageTitleElement = document.getElementById('page-dynamic-title');
    const htmlTitleElement = document.getElementById('page-html-title');
    const currentPath = window.location.pathname.split('/').pop();
    let titleText = 'Towi Gifts'; // Дефолтный заголовок для HTML <title>

    // Устанавливаем заголовок <h1> на странице
    if (pageTitleElement) {
        if (currentPath === 'cases.html') {
            pageTitleElement.textContent = 'Доступные кейсы';
            titleText = 'Кейсы - Towi Gifts';
        } else if (currentPath === 'inventory.html') {
            pageTitleElement.textContent = 'Мой инвентарь';
            titleText = 'Инвентарь - Towi Gifts';
        } else if (currentPath === 'upgrade.html') {
            pageTitleElement.textContent = 'Улучшение предметов';
            titleText = 'Апгрейд - Towi Gifts';
        } else if (currentPath === 'index.html' || currentPath === '') {
            pageTitleElement.style.display = 'none'; // На главной странице скрываем h1
        }
    }
    // Устанавливаем заголовок в шапке браузера/приложения
    if (htmlTitleElement) {
        htmlTitleElement.textContent = titleText;
    }

    // Подсветка активной ссылки в нижней навигации
    const navLinks = document.querySelectorAll('.bottom-nav .menu-button');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
            link.style.pointerEvents = 'none'; // Отключаем клик по активной ссылке
        } else {
            link.classList.remove('active');
            link.style.pointerEvents = 'auto';
        }
    });
const pageTitleElement = document.getElementById('page-dynamic-title');
const htmlTitleElement = document.getElementById('page-html-title');
const currentPath = window.location.pathname.split('/').pop();
let titleText = 'Towi Gifts'; // Дефолтный заголовок для HTML <title>

// Устанавливаем заголовок <h1> на странице
if (pageTitleElement) {
if (currentPath === 'cases.html') {
pageTitleElement.textContent = 'Доступные кейсы';
titleText = 'Кейсы - Towi Gifts';
} else if (currentPath === 'inventory.html') {
pageTitleElement.textContent = 'Мой инвентарь';
titleText = 'Инвентарь - Towi Gifts';
} else if (currentPath === 'upgrade.html') {
pageTitleElement.textContent = 'Улучшение предметов';
titleText = 'Апгрейд - Towi Gifts';
} else if (currentPath === 'index.html' || currentPath === '') {
pageTitleElement.style.display = 'none'; // На главной странице скрываем h1
}
}
// Устанавливаем заголовок в шапке браузера/приложения
if (htmlTitleElement) {
htmlTitleElement.textContent = titleText;
}

// Подсветка активной ссылки в нижней навигации
const navLinks = document.querySelectorAll('.bottom-nav .menu-button');
navLinks.forEach(link => {
const linkPath = link.getAttribute('href').split('/').pop();
if (linkPath === currentPath) {
link.classList.add('active');
link.style.pointerEvents = 'none'; // Отключаем клик по активной ссылке
} else {
link.classList.remove('active');
link.style.pointerEvents = 'auto';
}
});
}
// Кастомное событие для обновления баланса (для вызова из других скриптов)
document.addEventListener('balanceUpdated', async () => {
    const userId = tg.initDataUnsafe?.user?.id;
    if (userId && db) {
        await fetchBalance({ id: userId });
    }
const userId = tg.initDataUnsafe?.user?.id;
if (userId && db) {
await fetchBalance({ id: userId });
}
});

// Дополнительная функция для принудительного обновления аватара (если нужно вызвать извне)
window.updateUserAvatar = function(user) {
    setupUserAvatar(user);
};

// Функция для принудительного обновления баланса
window.refreshBalance = async function() {
    if (tg?.initDataUnsafe?.user && db) {
        await fetchBalance(tg.initDataUnsafe.user);
    }
};
