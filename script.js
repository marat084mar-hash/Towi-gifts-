javascript
// Импортируем Supabase CDN (это строка для HTML, но я пишу здесь для понимания)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// ===== Замените эти значения на свои из панели Supabase -> Project Settings -> API =====
const SUPABASE_URL = 'https://kkgjkqiwrppaszvkeqbe.supabase.co' // Пример: 'https://abcdefgh12345.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_DvZIWrBWQ30LyV7FueztDg_TlVTALrs'; // Пример: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
// ======================================================================================

// Инициализируем клиент Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Получаем элементы DOM
const usernameDisplay = document.getElementById('username-display');
const tonBalanceDisplay = document.getElementById('ton-balance-display');
const appContent = document.getElementById('app-content');

// Функция для загрузки данных пользователя
async function loadUserData() {
    try {
        // Мы пока не делаем аутентификацию, поэтому для теста возьмем первого пользователя из базы
        // В реальном приложении здесь будет логика получения текущего залогиненного пользователя
        const { data: users, error } = await supabase
            .from('users')
            .select('username, site_ton_balance, first_name')
            .limit(1); // Берем первого попавшегося для примера

        if (error) {
            throw error;
        }

        if (users && users.length > 0) {
            const user = users[0];
            usernameDisplay.textContent = `@${user.username || user.first_name}`;
            tonBalanceDisplay.textContent = `Баланс: ${user.site_ton_balance.toFixed(2)} TON`;
            appContent.innerHTML = `<h1>Привет, ${user.first_name}!</h1><p>Твои данные успешно загружены.</p>`;
        } else {
            // Если пользователей нет, можно предложить зарегистрироваться или создать тестового
            appContent.innerHTML = `<h1>Добро пожаловать!</h1><p>Пользователь не найден. Можете создать нового.</p>`;
            usernameDisplay.textContent = `@Гость`;
            tonBalanceDisplay.textContent = `Баланс: 0.00 TON`;
        }

    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error.message);
        appContent.innerHTML = `<h1>Ошибка!</h1><p>Не удалось загрузить данные пользователя: ${error.message}</p>`;
        usernameDisplay.textContent = `@Ошибка`;
        tonBalanceDisplay.textContent = `Баланс: --- TON`;
    }
}

// Запускаем загрузку данных при старте приложения
document.addEventListener('DOMContentLoaded', () => {
    // Вставляем скрипт Supabase CDN динамически, так как Gitpod не всегда хорошо работает с CDN в HTML напрямую
    const supabaseScript = document.createElement('script');
    supabaseScript.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    supabaseScript.onload = () => {
        // После загрузки библиотеки Supabase, инициализируем клиент и загружаем данные
        loadUserData();
    };
    document.head.appendChild(supabaseScript);
});

// Пример обработчиков для кнопок (пока просто алерты)
document.getElementById('cases-btn').addEventListener('click', () => alert('Переход на страницу Кейсов!'));
document.getElementById('inventory-btn').addEventListener('click', () => alert('Переход на страницу Инвентаря!'));
document.getElementById('crash-btn').addEventListener('click', () => alert('Переход на страницу Ракеты!'));
document.getElementById('upgrade-btn').addEventListener('click', () => alert('Переход на страницу Апгрейдов!'));
