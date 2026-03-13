// Выводим alert, как только скрипт загрузится и начнет выполняться
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
    casesListContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Загрузка кейсов...</p>';


    // Запрос к Supabase для получения всех активных кейсов
    alert('cases.js: Выполняем запрос к Supabase...');
    var { data: cases, error } = await supabaseClient
        .from('cases')
        .select('*')
        .eq('is_active', true)
        .order('price_ton', { ascending: true }); // Сортируем по цене

    if (error) {
        alert('cases.js: ОШИБКА при загрузке кейсов из Supabase: ' + error.message);
        casesListContainer.innerHTML = '<p style="color: red; text-align: center; width: 100%;">Ошибка загрузки кейсов: ' + error.message + '</p>';
        return;
    }

    if (cases.length === 0) {
        alert('cases.js: Активные кейсы не найдены в Supabase.');
        casesListContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Активные кейсы не найдены.</p>';
        return;
    }

    alert('cases.js: Кейсы успешно загружены. Количество: ' + cases.length);
    casesListContainer.innerHTML = ''; // Очищаем контейнер

    // Создаем карточку для каждого кейса
    cases.forEach(function(caseItem) {
        alert('cases.js: Создаем карточку для кейса: ' + caseItem.name);
        var card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-case-id', caseItem.id); 

        card.innerHTML = `
            <i class="icon fas fa-box-open"></i>
            <p class="text-label">${caseItem.name}</p>
            <p class="price">Open - ${caseItem.price_ton} TON</p>
        `;
        
        card.onclick = function() {
            openCase(caseItem);
        };

        casesListContainer.appendChild(card);
    });

    alert('cases.js: Все кейсы успешно отображены.');
}

// Функция, которая вызывается при клике на кейс
function openCase(caseData) {
    alert('cases.js: Вы кликнули на кейс: "' + caseData.name + '" за ' + caseData.price_ton + ' TON.');
    // Здесь будет логика:
    // 1. Проверка баланса пользователя
    // 2. Списание средств
    // 3. Запуск анимации рулетки
    // 4. Получение результата и добавление в инвентарь
}


// Запускаем отображение кейсов, когда страница загрузится
document.addEventListener('DOMContentLoaded', renderCases);
