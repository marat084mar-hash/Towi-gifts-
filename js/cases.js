// js/cases.js - С отладочными сообщениями для мобильных устройств

// Выводим alert, как только скрипт загрузится и начнет выполняться


// Функция для отображения кейсов на странице
async function renderCases() {
    

    var casesListContainer = document.getElementById('casesListContainer');
    if (!casesListContainer) {
        
        // Для визуальной отладки:
        document.body.innerHTML += '<div style="color:red; background:white; padding:10px;">ОШИБКА: casesListContainer не найден!</div>';
        return;
    }
    casesListContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Загрузка кейсов...</p>';


    // Запрос к Supabase для получения всех активных кейсов
    
    var { data: cases, error } = await supabaseClient
        .from('cases')
        .select('*')
        .eq('is_active', true)
        .order('price_ton', { ascending: true }); // Сортируем по цене

    if (error) {
       
        casesListContainer.innerHTML = '<p style="color: red; text-align: center; width: 100%;">Ошибка загрузки кейсов: ' + error.message + '</p>';
        return;
    }

    if (cases.length === 0) {
       
        casesListContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Активные кейсы не найдены.</p>';
        return;
    }

    
    casesListContainer.innerHTML = ''; // Очищаем контейнер

    // Создаем карточку для каждого кейса
    cases.forEach(function(caseItem) {
        
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

    
}

// Функция, которая вызывается при клике на кейс
function openCase(caseData) {
    // Здесь будет логика:
    // 1. Проверка баланса пользователя
    // 2. Списание средств
    // 3. Запуск анимации рулетки
    // 4. Получение результата и добавление в инвентарь
}


// Запускаем отображение кейсов, когда страница загрузится
document.addEventListener('DOMContentLoaded', renderCases);
