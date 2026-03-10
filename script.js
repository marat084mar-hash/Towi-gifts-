// Минимальная логика + Supabase интеграция для GitHub Pages.
// Замените на реальные значения Supabase и настройте переменные.

 // Замените на реальные параметры Supabase
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";

let supabase = null;
let currentAddress = null; // адрес кошелька пользователя
let currentUser = null; // запись в таблице users

document.addEventListener("DOMContentLoaded", async () => {
  // Инициализация Supabase
  if (typeof Supabase === "undefined" && typeof window !== "undefined") {
    // глобальный объект Supabase, если загружен через CDN
  }
  // Создать клиент Supabase
  supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Навигация: плавный скролл и активный пункт
  document.querySelectorAll(".nav-item").forEach(el => {
    el.addEventListener("click", (e) => {
      const id = el.getAttribute("href").replace("#", "");
      document.getElementById(id).scrollIntoView({ behavior: "smooth" });
      setActiveNav(el);
      e.preventDefault();
    });
  });

  // Меню на мобилке
  const navToggle = document.getElementById("nav-toggle");
  const navInner = document.querySelector(".nav-inner");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const links = navInner.querySelectorAll(".nav-item");
      navInner.style.display = navInner.style.display === "flex" ? "none" : "flex";
      // простая индикация
      links.forEach((l) => l.style.display = "inline-block");
    });
  }

  // Подключение кошелька
  document.getElementById("connect-wallet").addEventListener("click", async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        currentAddress = await signer.getAddress();
        document.getElementById("user-address").textContent = currentAddress;
        await ensureUser();
        await loadProfileUI();
        await loadBalanceUI();
      } catch (e) {
        console.error(e);
        alert("Не удалось подключить кошелек");
      }
    } else {
      alert("Установите MetaMask или другой Ethereum-кошелек");
    }
  });

  // Пополнение баланса
  document.getElementById("topup-btn").addEventListener("click", async () => {
    const amount = Number(document.getElementById("topup-amount").value || "0");
    if (!currentAddress || amount <= 0) {
      alert("Подключите кошелек и введите сумму");
      return;
    }
    const newBal = (Number(currentUser?.balance || 0)) + amount;
    const { data, error } = await supabase.from("users").update({ balance: newBal }).eq("id", currentAddress).single();
    if (error) {
      console.error(error);
      alert("Не удалось пополнить баланс");
    } else {
      currentUser = data;
      loadBalanceUI();
      addDemoTopup(amount);
    }
  });

  // Сохранение профиля
  document.getElementById("save-profile").addEventListener("click", async () => {
    if (!currentUser) return;
    const tg = document.getElementById("tg-username").value.trim();
    const avatar = document.getElementById("avatar-url").value.trim();
    const { data, error } = await supabase.from("users").update({ telegram_username: tg, avatar_url: avatar }).eq("id", currentAddress).single();
    if (error) {
      console.error(error);
    } else {
      currentUser = data;
      loadProfileUI();
    }
  });

  // Демонстрационная загрузка демо-данных
  document.getElementById("load-demo").addEventListener("click", () => {
    addDemoTopup(10);
  });

  // Загрузка initial data
  if (window.ethereum && !currentAddress) {
    window.ethereum.request({ method: "eth_accounts" }).then(async (accounts) => {
      if (accounts && accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        currentAddress = await signer.getAddress();
        document.getElementById("user-address").textContent = currentAddress;
        await ensureUser();
        await loadProfileUI();
        await loadBalanceUI();
      }
    });
  }

  // Прокрутка выделенного раздела
  const sections = ["home","cases","upgrade","rocket","topup","profile"];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const id = e.target.id;
      const link = document.querySelector(`.nav-item[data-section="${id}"]`);
      if (e.isIntersecting) {
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        if (link) link.classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -40% 0px", threshold: 0.01 });
  sections.forEach(sec => {
    const el = document.getElementById(sec);
    if (el) observer.observe(el);
  });

  // Генерация кейсов при загрузке
  loadCases();
});

// Навигация по секциям
function setActiveNav(el) {
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  el.classList.add("active");
}
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

// Supabase: создание/получение пользователя
async function ensureUser() {
  if (!currentAddress) return;
  const { data, error } = await supabase.from("users").select("*").eq("id", currentAddress).single();
  if (error || !data) {
    const { data: created, error: err } = await supabase.from("users").insert([
      { id: currentAddress, telegram_username: "", avatar_url: "", balance: 0 }
    ]).single();
    currentUser = created;
  } else {
    currentUser = data;
  }
}

// UI: загрузка профиля
async function loadProfileUI() {
  if (!currentUser) return;
  document.getElementById("avatar").src = currentUser.avatar_url || "https://via.placeholder.com/120";
  document.getElementById("tg-username").value = currentUser.telegram_username || "";
  document.getElementById("avatar-url").value = currentUser.avatar_url || "";
  document.getElementById("profile-telegram").textContent = currentUser.telegram_username || "@none";
  document.getElementById("user-address").textContent = currentAddress || "не подключено";
}

// UI: загрузка баланса
async function loadBalanceUI() {
  if (!currentUser) return;
  document.getElementById("user-balance").textContent = `Баланс: ${Number(currentUser.balance || 0)}`;
  document.getElementById("profile-balance").textContent = Number(currentUser.balance || 0);
}

// Демонстрация пополнения баланса в истории
function addDemoTopup(amount) {
  const container = document.getElementById("topup-history");
  const div = document.createElement("div");
  div.textContent = `Пополнение на ${amount} • адрес: ${currentAddress || "не подключено"}`;
  container.prepend(div);
}

// Кейсы (случайные примеры)
function loadCases() {
  const grid = document.getElementById("cases-grid");
  grid.innerHTML = "";
  const samples = [
    { id: 1, title: "Подарок для ветерана киберспорта", token: "0xNFT1", tokenId: 101, status: "Выдан" },
    { id: 2, title: "Коллекционная карта сезона 5", token: "0xNFT2", tokenId: 202, status: "В очереди" },
    { id: 3, title: "NFT-аватарка профиля", token: "0xNFT3", tokenId: 303, status: "Резерв" }
  ];
  samples.forEach(s => {
    const card = document.createElement("div");
    card.className = "panel";
    card.innerHTML = `
      <div><strong>${s.title}</strong></div>
      <div>NFT: ${s.token} #${s.tokenId}</div>
      <div>Статус: ${s.status}</div>
      <button class="btn" onclick="alert('Подробнее о ${s.title} (демо)')">Подробнее</button>
    `;
    grid.appendChild(card);
  });
}

// Апгрейд: простой вывод сообщения
function setUpgrade(kind) {
  alert(`Установить апгрейд: ${kind} (демо)`);
}
function showNote() {
  alert("Рекомендация: используйте nonce, expiry и мульти-подпись для безопасности.");
}

// Ракета: простой прогресс-бар
function launchRocket() {
  const rocketbar = document.getElementById("rocket-bar");
  let w = 0;
  const id = setInterval(() => {
    w += 6;
    if (w > 100) {
      w = 100;
      clearInterval(id);
    }
    rocketbar.style.width = w + "%";
  }, 100);
}
