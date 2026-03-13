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
