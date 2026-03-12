// --- Глобальные переменные и константы ---
const casesContainer = document.getElementById('cases-container');
let allCases = []; // Массив для хранения всех загруженных кейсов
const tg = window.Telegram.WebApp;
// --- Функции рендеринга (остаются без изменений) ---
function renderCases(casesArray) {
    if (!casesContainer) {
        console.error('Fatal Error: Element with id "cases-container" not found!');
        return;
    }
    casesContainer.innerHTML = '';
    if (!casesArray || casesArray.length === 0) {
        casesContainer.innerHTML = '<p>Кейсы не найдены. Попробуйте обновить страницу позже.</p>';
        return;
    }
    casesArray.forEach(caseItem => {
        const caseElement = document.createElement('div');
        caseElement.className = 'case';
        caseElement.innerHTML = 
            <img src="${caseItem.image_url}" alt="Image for ${caseItem.name}">
            <h3>${caseItem.name}</h3>
            <p>Цена: ${caseItem.price} $TOWI</p>
        ;
        caseElement.addEventListener('click', () => {
            console.log(Clicked on case: ${caseItem.name});
            alert(Вы открываете кейс: ${caseItem.name});
        });
        casesContainer.appendChild(caseElement);
    });
}

/**
 * Основная асинхронная функция для инициализации приложения.
 * Улучшенная версия с правильной обработкой гостевого режима.
 */
async function initializeApp() {
    console.log("Запускаем инициализацию приложения...");
    tg.ready(); // Сообщаем Telegram, что приложение готово

    try {
        // ШАГ 1: Загружаем кейсы. Это не зависит от пользователя.
        console.log("Шаг 1: Загрузка кейсов...");
        allCases = await fetchCasesFromDB(); // Эта функция из case.v2.js
        renderCases(allCases);
        console.log("Кейсы успешно загружены и отображены.");

        // ШАГ 2: Работа с профилем пользователя Telegram.
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            console.log("Шаг 2: Обнаружен пользователь Telegram. Обрабатываем профиль...");
            const telegramUser = tg.initDataUnsafe.user;
            
            // Пытаемся получить профиль пользователя из нашей БД
            const { data: userProfile, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_user_id', telegramUser.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 - это ошибка "не найдено", ее мы ожидаем
                throw new Error(Ошибка при поиске профиля: ${fetchError.message});
            }

            if (!userProfile) {
                console.log("Профиль не найден, создаем новый для пользователя Teleram ID:", telegramUser.id);
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        telegram_user_id: telegramUser.id,
                        username: telegramUser.username || 'N/A',
                        first_name: telegramUser.first_name || '',
                        last_name: telegramUser.last_name || ''
                        // Добавьте сюда любые другие поля по умолчанию, например balance: 0
                    });

                if (insertError) {
                    throw new Error(Ошибка при создании профиля: ${insertError.message});
                }
                console.log("Новый профиль успешно создан.");
            } else {
                console.log("Профиль пользователя найден:", userProfile);
            }
        } else {
            // Если мы не в Telegram, просто выводим сообщение.
            // НЕ ПЫТАЕМСЯ создать пользователя в базе данных.
            console.log("Шаг 2: Гостевой режим. Аутентификация пропущена.");
        }

    } catch (error) {
        console.error('Критическая ошибка при инициализации приложения:', error);
        if (casesContainer) {
            casesContainer.innerHTML = <p style="color: red; font-weight: bold;">Произошла ошибка. Обновите страницу или проверьте консоль (F12).</p>;
        }
    }
}

// --- Точка входа ---
document.addEventListener('DOMContentLoaded', initializeApp);
