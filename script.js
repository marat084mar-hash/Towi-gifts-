 // Инициализация Telegram Web App
    Telegram.WebApp.ready();

    // Попытка изменить текст заголовка приложения сразу после загрузки
    // Если скрипт работает, то заголовок в шапке изменится на "Towi Gifts - ЗАПУЩЕНО!"
    const appTitleElement = document.querySelector('.app-title');
    if (appTitleElement) {
        appTitleElement.textContent = 'Towi Gifts - ЗАПУЩЕНО!';
        appTitleElement.style.color = 'lime'; // Добавим яркий цвет, чтобы было видно
    }

    Telegram.WebApp.expand(); // Разворачиваем Mini App на весь экран
