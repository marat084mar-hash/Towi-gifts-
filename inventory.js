// Временно, до интеграции с Supabase
let userInventory = [
    { id: 'nft1', name: 'Common NFT Gift #1', imageUrl: 'path/to/img1.png', price: 10, canWithdraw: true, source: 'case' },
    { id: 'nft2', name: 'Rare NFT Gift #2', imageUrl: 'path/to/img2.png', price: 50, canWithdraw: true, source: 'upgrade' },
    { id: 'nft3', name: 'Legendary NFT Gift #3', imageUrl: 'path/to/img3.png', price: 200, canWithdraw: false, source: 'case' },
];

// Предположим, что user из main.js доступен или его данные загружаются тут
// В реальном приложении, данные пользователя будут загружаться через API
let user = {
    nftCooldownEndTime: null // Время окончания КД для вывода NFT
};

// Функция для отображения инвентаря
function renderInventory() {
    const inventoryGrid = document.getElementById('inventory-items-grid');
    inventoryGrid.innerHTML = ''; // Очищаем текущий инвентарь

    if (userInventory.length === 0) {
        document.getElementById('emptyInventoryMessage').style.display = 'block';
        return;
    } else {
        document.getElementById('emptyInventoryMessage').style.display = 'none';
    }

    userInventory.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card inventory-item';
        card.innerHTML = 
            <i class="icon fas fa-gift"></i>
            <p class="text-label">${item.name}</p>
            <div class="inventory-item-actions">
                <button class="btn btn-secondary btn-small" onclick="sellItem('${item.id}')">
                    <i class="fas fa-tag"></i> Продать (${item.price} TON)
                </button>
                <button class="btn btn-small ${item.canWithdraw ? '' : 'btn-disabled'}" 
                        onclick="withdrawItem('${item.id}')" ${item.canWithdraw ? '' : 'disabled'}>
                    <i class="fas fa-arrow-right-from-bracket"></i> Вывести
                </button>
            </div>
        ;
        inventoryGrid.appendChild(card);
    });
    checkCooldown();
}

// Функция для продажи предмета (логика на бэкенде)
function sellItem(itemId) {
    alert(Продажа предмета ${itemId} будет реализована через Supabase!);
    // Здесь будет вызов API для продажи
    // После успешной продажи: удалить из userInventory и перерисовать инвентарь
    userInventory = userInventory.filter(item => item.id !== itemId);
    renderInventory();
    // Обновить баланс пользователя
}

// Функция для вывода предмета (логика на бэкенде, с проверкой КД)
function withdrawItem(itemId) {
    if (user.nftCooldownEndTime && new Date() < new Date(user.nftCooldownEndTime)) {
        alert('Вы не можете вывести NFT. Активен cooldown после пополнения звездами.');
        return;
    }
    
    alert(Вывод предмета ${itemId} будет реализован через Supabase!);
    // Здесь будет вызов API для вывода
    // После успешного вывода: удалить из userInventory и перерисовать инвентарь
    userInventory = userInventory.filter(item => item.id !== itemId);
    renderInventory();
}

// Проверка и отображение КД для вывода NFT
function checkCooldown() {
    const cooldownMessage = document.getElementById('cooldownMessage');
    const cooldownTimeSpan = document.getElementById('cooldownTime');

    if (user.nftCooldownEndTime) {
        const endTime = new Date(user.nftCooldownEndTime);
        const now = new Date();
        if (now < endTime) {
            cooldownMessage.style.display = 'block';
            const interval = setInterval(() => {
                const remaining = endTime.getTime() - new Date().getTime();
                if (remaining <= 0) {
                    clearInterval(interval);
                    cooldownMessage.style.display = 'none';
                    user.nftCooldownEndTime = null;
                    renderInventory(); // Возможно, некоторые NFT станут доступны для вывода
                } else {
                    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                    cooldownTimeSpan.innerText = ${minutes}m ${seconds}s;
                }
            }, 1000);
        } else {
            cooldownMessage.style.display = 'none';
            user.nftCooldownEndTime = null;
        }
    } else {
        cooldownMessage.style.display = 'none';
    }
}


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // В реальном приложении: загрузить инвентарь пользователя с Supabase
    // и установить user.nftCooldownEndTime
    // Для демонстрации: используем временные данные
    
    // Предполагаем, что main.js уже мог установить cooldown
    // Если main.js и inventory.js работают в разных контекстах,
    // данные user должны передаваться или загружаться.
    // Для этого примера, допустим, что user.nftCooldownEndTime установлено из main.js
    // Если нет, то можно загрузить с Supabase при загрузке inventory.js.

    renderInventory();
});
