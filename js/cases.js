// Функция для открытия мультикейсов (логика будет на бэкенде)
async function openMultiCases() {
    const quantity = parseInt(document.getElementById('casesQuantity').value);
    if (isNaN(quantity) || quantity <= 0) {
        alert('Пожалуйста, введите корректное количество кейсов.');
        return;
    }

    alert(Открытие ${quantity} кейсов... (Логика через Supabase));

    // Здесь будет вызов API Supabase для открытия кейсов
    // Например: const result = await fetch('/api/open_cases', { method: 'POST', body: JSON.stringify({ quantity }) });
    // const data = await result.json();

    // Имитация результатов
    const winningsList = document.getElementById('winningsList');
    winningsList.innerHTML = ''; // Очищаем предыдущие результаты
    document.getElementById('caseResults').style.display = 'block';
    if (quantity > 0) {
        for (let i = 0; i < quantity; i++) {
            const li = document.createElement('li');
            li.style.marginBottom = '8px';
            li.style.color = 'var(--text-light)';
            const random = Math.random();
            let giftName = "Common NFT Gift";
            if (random > 0.8) giftName = "Rare NFT Gift";
            if (random > 0.95) giftName = "Legendary NFT Gift";

            li.innerHTML = <i class="fas fa-gift" style="color: var(--primary-purple); margin-right: 10px;"></i> ${giftName};
            winningsList.appendChild(li);
        }
    } else {
        winningsList.innerHTML = <li><p style="color: var(--text-muted);">No items won this time.</p></li>;
    }

    // После открытия: обновить инвентарь пользователя (UI и на бэкенде)
    // Например, вызвать функцию из main.js или перезагрузить данные
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Скрыть результаты при загрузке
    document.getElementById('caseResults').style.display = 'none';
});
