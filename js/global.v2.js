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
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    console.warn('Telegram WebApp not available');
    return null;
  }

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
    if (!telegramUser) {
      console.warn('Telegram user data not available');
      return;
    }

    if (!telegramUser.id) {
      console.warn('Telegram user ID not available');
      return;
    }

    console.log('Loading profile for Telegram ID:', telegramUser.id);

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
    setDefaultUI();
  }
}

// Функция создания нового пользователя в Supabase
async function createNewUser(telegramUser) {
  console.log('Creating new user:', telegramUser);
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
  console.log('Updating UI with user data:', userData);

  const usernameEl = document.getElementById('username');
  const avatarEl = document.getElementById('userAvatar');
  const balanceEl = document.getElementById('userBalance');

  // Проверяем существование элементов перед установкой значений
  if (usernameEl) {
    usernameEl.textContent = `@${userData.username || 'user'}`;
  }

  if (avatarEl) {
    if (userData.avatar_url) {
      avatarEl.src = userData.avatar_url;
    } else {
      avatarEl.src = 'default-avatar.png'; // Запасной аватар
    }
  }

  if (balanceEl) {
    balanceEl.textContent = `Balance: ${userData.balance || 0} TON`;
  }
}

// Установка дефолтных значений UI
function setDefaultUI() {
  const usernameEl = document.getElementById('username');
  const avatarEl = document.getElementById('userAvatar');
  const balanceEl = document.getElementById('userBalance');

  if (usernameEl) usernameEl.textContent = '@guest';
  if (avatarEl) avatarEl.src = 'default-avatar.png';
  if (balanceEl) balanceEl.textContent = 'Balance: 0.00 TON';
}

// Обработчик загрузки DOM — запускаем загрузку профиля
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing...');

  // Сначала проверяем авторизацию в Supabase
  const user = await checkAuth();
  if (user) {
    // Если пользователь авторизован — отображаем его email
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
      userNameEl.textContent = user.user.email;
    }
  } else {
    // Если не авторизован — показываем кнопку входа
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.style.display = 'block';
    }
  }

  // Загружаем профиль пользователя (включая данные из Telegram)
  await loadUserProfile();
});
// Добавьте эту функцию в global.v2.js
function topUp(method) {
  console.log('Пополнение баланса:', method);
  hideTopUpModal(); // Скрываем модальное окно

  switch (method) {
    case 'ton':
      alert('Пополнение через TON (бонус +10%)');
      break;
    case 'stars':
      alert('Пополнение звёздами (100 звёзд = 1 TON)');
      break;
    case 'rub':
      alert('Пополнение через СБП (105 руб = 1 TON)');
      break;
    default:
      console.warn('Неизвестный метод пополнения:', method);
  }
}

// Функции для управления модальным окном
function showTopUpModal() {
  document.getElementById('topUpModal').classList.add('active');
}

function hideTopUpModal() {
  document.getElementById('topUpModal').classList.remove('active');
}
