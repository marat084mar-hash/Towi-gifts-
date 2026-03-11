// Замените на ваши ключи Supabase
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Глобальная переменная для хранения текущего баланса и пользователя
let currentUser = {
    id: null,
    balance: 0.00,
    username: '@guest'
};

// Функция для обновления баланса на всех страницах
async function updateBalanceDisplay() {
    const balanceElements = document.querySelectorAll('#balance');
    const currentBalanceDisplay = document.getElementById('current-balance-display');
    const usernameElement = document.getElementById('username');

    if (!currentUser.id) {
        // Попытка получить или создать анонимного пользователя
        await ensureUserAuthenticated();
    }

    if (currentUser.id) {
        const { data, error } = await supabase
            .from('users')
            .select('balance, username')
            .eq('id', currentUser.id)
            .single();
 if (error && error.code !== 'PGRST116') { // PGRST116 is for no rows found
            console.error('Ошибка при загрузке баланса:', error.message);
            // Если пользователя нет, возможно, нужно создать его или перенаправить на авторизацию
            currentUser.balance = 0.00;
            currentUser.username = '@guest';
        } else if (data) {
            currentUser.balance = data.balance;
            currentUser.username = data.username || '@user' + currentUser.id.substring(0, 4);
        } else {
             // Если данных нет (пользователь только что создан), установим дефолты
            currentUser.balance = 0.00;
            currentUser.username = '@user' + currentUser.id.substring(0, 4);
        }
    }

    balanceElements.forEach(el => {
        el.textContent = Баланс: ${currentUser.balance.toFixed(2)} TON;
    });
    if (currentBalanceDisplay) {
        currentBalanceDisplay.textContent = ${currentUser.balance.toFixed(2)} TON;
    }
    if (usernameElement) {
        usernameElement.textContent = currentUser.username;
    }
}

// Простая функция для имитации анонимной авторизации/создания пользователя
// В реальном приложении здесь будет полноценная авторизация Supabase Auth
async function ensureUserAuthenticated() {
    let storedUserId = localStorage.getItem('user_id');

    if (storedUserId) {
        currentUser.id = storedUserId;
        // Проверим, существует ли пользователь в базе данных
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', storedUserId)
            .single();

        if (error && error.code === 'PGRST116') { // No rows found
            console.warn('Пользователь с ID из localStorage не найден в базе, создаем нового.');
            storedUserId = null; // Принудительно создаем нового
        } else if (error) {
            console.error('Ошибка при проверке пользователя:', error.message);
            storedUserId = null;
        }
    }

    if (!storedUserId) {
        // Создаем "анонимного" пользователя
        // В реальном приложении это может быть supabase.auth.signUp или signInAnonymously
        const newUserUUID = crypto.randomUUID(); // Генерируем уникальный ID
        const { data, error } = await supabase
            .from('users')
            .insert([{ id: newUserUUID, balance: 0.00, username: '@user' + newUserUUID.substring(0, 4) }])
            .select();

        if (error) {
            console.error('Ошибка при создании нового пользователя:', error.message);
            return; // Не можем продолжить без пользователя
        }
        currentUser.id = data[0].id;
        localStorage.setItem('user_id', currentUser.id);
        console.log('Создан новый пользователь:', currentUser.id);
    } else {
        currentUser.id = storedUserId;
    }
}


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await ensureUserAuthenticated();
    await updateBalanceDisplay();
});
``

