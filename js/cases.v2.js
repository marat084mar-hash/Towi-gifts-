/**
 * Асинхронная функция для загрузки и отображения кейсов из Supabase
 */
async function loadCases() {
    // Проверяем, существует ли клиент supabase, созданный в global.v2.js
    if (!window.supabase) {
        console.error('Клиент Supabase (window.supabase) не найден. Убедитесь, что global.v2.js загружен первым.');
        return;
    }

    console.log('Начинаю загрузку кейсов...');
    const casesContainer = document.querySelector('.cases__container');
    
    // Если мы не на странице с кейсами, выходим из функции
    if (!casesContainer) {
        console.log('Контейнер для кейсов ".cases__container" не найден на этой странице. Загрузка кейсов не требуется.');
        return;
    }

    // Показываем индикатор загрузки
    casesContainer.innerHTML = '<p class="loading-text" style="color: var(--text-color);">Загрузка кейсов...</p>';

    try {
        // Запрашиваем данные из таблицы 'cases'
        const { data: cases, error } = await window.supabase
            .from('cases') // Убедись, что имя таблицы верное!
            .select('*'); // Запрашиваем все колонки

        if (error) {
            // Если Supabase вернул ошибку, выводим ее
            throw error;
        }

        if (!cases || cases.length === 0) {
            console.warn('Кейсы не найдены. Таблица пуста или к ней нет доступа.');
            casesContainer.innerHTML = '<p style="color: var(--text-color);">Кейсы пока не добавлены.</p>';
            return;
        }

        console.log('Кейсы успешно загружены:', cases);

        // Очищаем контейнер от сообщения о загрузке
        casesContainer.innerHTML = '';

        // Создаем и добавляем карточки кейсов на страницу
        cases.forEach(caseItem => {
            const caseElement = document.createElement('article');
            caseElement.className = 'cases__card';
            caseElement.innerHTML = `
                <div class="cases__image-container">
                    <img src="${caseItem.image_url || 'assets/img/default-case.png'}" alt="Изображение кейса" class="cases__img">
                </div>
                <div class="cases__data">
                    <h3 class="cases__name">${caseItem.name}</h3>
                    <span class="cases__price">${caseItem.price} ₽</span>
                    <button class="button cases__button" data-case-id="${caseItem.id}">Открыть</button>
                </div>
            `;
            casesContainer.appendChild(caseElement);
        });

    } catch (error) {
        console.error('Ошибка при выполнении loadCases:', error);
        casesContainer.innerHTML = `<p class="error-text" style="color: #ff5555;">Не удалось загрузить кейсы. Ошибка: ${error.message}</p>`;
    }
}

// Запускаем загрузку кейсов только после того, как сработает DOMContentLoaded из global.v2.js
// и будет понятно, запущено ли приложение в Telegram.
if (window.tg && window.tg.initData) {
    loadCases();
}
