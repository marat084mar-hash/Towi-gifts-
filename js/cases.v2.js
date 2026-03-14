import { supabase } from '../config/supabase.js';
import { updateBalanceInHeader, fetchUser } from './global.v2.js';

// ===================================================================
// ПЕРЕМЕННЫЕ ДЛЯ ХРАНЕНИЯ ЭЛЕМЕНТОВ DOM И СОСТОЯНИЯ
// ===================================================================
let casesContainer;
let caseNameElement;
let casePriceElement;
let rouletteItemsContainer;
let openCaseButton;
let backButton;
let caseView; // "Экран" с рулеткой
let mainCasesView; // "Экран" со списком всех кейсов

let isOpening = false; // Флаг, чтобы предотвратить двойное нажатие кнопки открытия

// ===================================================================
// ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ, ВЫЗЫВАЕМАЯ РОУТЕРОМ
// ===================================================================
export function initCasesPage() {
    console.log('Инициализация страницы кейсов...');
    
    // Находим все необходимые элементы DOM один раз
    // Это гораздо производительнее, чем искать их в каждой функции
    casesContainer = document.querySelector('.cases-grid');
    caseNameElement = document.getElementById('case-name-dynamic');
    casePriceElement = document.getElementById('case-price-dynamic');
    rouletteItemsContainer = document.querySelector('.roulette-items');
    openCaseButton = document.getElementById('open-case-button');
    backButton = document.getElementById('back-to-cases-list');
    caseView = document.getElementById('case-view'); // Контейнер с рулеткой
    mainCasesView = document.getElementById('main-cases-view'); // Контейнер со списком кейсов

    // Добавляем обработчики событий
    setupEventListeners();

    // Загружаем и отображаем список всех кейсов
    loadAndRenderCases();
}

// ===================================================================
// ЗАГРУЗКА И ОТОБРАЖЕНИЕ ДАННЫХ
// ===================================================================

/**
 * Загружает все доступные кейсы из базы данных и отображает их
 */
