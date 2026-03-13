import { supabase } from './config/supabase.js';

// Функция проверки авторизации пользователя в Supabase
async function checkAuth() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error retrieving user:', error.message);
    return null;
  }
  return data;
}

// Функция получения данных пользователя Telegram
function getTelegramUserData() {
  const tg = window.Telegram.WebApp;
  return {
    id: tg.initDataUnsafe?.user?.id,
    username: tg.initDataUnsafe?.user?.username,
    firstName: tg.initDataUnsafe?.user?.first_name,
    lastName: tg.initDataUnsafe?.user?.last_name,
    photoUrl: tg.initDataUnsafe?.user?.photo_url
  };
}

// Основная функция загрузки профиля пользователя
async function loadUserProfile() {
  try {
    // Получаем данные пользователя Telegram
    const telegramUser = getTelegramUserData();

    // Проверяем наличие Telegram ID
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

    // Если пользователь не найден (код ошибки PGRST101) — создаём нового
    if (error && error.code === 'PGRST101') {
      await createNewUser(telegramUser);
      return;
    }

    // Если произошла другая ошибка — выбрасываем её
    if (error) throw error;

    // Если пользователь найден — обновляем интерфейс
    updateUI(data);

  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    // Показываем дефолтные значения при ошибке
    document.getElementById('username').textContent = '@guest';
    document.getElementById('userAvatar').src = 'default-avatar.png';
    document.getElementById('userBalance').textContent = 'Balance: 0.00 TON';
  }
}

// Функция создания нового пользователя в Supabase
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
    // После успешного создания перезагружаем профиль
    await loadUserProfile();
  }
}

// Функция обновления UI с данными пользователя
function updateUI(userData) {
  document.getElementById('username').textContent = `@${userData.username || 'user'}`;
  if (userData.avatar_url) {
    document.getElementById('userAvatar').src = userData.avatar_url;
  } else {
    document.getElementById('userAvatar').src = 'default-avatar.png'; // Запасной аватар
  }
  document.getElementById('userBalance').textContent = `Balance: ${userData.balance || 0} TON`;
}

// Обработчик загрузки DOM — запускаем загрузку профиля
document.addEventListener('DOMContentLoaded', async () => {
  // Сначала проверяем авторизацию в Supabase
  const user = await checkAuth();
  if (user) {
    // Если пользователь авторизован — отображаем его email
    document.getElementById('user-name').textContent = user.user.email;
  } else {
    // Если не авторизован — показываем кнопку входа
    document.getElementById('login-btn').style.display = 'block';
  }

  // Загружаем профиль пользователя (включая данные из Telegram)
  await loadUserProfile();
});
