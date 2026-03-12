// --- Глобальные переменные и константы ---
const casesContainer = document.getElementById('cases-container');
let allCases = []; // Массив для хранения всех загруженных кейсов

// --- Функции ---

/**
 * Рендерит (отображает) карточки кейсов на странице
 * @param {Array} casesArray - Массив объектов кейсов для отображения
 */
function renderCases(casesArray) {
    // Проверка, что контейнер для кейсов существует на странице
    if (!casesContainer) {
        console.error('Fatal Error: Element with id "cases-container" not found!');
        return;
    }

    casesContainer.innerHTML = ''; // Очищаем контейнер перед новым рендерингом

    // Если массив кейсов пуст, показываем сообщение пользователю
    if (!casesArray || casesArray.length === 0) {
        casesContainer.innerHTML = '<p>Кейсы не найдены. Попробуйте обновить страницу позже.</p>';
        return;
    }
    // Создаем и добавляем HTML-элемент для каждого кейса
    casesArray.forEach(caseItem => {
        const caseElement = document.createElement('div');
        caseElement.className = 'case'; // Присваиваем класс для стилизации
        
        // Используем innerHTML для создания структуры карточки.
        // Это более читаемо, чем создавать каждый элемент отдельно.
        caseElement.innerHTML = 
            <img src="${caseItem.image_url}" alt="Image for ${caseItem.name}">
            <h3>${caseItem.name}</h3>
            <p>Цена: ${caseItem.price} $TOWI</p>
        ;
        
        // Добавляем обработчик клика для открытия кейса (логику добавим позже)
        caseElement.addEventListener('click', () => {
            console.log(Clicked on case: ${caseItem.name});
            // Здесь будет логика открытия кейса, например, вызов модального окна
            alert(Вы открываете кейс: ${caseItem.name});
        });

        casesContainer.appendChild(caseElement);
    });
}

/
 * Главная асинхронная функция для инициализации приложения
 */
async function initializeApp() {
    console.log('App initialization started.');
    try {
        // Ждём, пока fetchCasesFromDB() завершится и вернёт данные
        allCases = await fetchCasesFromDB(); 
        
        // После успешной загрузки данных, вызываем функцию рендеринга
        renderCases(allCases);
        
    } catch (error) {
        console.error('Failed to initialize the app:', error);
        // Показываем ошибку пользователю прямо на странице
        if (casesContainer) {
            casesContainer.innerHTML = <p style="color: red; font-weight: bold;">Не удалось загрузить кейсы. Пожалуйста, проверьте консоль (F12) для технических деталей и попробуйте обновить страницу.</p>;
        }
    }
}

// --- Точка входа ---

// Используем событие DOMContentLoaded. Это стандарт для запуска JS-кода,
// который работает с элементами страницы. Он гарантирует, что весь HTML уже загружен.
document.addEventListener('DOMContentLoaded', initializeApp);