async function loadAndRenderCases() {
    try {
        const { data: cases, error } = await supabase
            .from('cases')
            .select('*');

        if (error) throw error;

        // Очищаем контейнер перед добавлением новых элементов
        casesContainer.innerHTML = ''; 

        cases.forEach(caseItem => {
            const caseCard = document.createElement('div');
            caseCard.className = 'case-card';
            // Сохраняем ID кейса прямо на элементе для легкого доступа
            caseCard.dataset.caseId = caseItem.id; 

            caseCard.innerHTML = 
                <img src="${caseItem.image_url}" alt="${caseItem.name}" class="case-image">
                <h3 class="case-name">${caseItem.name}</h3>
                <p class="case-price">${caseItem.price} TON</p>
            `;
            casesContainer.appendChild(caseCard);
        });
        } catch (error) {
        console.error('Ошибка при загрузке кейсов:', error.message);
        casesContainer.innerHTML = '<p>Не удалось загрузить кейсы. Попробуйте позже.</p>';
    }
}

/
 * Загружает информацию о конкретном кейсе и предметах в нем
 * @param {number} caseId - ID кейса
 */
async function loadCaseDetails(caseId) {
    try {
        const { data: caseData, error } = await supabase
            .from('cases')
            .select(
                *,
                case_items (
                    items ( id, name, rarity, image_url )
                )
            )
            .eq('id', caseId)
            .single();

        if (error) throw error;
        
        // Отображаем рулетку с предметами этого кейса
        renderRoulette(caseData);
        
        // Показываем экран с рулеткой и скрываем список кейсов
        mainCasesView.style.display = 'none';
        caseView.style.display = 'block';

    } catch (error) {
        console.error('Ошибка при загрузке деталей кейса:', error.message);
    }
}


/
 * Отображает рулетку и информацию о выбранном кейсе
 * @param {object} caseData - Полные данные о кейсе с предметами
 */
function renderRoulette(caseData) {
    caseNameElement.textContent = caseData.name;
    casePriceElement.textContent = ${caseData.price} TON;
    // Сохраняем ID и цену на кнопке для использования при открытии
    openCaseButton.dataset.caseId = caseData.id;
    openCaseButton.dataset.casePrice = caseData.price;

    const items = caseData.case_items.map(ci => ci.items);

    // Создаем длинную ленту предметов для анимации
    const rouletteContent = [];
    for (let i = 0; i < 10; i++) { // Генерируем 10 "копий" предметов для длинной прокрутки
        rouletteContent.push(...items.sort(() => Math.random() - 0.5));
    }

    rouletteItemsContainer.innerHTML = '';
    rouletteContent.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = roulette-item rarity-${item.rarity};
        itemElement.innerHTML = <img src="${item.image_url}" alt="${item.name}">;
        rouletteItemsContainer.appendChild(itemElement);
    });
}


// ===================================================================
// ЛОГИКА ОТКРЫТИЯ КЕЙСА
// ===================================================================

async function handleOpenCase() {
    if (isOpening) return; // Если кейс уже открывается, ничего не делаем

    isOpening = true;
    openCaseButton.disabled = true; // Блокируем кнопку
    openCaseButton.textContent = 'Открывается...';

    const caseId = openCaseButton.dataset.caseId;
    const casePrice = parseFloat(openCaseButton.dataset.casePrice);
    
    // --- ВАЖНО: Эта часть должна быть на сервере ---
    // Здесь мы вызываем серверную функцию, которая сделает все проверки и вернет результат
    try {
        // Вызов Edge Function 'open-case' на Supabase
        const { data: result, error } = await supabase.functions.invoke('open-case', {
            body: { caseId: caseId }
        });

        if (error) throw error; // Если сервер вернул ошибку (например, недостаточно средств)

        if (result.success) {
            // Если сервер сказал "успех", запускаем анимацию, зная какой предмет мы выиграли
            await startAnimation(result.wonItem);
            showWinningModal(result.wonItem);
        } else {
            // Если сервер сказал "неудача" (например, не хватает денег)
            alert(result.message); // Показываем сообщение об ошибке от сервера
        }

    } catch (error) {
        console.error('Ошибка при открытии кейса:', error.message);
        alert('Произошла ошибка. Попробуйте снова.');
    } finally {
        // Вне зависимости от результата, возвращаем кнопку в исходное состояние
        isOpening = false;
        openCaseButton.disabled = false;
        openCaseButton.textContent = Открыть за ${casePrice} TON;
        updateBalanceInHeader(); // Обновляем баланс в шапке
    }
}
/
 * Запускает анимацию прокрутки рулетки
 * @param {object} wonItem - Объект выигранного предмета
 */
function startAnimation(wonItem) {
    // Эта функция должна быть реализована для прокрутки рулетки
    // к выигранному предмету. Сейчас это просто заглушка.
    console.log('Запуск анимации для:', wonItem.name);
    
    // Здесь будет сложная логика расчета позиции и применения transform: translateX()
    // Для простоты пока используем задержку
    return new Promise(resolve => {
        rouletteItemsContainer.style.transition = 'transform 3s ease-out';
        rouletteItemsContainer.style.transform = translateX(-2000px); // Примерное значение

        // Ждем окончания анимации
        rouletteItemsContainer.addEventListener('transitionend', resolve, { once: true });
    });
}

/
 * Показывает модальное окно с выигранным предметом
 * @param {object} wonItem - Объект выигранного предмета
 */
function showWinningModal(wonItem) {
    // Здесь должен быть код для красивого модального окна
    alert(Поздравляем! Вы выиграли: ${wonItem.name});
}

// ===================================================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ===================================================================
function setupEventListeners() {
    // Используем делегирование событий для кликов по карточкам кейсов
    casesContainer.addEventListener('click', (event) => {
        const caseCard = event.target.closest('.case-card');
        if (caseCard) {
            const caseId = caseCard.dataset.caseId;
            loadCaseDetails(caseId);
        }
    });

    // Клик по кнопке "Открыть кейс"
    openCaseButton.addEventListener('click', handleOpenCase);

    // Клик по кнопке "Назад"
    backButton.addEventListener('click', () => {
        mainCasesView.style.display = 'block';
        caseView.style.display = 'none';
        
        // Сбрасываем рулетку
        rouletteItemsContainer.style.transition = 'none';
        rouletteItemsContainer.style.transform = 'translateX(0)';
    });
}
