const tg = window.Telegram.WebApp;
const supabase = window.supabaseClient;
document.addEventListener('DOMContentLoaded', async () => {
    tg.expand(); // Развернуть на весь экран
    
    const user = tg.initDataUnsafe?.user || { id: 0, username: 'test_user', first_name: 'Tester' };
    
    // 1. Отображаем данные из Telegram сразу
    document.getElementById('user-username').textContent = user.username ? @${user.username} : user.first_name;
    if (user.photo_url) {
        document.getElementById('user-avatar').src = user.photo_url;
    }

    // 2. Загружаем баланс из Supabase
    await loadUserData(user);

    // 3. Логика модалки пополнения
    setupDepositModal();
});

async function loadUserData(tgUser) {
    // Пытаемся получить профиль
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tgUser.id)
        .single();

    // Если пользователя нет в базе - создаем его
    if (!profile) {
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
                { id: tgUser.id, username: tgUser.username, balance: 0 }
            ])
            .select()
            .single();
        profile = newProfile;
    }

    if (profile) {
        document.getElementById('user-balance-value').textContent = ${profile.balance.toFixed(2)} TON;
    }
}

function setupDepositModal() {
    const modal = document.getElementById('deposit-modal');
    const btn = document.getElementById('deposit-btn');
    const close = document.getElementById('close-modal-btn');

    btn.onclick = () => modal.style.display = 'flex';
    close.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    }
}
