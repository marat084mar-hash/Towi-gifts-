const db = window.supabase;

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.dynamicContentContainer) {
        console.error("Dynamic content container not found. Is global.js loaded correctly?");
        return;
    }

    const casesContainer = window.dynamicContentContainer;
    casesContainer.innerHTML = '<div class="loader"></div>'; // Показываем лоадер
                          try {
        const { data: cases, error } = await db.from('cases').select('*').order('price_ton', { ascending: true });

        if (error) {
            console.error('Ошибка при загрузке кейсов:', error.message);
            casesContainer.innerHTML = <p class="hint-text" style="color: red;">Не удалось загрузить кейсы: ${error.message}</p>;
            return;
        }

        casesContainer.innerHTML = ''; // Очищаем лоадер

        if (cases && cases.length > 0) {
            cases.forEach(caseItem => {
                const card = document.createElement('a'); // Используем <a> для клика
                card.href = case-opening.html?id=${caseItem.id}; // Ссылка на страницу открытия
                card.className = 'case-card';
                card.innerHTML = 
                    <img src="${caseItem.image_url}" alt="${caseItem.name}">
                    <div class="case-name">${caseItem.name}</div>
                    <div class="case-price">${caseItem.price_ton} TON</div>
                ;
                casesContainer.appendChild(card);
            });
        } else {
            casesContainer.innerHTML = <p class="hint-text">Пока нет доступных кейсов. Скоро появятся новые!</p>;
        }
    } catch (e) {
        console.error('Непредвиденная ошибка при загрузке кейсов:', e.message);
        casesContainer.innerHTML = <p class="hint-text" style="color: red;">Ошибка: ${e.message}</p>;
    }
});

// Если вам нужна отдельная функция для открытия кейса, а не просто ссылка
window.openCasePage = (caseId) => {
    window.location.href = case-opening.html?id=${caseId};
};
