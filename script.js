``javascript
// ===== Замените эти значения на свои из панели Supabase -> Project Settings -> API =====
const SUPABASE_URL = 'https://kkgjkqiwrppaszvkeqbe.supabase.co'; // Пример: 'https://abcdefgh12345.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_DvZIWrBWQ30LyV7FueztDg_TlVTALrs'; // Пример: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
// ======================================================================================

// Инициализируем клиент Supabase (эта строка будет инициализирована после загрузки скрипта CDN)
let supabase;

// Получаем элементы DOM
const usernameDisplay = document.getElementById('username-display');
const tonBalanceDisplay = document.getElementById('ton-balance-display');
const appContent = document.getElementById('app-content');

// Кнопки навигации
const casesBtn = document.getElementById('cases-btn');
const inventoryBtn = document.getElementById('inventory-btn');
const crashBtn = document.getElementById('crash-btn');
const upgradeBtn = document.getElementById('upgrade-btn');

let currentUserId = null; // Будем хранить ID текущего пользователя

// --- Функции загрузки и отображения данных ---

async function loadUserData() {
    try {
        // Мы пока не делаем аутентификацию, поэтому для теста возьмем первого пользователя из базы
        // В реальном приложении здесь будет логика получения текущего залогиненного пользователя
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, site_ton_balance, first_name')
            .limit(1);

        if (error) {
            throw error;
        }

        if (users && users.length > 0) {
            const user = users[0];
            currentUserId = user.id; // Сохраняем ID пользователя
            usernameDisplay.textContent = @${user.username || user.first_name || 'Пользователь'};
            tonBalanceDisplay.textContent = Баланс: ${user.site_ton_balance.toFixed(2)} TON;
            // Переключаемся на страницу кейсов по умолчанию
            showCasesPage();
        } else {
            appContent.innerHTML = <h1>Добро пожаловать!</h1><p>Пользователь не найден. Пожалуйста, добавьте тестового пользователя в базе данных Supabase.</p>;
            usernameDisplay.textContent = @Гость;
            tonBalanceDisplay.textContent = Баланс: 0.00 TON;
        }

    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error.message);
        appContent.innerHTML = <h1>Ошибка!</h1><p>Не удалось загрузить данные пользователя: ${error.message}</p>;
        usernameDisplay.textContent = @Ошибка;
        tonBalanceDisplay.textContent = Баланс: --- TON`;
    }
}

// --- Функции для страниц ---

async function showCasesPage() {
    appContent.innerHTML = '<h2>Загрузка кейсов...</h2>';
    try {
        const { data: lootboxes, error } = await supabase
            .from('lootboxes')
            .select('*')
            .eq('is_active', true); // Только активные кейсы

        if (error) {
            throw error;
        }

let html = '<h2>Кейсы</h2><div class="cases-grid">';
        if (lootboxes && lootboxes.length > 0) {
            lootboxes.forEach(box => {
                html += 
                    <div class="case-item">
                        <img src="${box.image_url || 'https://via.placeholder.com/100x100?text=Кейс'}" alt="${box.name}">
                        <h3>${box.name}</h3>
                        <p>${box.description || 'Описание отсутствует.'}</p>
                        <p>Цена: <span class="case-price">${box.price_ton.toFixed(2)} TON</span></p>
                        <button class="open-case-btn" data-id="${box.id}">Открыть</button>
                    </div>
                ;
            });
        } else {
            html += '<p>Кейсы пока недоступны.</p>';
        }
        html += '</div>';
        appContent.innerHTML = html;

        // Добавляем обработчики для кнопок "Открыть"
        document.querySelectorAll('.open-case-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const caseId = event.target.dataset.id;
                // alert(Вы нажали открыть кейс с ID: ${caseId});
                openLootbox(caseId); // Вызываем функцию открытия кейса
            });
        });

    } catch (error) {
        console.error('Ошибка загрузки кейсов:', error.message);
        appContent.innerHTML = <h2>Ошибка!</h2><p>Не удалось загрузить кейсы: ${error.message}</p>;
    }
}

function showInventoryPage() {
    appContent.innerHTML = <h2>Инвентарь</h2><p>Здесь будет показан ваш инвентарь.</p>;
    // TODO: реализовать загрузку инвентаря
}

function showCrashPage() {
    appContent.innerHTML = <h2>Ракета</h2><p>Здесь будет игра "Краш".</p>;
    // TODO: реализовать игру "Краш"
}

function showUpgradePage() {
    appContent.innerHTML = <h2>Апгрейд</h2><p>Здесь будут доступны апгрейды.</p>;
    // TODO: реализовать апгрейды
}


// --- Логика открытия кейса (будет доработана) ---
async function openLootbox(caseId) {
    if (!currentUserId) {
        alert('Пользователь не авторизован.');
        return;
    }
    alert(Открытие кейса с ID: ${caseId} для пользователя: ${currentUserId});
    // Здесь будет гораздо более сложная логика:
    // 1. Проверка баланса пользователя
    // 2. Списание TON
    // 3. Выбор случайного предмета на основе шансов из lootbox_contents
    // 4. Добавление предмета в user_gifts
    // 5. Запись транзакции
    // 6. Обновление UI
}


// --- Инициализация приложения ---
document.addEventListener('DOMContentLoaded', () => {
    // Вставляем скрипт Supabase CDN динамически
    const supabaseScript = document.createElement('script');
    supabaseScript.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    supabaseScript.onload = () => {
        // После загрузки библиотеки Supabase, инициализируем клиент
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        loadUserData(); // Загружаем данные пользователя и показываем страницу кейсов
    };
    document.head.appendChild(supabaseScript);

    // Обработчики кнопок навигации
    casesBtn.addEventListener('click', showCasesPage);
    inventoryBtn.addEventListener('click', showInventoryPage);
    crashBtn.addEventListener('click', showCrashPage);
    upgradeBtn.addEventListener('click', showUpgradePage);
});
