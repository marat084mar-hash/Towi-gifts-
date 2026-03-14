const tg = window.Telegram.WebApp;

// ВНИМАНИЕ: Проверь, как называется переменная в твоем config/supabase.js
// Если там const supabase = ..., то используй supabase.
const db = window.supabaseClient || window.supabase; 

document.addEventListener('DOMContentLoaded', async () => {
    tg.ready();
    tg.expand();

    let user = tg.initDataUnsafe?.user;

    // ФЕЙКОВЫЕ ДАННЫЕ ДЛЯ ТЕСТА В БРАУЗЕРЕ
    if (!user) {
        user = {
            id: 12345, // Твой реальный ID для тестов в БД
            username: 'Tester_Local',
            first_name: 'Marat',
            photo_url: 'https://i.pravatar.cc/150'
        };
    }

    // Отображаем данные на экране
    document.getElementById('user-username').textContent = user.username ? `@${user.username}` : user.first_name;
    if (user.photo_url) {
        document.getElementById('user-avatar').src = user.photo_url;
    }

    // Загружаем баланс из базы
    if (db) {
        await fetchBalance(user);
    } else {
        console.error("Supabase не найден! Проверь config/supabase.js");
    }

    setupModal();
});

async function fetchBalance(user) {
    try {
        // Проверяем, есть ли пользователь в таблице profiles
        let { data: profile, error } = await db
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            // Если пользователя нет, создаем его
            const { data: newProfile } = await db
                .from('profiles')
                .insert([{ id: user.id, username: user.username, balance: 0 }])
                .select()
                .single();
            profile = newProfile;
        }

        if (profile) {
            document.getElementById('user-balance-value').textContent = `${profile.balance.toFixed(2)} TON`;
        }
    } catch (e) {
        console.error("Ошибка БД:", e);
    }
}

function setupModal() {
    const modal = document.getElementById('deposit-modal');
    const btn = document.getElementById('deposit-btn');
    const close = document.getElementById('close-modal-btn');

    if(btn) btn.onclick = () => modal.style.display = 'flex';
    if(close) close.onclick = () => modal.style.display = 'none';
}
