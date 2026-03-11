let currentRotation = 0; // Для отслеживания текущего поворота колеса
let currentChance = 0; // Шанс успеха, будет приходить с бэкенда

// Функция для обновления визуального отображения шанса
function updateSuccessChance(chance) {
    currentChance = chance;
    document.getElementById('successChance').innerText = ${chance}%;

    // Обновление градиента колеса в зависимости от шанса
    const wheel = document.getElementById('upgradeWheel');
    // Шанс 75% -> 75% фиолетового, 25% черного
    // Шанс X% -> X% фиолетового, (100-X)% черного
    wheel.style.background = conic-gradient(
        var(--primary-purple) 0% ${chance}%,
        var(--bg-dark) ${chance}% 100%
    );
}

// Функция для запуска апгрейда
async function startUpgrade() {
    alert('Начинаем апгрейд! (Логика через Supabase)');
    // Здесь будет логика:
    // 1. Выбор гифта для апгрейда (сейчас это заглушка)
    // 2. Вызов API Supabase для получения результата апгрейда
    // 3. Анимация колеса
    // 4. Отображение результата

    // Имитация запроса к бэкенду
    const result = await new Promise(resolve => setTimeout(() => {
        const success = Math.random() * 100 < currentChance; // Имитация успеха на основе текущего шанса
        resolve({ success: success, newItem: success ? 'Upgraded Rare NFT' : null });
    }, 1000)); // Имитация задержки бэкенда

    // Расчет угла поворота
    const wheel = document.getElementById('upgradeWheel');
    const fullRotations = 5; // 5 полных оборотов для эффекта
    let finalDegree;

    if (result.success) {
        // Остановиться в фиолетовой зоне (например, от 0 до currentChance)
        // Чтобы выглядело красиво, остановим в середине сектора успеха
        finalDegree = (currentChance / 2) + Math.random() * (currentChance / 2);
    } else {
        // Остановиться в черной зоне (от currentChance до 100)
        finalDegree = currentChance + (100 - currentChance) / 2 + Math.random() * ((100 - currentChance) / 2);
    }
    
    // Преобразуем процент в градусы для CSS
    finalDegree = (finalDegree / 100) * 360;

    // Добавляем полный оборот к текущему повороту
    currentRotation += (fullRotations * 360) + finalDegree; // Дополнительный поворот, чтобы не всегда начинать с нуля

    wheel.style.transform = rotate(${currentRotation}deg);

    // Ждем окончания анимации, затем показываем результат
    setTimeout(() => {
        if (result.success) {
            alert(Успех! Вы получили: ${result.newItem});
            // Обновить инвентарь пользователя
        } else {
            alert('Неудача! Ваш гифт сгорел.');
            // Обновить инвентарь пользователя
        }
    }, 4000); // Должно соответствовать длительности CSS transition (4s)
}
// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Временно устанавливаем шанс для демонстрации
    updateSuccessChance(75); // Например, 75%
    // В реальной ситуации шанс будет загружаться с бэкенда после выбора гифта
});
