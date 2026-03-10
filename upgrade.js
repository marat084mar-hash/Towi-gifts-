javascript
// --- ОБЩИЙ КОД ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // <-- ВАШ URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // <-- ВАШ ANON KEY
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userId = localStorage.getItem('ton_cases_user_id');
if (!userId) { window.location.href = 'cases.html'; }

let currentUserBalance = 0;

function updateBalanceDisplay(balance) {
    document.querySelectorAll('#balance-display').forEach(el => {
        el.textContent = parseFloat(balance).toFixed(2);
    });
}

async function getUserProfile() {
    const { data, error } = await supabase.from('profiles').select('balance').eq('id', userId).single();
    if (error) { console.error('Ошибка получения профиля:', error); return null; }
    currentUserBalance = data.balance;
    updateBalanceDisplay(currentUserBalance);
    return data;
}
 // --- КОД СПЕЦИФИЧНЫЙ ДЛЯ upgrade.js ---
let currentItem = null;

document.addEventListener('DOMContentLoaded', () => {
    getUserProfile();
    loadItemForUpgrade();
    document.getElementById('chance-slider').addEventListener('input', calculateTargetPrice);
    document.getElementById('upgrade-button').addEventListener('click', performUpgrade);
});

function loadItemForUpgrade() {
    const itemJson = localStorage.getItem('item_for_upgrade');
    if (!itemJson) {
        document.getElementById('upgrade-button').disabled = true;
        drawWheel(50);
        return;
    }
    currentItem = JSON.parse(itemJson);
    document.getElementById('current-item-name').textContent = currentItem.name;
    document.getElementById('current-item-price').textContent = currentItem.price;
    document.getElementById('upgrade-button').disabled = false;
    calculateTargetPrice();
}

function calculateTargetPrice() {
    if (!currentItem) return;
    const chance = parseInt(document.getElementById('chance-slider').value);
    document.getElementById('chance-display').textContent = ${chance}%;
    const targetPrice = (currentItem.price * 100) / chance * 0.9;
    document.getElementById('target-item-name').textContent = Предмет x${(targetPrice / currentItem.price).toFixed(1)};
    document.getElementById('target-item-price').textContent = targetPrice.toFixed(2);
    drawWheel(chance);
}

function drawWheel(chance) {
    const wheel = document.getElementById('upgrade-wheel');
    wheel.style.background = conic-gradient(#533483 0% ${chance}%, #1a1a2e ${chance}% 100%);
}

async function performUpgrade() {
    if (!currentItem) return;
    const upgradeButton = document.getElementById('upgrade-button');
    const slider = document.getElementById('chance-slider');
    upgradeButton.disabled = true;
    slider.disabled = true;

    const chance = parseInt(slider.value);
    const resultDiv = document.getElementById('upgrade-result');
    const wheel = document.getElementById('upgrade-wheel');
    resultDiv.textContent = '';
    resultDiv.className = 'result-message';
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';

    const isSuccess = (Math.random() * 100) < chance;
    const fullRotations = 5 * 360;
    let targetAngle = isSuccess ?
        5 + Math.random() * (chance * 3.6 - 10) :
        (chance * 3.6 + 5) + Math.random() * (350 - chance * 3.6);
    const finalRotation = fullRotations + targetAngle;

    setTimeout(() => {
        wheel.style.transition = 'transform 6s cubic-bezier(0.2, 0.8, 0.2, 1)';
        wheel.style.transform = rotate(${finalRotation}deg);
    }, 100);

    setTimeout(() => {
        if (isSuccess) {
            const targetPrice = parseFloat(document.getElementById('target-item-price').textContent);
            const newItem = {
                ...currentItem,
                name: Улучшенный (${currentItem.name}),
                price: targetPrice
            };
            localStorage.setItem('item_for_upgrade', JSON.stringify(newItem));
            resultDiv.textContent = УСПЕХ! Вы получили ${newItem.name}!;
            resultDiv.classList.add('success');
            loadItemForUpgrade();
        } else {
            localStorage.removeItem('item_for_upgrade');
            resultDiv.textContent = 'ПРОВАЛ! Вы потеряли предмет.';
            resultDiv.classList.add('failure');
            document.getElementById('current-item-name').textContent = 'Нет предмета';
            document.getElementById('current-item-price').textContent = '0';
        }
        upgradeButton.disabled = false;
        slider.disabled = false;
    }, 6500);
}
