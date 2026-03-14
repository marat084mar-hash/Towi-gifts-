const db = window.supabaseClient || window.supabase;

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('cases-container');
    if (!container) return;

    // Загружаем кейсы из таблицы 'cases'
    const { data: cases, error } = await db
        .from('cases')
        .select('*');

    if (error) {
        console.error("Ошибка загрузки кейсов:", error);
        return;
    }

    container.innerHTML = ''; // Очищаем лоадер

    cases.forEach(c => {
        const item = document.createElement('div');
        item.className = 'case-card';
        item.innerHTML = `
            <img src="${c.image_url}" alt="${c.name}">
            <div class="case-name">${c.name}</div>
            <div class="case-price">${c.price_ton} TON</div>
            <button class="open-btn" onclick="openCasePage('${c.id}')">Открыть</button>
        `;
        container.appendChild(item);
    });
});

function openCasePage(id) {
    // Переход на страницу открытия конкретного кейса
    window.location.href = `case-view.html?id=${id}`;
}
