const tg = window.Telegram.WebApp;
const db = window.supabase; // Используем window.supabase, как мы его определили в config/supabase.js

document.addEventListener('DOMContentLoaded', async () => {
    tg.ready();
    tg.expand();

    let user = tg.initDataUnsafe?.user;

    // ФЕЙКОВЫЕ ДАННЫЕ ДЛЯ ТЕСТА В БРАУЗЕРЕ (если не в Telegram)
    if (!user) {
        console.warn("Telegram user data not found. Using mock data for development.");
        user = {
            id: 12345, // Используй реальный ID, если хочешь, чтобы он брал твой профиль из БД
            username: 'Tester_Local',
            first_name: 'Marat',
            photo_url: 'https://i.pravatar.cc/150' // Заглушка аватара
        };
    }

    // Отображаем данные на экране
    document.getElementById('user-username').textContent = user.username ? `@${user.username}` : user.first_name;
    if (user.photo_url) {
        document.getElementById('user-avatar').src = user.photo_url;
    } else {
        // Заглушка, если нет фото
        document.getElementById('user-avatar').src = 'https://i.pravatar.cc/150'; 
    }

    // Загружаем баланс из базы, если Supabase инициализирован
    if (db) {
        await fetchBalance(user);
    } else {
        console.error("Supabase клиент не инициализирован. Проверьте config/supabase.js");
        document.getElementById('user-balance-value').textContent = 'Error TON';
    }

    setupModal();
});

async function fetchBalance(user) {
    try {
        let { data: profile, error } = await db
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();

        if (error && error.code === 'PGRST116') { // PGRST116 = "Row not found"
            console.warn("Пользователь не найден в БД, создаем новый профиль.");
            const { data: newProfile, error: createError } = await db
                .from('profiles')
                .insert([{ id: user.id, username: user.username, balance: 0 }])
                .select()
                .single();
            if (createError) throw createError;
            profile = newProfile;
        } else if (error) {
            throw error;
        }

        if (profile) {
            document.getElementById('user-balance-value').textContent = `${profile.balance.toFixed(2)} TON`;
        }
    } catch (e) {
        console.error("Ошибка при получении/создании профиля пользователя:", e.message);
        document.getElementById('user-balance-value').textContent = 'ERR TON';
    }
}

function setupModal() {
    const modal = document.getElementById('deposit-modal');
    const btn = document.getElementById('deposit-btn');
    const close = document.getElementById('close-modal-btn');
    const payTonBtn = document.getElementById('pay-ton-btn');
    const payStarsBtn = document.getElementById('pay-stars-btn');

    if (btn) btn.onclick = () => modal.style.display = 'flex';
    if (close) close.onclick = () => modal.style.display = 'none';

    if (payTonBtn) payTonBtn.onclick = () => window.Telegram.WebApp.showAlert('Пополнение TON в разработке!');
    if (payStarsBtn) payStarsBtn.onclick = () => window.Telegram.WebApp.showAlert('Пополнение Telegram Stars в разработке!');

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}
