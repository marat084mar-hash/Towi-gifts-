// Выводим alert, как только скрипт загрузится и начнёт выполняться
alert('cases.js: Скрипт CASES.JS ЗАГРУЖЕН И НАЧИНАЕТ РАБОТУ!');


// Функция для отображения кейсов на странице
async function renderCases() {
    alert('cases.js: Вызвана функция renderCases().');

    var casesListContainer = document.getElementById('casesListContainer');
    if (!casesListContainer) {
        alert('cases.js: ОШИБКА! Не найден контейнер для кейсов (casesListContainer). Проверьте cases.html.');
        // Для визуальной отладки:
        document.body.innerHTML += '<div style="color:red; background:white; padding:10px;">ОШИБКА: casesListContainer не найден!</div>';
        return;
    }

    // Показываем индикатор загрузки
    casesListContainer.innerHTML = `
        <div class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i>
            Загрузка кейсов...
        </div>
    `;

    // Запрос к Supabase для получения всех активных кейсов
    alert('cases.js: Выполняем запрос к Supabase...');
    try {
        var { data: cases, error } = await supabaseClient
            .from('cases')
            .select('*')
            .eq('is_active', true)
            .order('price_ton', { ascending: true }); // Сортируем по цене

        if (error) {
            console.error('cases.js: Ошибка Supabase:', error);
            casesListContainer.innerHTML = `
                <p style="color: red; text-align: center; width: 100%;">
                    Ошибка загрузки кейсов: ${error.message}<br>
            Код: ${error.code}
                </p>
            `;
            return;
        }

        if (cases.length === 0) {
            alert('cases.js: Активные кейсы не найдены в Supabase.');
            casesListContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Активные кейсы не найдены.</p>';
            return;
        }

        alert('cases.js: Кейсы успешно загружены. Количество: ' + cases.length);
        casesListContainer.innerHTML = ''; // Очищаем контейнер

        // Создаём карточку для каждого кейса
        cases.forEach(function(caseItem) {
            alert('cases.js: Создаём карточку для кейса: ' + caseItem.name);
            var card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-case-id', caseItem.id);

            card.innerHTML = `
                <div class="case-card">
                    <div class="case-icon">
                        <i class="fas fa-box-open"></i>
                    </div>
            <h3 class="case-name">${caseItem.name}</h3>
            <p class="case-price">${caseItem.price_ton} TON</p>
            <button class="open-btn" onclick="openCase(${JSON.stringify(caseItem).replace(/"/g, '&quot;')})">
                Открыть
            </button>
                </div>
            `;

            casesListContainer.appendChild(card);
        });

        alert('cases.js: Все кейсы успешно отображены.');
    } catch (err) {
        console.error('cases.js: Критическая ошибка:', err);
        casesListContainer.innerHTML = `<p style="color: red; text-align: center;">Критическая ошибка: ${err.message}</p>`;
    }
}

// Функция, которая вызывается при клике на кейс
function openCase(caseData) {
    if (!window.userData) {
        alert('cases.js: Данные пользователя не загружены. Попробуйте перезагрузить страницу.');
        return;
    }

    const userBalance = parseFloat(window.userData.balance_ton);
    const casePrice = parseFloat(caseData.price_ton);

    if (userBalance < casePrice) {
        alert(`Недостаточно средств! Требуется ${casePrice} TON, у вас: ${userBalance.toFixed(2)} TON.`);
        return;
    }

    alert(`Открываем кейс "${caseData.name}" за ${casePrice} TON...`);
    // Здесь будет логика:
    // 1. Проверка баланса пользователя
    // 2. Списание средств
    // 3. Запуск анимации рулетки
    // 4. Получение результата и добавление в инвентарь
}

// Запускаем отображение кейсов, когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        renderCases();
    } else {
        alert('cases.js: ОШИБКА! Telegram WebApp не загружен.');
    }
});
