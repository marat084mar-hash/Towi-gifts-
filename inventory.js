javascript
// --- ОБЩИЙ КОД ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // <-- ВАШ URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // <-- ВАШ ANON KEY
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let userId = localStorage.getItem('ton_cases_user_id');
if (!userId) { window.location.href = 'cases.html'; }

let currentUserBalance = 0;
let userProfile = null;

function updateBalanceDisplay(balance) {
    document.querySelectorAll('#balance-display').forEach(el => {
        el.textContent = parseFloat(balance).toFixed(2);
    });
}

async function getUserProfile() {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') { console.error('Ошибка получения профиля:', error); return null; }
    if (data) {
        userProfile = data;
        currentUserBalance = data.balance;
        updateBalanceDisplay(currentUserBalance);
    }
    return data;
}

// --- КОД СПЕЦИФИЧНЫЙ ДЛЯ inventory.js ---

document.addEventListener('DOMContentLoaded', async () => {
    await getUserProfile();
    await loadInventory();
});

async function loadInventory() {
    const container = document.getElementById('inventory-container');
    const loadingMessage = document.getElementById('loading-message');
    const { data: items, error } = await supabase.from('inventory_items').select('*').eq('user_id', userId).order('created_at', { ascending: false });

    if (error) { loadingMessage.textContent = 'Не удалось загрузить инвентарь.'; return; }
    if (items.length === 0) { loadingMessage.textContent = 'Ваш инвентарь пуст.'; return; }
    loadingMessage.style.display = 'none';
    container.innerHTML = '';

    const now = new Date();
    const cooldownUntil = userProfile?.withdrawal_cooldown_until ? new Date(userProfile.withdrawal_cooldown_until) : null;
    const isAccountOnCooldown = cooldownUntil && cooldownUntil > now;

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';

        let cooldownHTML = '';
        if (isAccountOnCooldown) {
            const timeLeft = Math.ceil((cooldownUntil - now) / (1000 * 60 * 60 * 24));
            cooldownHTML = <div class="cooldown-tag">Вывод через: ${timeLeft} д.</div>;
            itemElement.classList.add('on-cooldown');
        }
[11.03.2026 1:32] ChatGPT 4.5 & [🅼🅹] | DeepSeek | Gemini ⚡️: const isNFT = item.is_nft;
        let actionButtonsHTML = 
            <button class="sell-btn" data-item-id="${item.id}" data-price="${item.price}" ${isAccountOnCooldown ? 'disabled' : ''}>Продать</button>
            <button class="upgrade-btn" data-item='${JSON.stringify(item)}'>Улучшить</button>
        ;
        if (isNFT) {
            actionButtonsHTML = 
                <button class="withdraw-btn" data-item-name="${item.name}" data-item-link="${item.nft_link}" ${isAccountOnCooldown ? 'disabled' : ''}>Вывести</button>
                <button class="upgrade-btn" data-item='${JSON.stringify(item)}'>Улучшить</button>
            ;
        }

        itemElement.innerHTML = 
            ${cooldownHTML}
            <img src="${item.image_url || 'case.png'}" alt="${item.name}" style="height: 80px; margin-bottom: 10px; object-fit: contain;">
            <div class="item-name">${item.name}</div>
            <div class="item-price">Цена: ${item.price} TON</div>
            <div class="item-actions">${actionButtonsHTML}</div>
        ;
        container.appendChild(itemElement);
    });

    container.querySelectorAll('.sell-btn').forEach(b => b.addEventListener('click', sellItem));
    container.querySelectorAll('.upgrade-btn').forEach(b => b.addEventListener('click', goToUpgrade));
    container.querySelectorAll('.withdraw-btn').forEach(b => b.addEventListener('click', (e) => showWithdrawModal(e.target.dataset.itemName, e.target.dataset.itemLink)));
}

async function sellItem(event) {
    const button = event.target;
    const itemId = button.dataset.itemId;
    const price = parseFloat(button.dataset.price);

    if (confirm(Продать предмет за ${price} TON?)) {
        const { error: deleteError } = await supabase.from('inventory_items').delete().eq('id', itemId);
        if (deleteError) { alert('Ошибка при продаже.'); return; }

        const newBalance = currentUserBalance + price;
        const { error: updateError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', userId);
        if (updateError) { alert('Ошибка зачисления средств.'); return; }

        currentUserBalance = newBalance;
        updateBalanceDisplay(newBalance);
        button.closest('.inventory-item').remove();
        alert('Предмет продан!');
    }
}

function goToUpgrade(event) {
    const itemData = JSON.parse(event.target.dataset.item);
    localStorage.setItem('item_for_upgrade', JSON.stringify(itemData));
    window.location.href = 'upgrade.html';
}

const withdrawModal = document.getElementById('withdraw-modal');
const closeBtn = withdrawModal.querySelector('.close-button');
closeBtn.onclick = () => withdrawModal.style.display = 'none';
window.addEventListener('click', (event) => { if (event.target == withdrawModal) withdrawModal.style.display = 'none'; });

function showWithdrawModal(itemName, itemLink) {
    document.getElementById('user-id-display').textContent = userId;
    document.getElementById('item-to-withdraw-name').textContent = itemName;
    document.getElementById('item-to-withdraw-link').textContent = itemLink;
    withdrawModal.style.display = 'flex';
}
