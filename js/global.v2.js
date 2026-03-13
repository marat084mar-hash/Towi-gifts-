import { supabase } from './config/supabase.js';

async function checkAuth() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error retrieving user:', error.message);
    return null;
  }
  return data;
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuth();
  if (user) {
    // Пользователь авторизован — отображаем его данные
    document.getElementById('user-name').textContent = user.user.email;
  } else {
    // Пользователь не авторизован — показываем кнопку входа
    document.getElementById('login-btn').style.display = 'block';
  }
});
async function loadUserProfile() {
  try {
    const telegramUser = getTelegramUserData();

    if (!telegramUser.id) {
      console.warn('Telegram user data not available');
      return;
    }

    // Ищем пользователя в Supabase по Telegram ID
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single();

    if (error && error.code === 'PGRST101') {
      // Пользователь не найден — создаём нового
      await createNewUser(telegramUser);
      return;
    }

    if (error) throw error;

    // Обновляем интерфейс
    updateUI(data);
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    // Показываем дефолтные значения
    document.getElementById('username').textContent = '@guest';
    document.getElementById('userAvatar').src = 'default-avatar.png';
  }
}

async function createNewUser(telegramUser) {
  const { error } = await supabase
    .from('users')
    .insert([{
      telegram_id: telegramUser.id,
      username: telegramUser.username,
      avatar_url: telegramUser.photoUrl || null,
      balance: 0
    }]);

  if (error) {
    console.error('Ошибка создания пользователя:', error);
  } else {
    await loadUserProfile(); // Перезагружаем профиль после создания
  }
}

function updateUI(userData) {
  document.getElementById('username').textContent = `@${userData.username || 'user'}`;
  if (userData.avatar_url) {
    document.getElementById('userAvatar').src = userData.avatar_url;
  }
  document.getElementById('userBalance').textContent = `Balance: ${userData.balance || 0} TON`;
}
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
});
