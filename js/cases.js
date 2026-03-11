// Функция для отображения кейсов на странице
async function renderCases() {
    console.log("Загрузка кейсов из Supabase...");
    const casesListContainer = document.getElementById('casesListContainer');
    if (!casesListContainer) {
        console.error("Не найден контейнер для кейсов (casesListContainer).");
        return;
    }

    // Запрос к Supabase для получения всех активных кейсов
    const { data: cases, error } = await supabaseClient
        .from('cases')
        .select('*')
        .eq('is_active', true)
        .order('price_ton', { ascending: true }); // Сортируем по цене

    if (error) {
        console.error("Ошибка при загрузке кейсов:", error);
        casesListContainer.innerHTML = '<p style="color: var(--text-muted);">Не удалось загрузить кейсы.</p>';
        return;
    }

    if (cases.length === 0) {
        console.log("Активные кейсы не найдены.");
        // Сообщение о пустых кейсах уже есть в HTML, так что ничего не делаем
        return;
    }

    // Очищаем контейнер от сообщения "No cases added yet"
    casesListContainer.innerHTML = '';

    // Создаем карточку для каждого кейса
    cases.forEach(caseItem => {
        const card = document.createElement('div');
        card.className = 'card';
        // Добавляем атрибут data-case-id, чтобы знать, какой кейс открывать
        card.setAttribute('data-case-id', caseItem.id);
      card.innerHTML = 
            <i class="icon fas fa-box-open"></i> <!-- Общая иконка для всех кейсов -->
            <p class="text-label">${caseItem.name}</p>
            <p class="price">Open - ${caseItem.price_ton} TON</p>
        ;
        
        // Добавляем обработчик клика на карточку
        card.onclick = function() {
            openCase(caseItem);
        };

        casesListContainer.appendChild(card);
    });

    console.log("Кейсы успешно загружены и отображены.", cases);
}

// Функция, которая вызывается при клике на кейс (пока заглушка)
function openCase(caseData) {
    console.log("Попытка открыть кейс:", caseData);
    alert(Вы собираетесь открыть "${caseData.name}" за ${caseData.price_ton} TON. Реализация анимации и списания будет следующим шагом.);
    // Здесь будет логика:
    // 1. Проверка баланса пользователя
    // 2. Списание средств
    // 3. Запуск анимации рулетки
    // 4. Получение результата и добавление в инвентарь
}


// Запускаем отображение кейсов, когда страница загрузится
document.addEventListener('DOMContentLoaded', renderCases);
