class StoreManager {
  constructor() {
    this.storePopup = document.getElementById("storePopup");
    this.storeBtn = document.getElementById("storeBtn");
    this.closeStorePopup = document.getElementById("closeStorePopup");
    this.storeGrid = document.getElementById("storeGrid");
    this.storeBalance = document.getElementById("storeBalance");

    this.isClosing = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateBalance();
    // Предзагружаем данные магазина
    this.preloadStoreData();
  }

  setupEventListeners() {
    // Открытие/закрытие popup магазина
    this.storeBtn.addEventListener("click", () => this.openStorePopup());
    this.closeStorePopup.addEventListener("click", () =>
      this.closeStorePopupWindow(),
    );

    // Закрытие по клику вне popup
    this.storePopup.addEventListener("click", (e) => {
      if (e.target === this.storePopup && !this.isClosing) {
        this.closeStorePopupWindow();
      }
    });

    // Закрытие по ESC
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.storePopup.classList.contains("active") &&
        !this.isClosing
      ) {
        this.closeStorePopupWindow();
      }
    });
  }

  openStorePopup() {
    if (this.isClosing) return;

    this.storePopup.classList.add("active");
    document.body.style.overflow = "hidden";
    this.updateBalance();
    this.loadStoreItems();
  }

  closeStorePopupWindow() {
    if (this.isClosing) return;

    this.isClosing = true;
    this.storePopup.classList.add("popup-closing");

    setTimeout(() => {
      this.storePopup.classList.remove("active", "popup-closing");
      document.body.style.overflow = "";
      this.isClosing = false;
    }, 400);
  }

  loadStoreItems() {
    if (!this.storeGrid) return;

    this.storeGrid.innerHTML = "";

    // Проверяем существует ли storeItems
    if (typeof storeItems === "undefined" || !storeItems) {
      console.error("storeItems is not defined");
      this.showNotification("Ошибка загрузки магазина", "error");
      return;
    }

    storeItems.forEach((item) => {
      const isOwned = this.isSkinOwned(item.id);
      const canAfford = this.canAfford(item.price);

      const storeItem = document.createElement("div");
      storeItem.className = `store-item ${isOwned ? "owned" : ""}`;
      storeItem.innerHTML = `
                <div class="store-item-preview">
                    <img src="assets/images/${item.image}" alt="${item.name}" onerror="this.src='assets/images/p6.png'">
                </div>
                <div class="store-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="store-item-price">
                        <span class="price">${item.price}</span>
                    </div>
                    <button class="buy-btn ${isOwned ? "owned" : ""}"
                            data-id="${item.id}"
                            data-price="${item.price}"
                            ${isOwned ? "disabled" : !canAfford ? "disabled" : ""}>
                        ${isOwned ? "Куплен" : !canAfford ? "Недостаточно" : "Купить"}
                    </button>
                    ${!isOwned && !canAfford ? '<div class="insufficient-funds">Не хватает: ' + (item.price - this.getBalance()) + "</div>" : ""}
                </div>
            `;

      this.storeGrid.appendChild(storeItem);
    });

    // Добавляем обработчики для кнопок покупки
    this.addBuyButtonListeners();
  }

  addBuyButtonListeners() {
    const buyButtons = this.storeGrid.querySelectorAll(
      ".buy-btn:not(:disabled):not(.owned)",
    );

    buyButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const skinId = e.target.dataset.id;
        const price = parseInt(e.target.dataset.price);
        this.buySkin(skinId, price);
      });
    });
  }

  buySkin(skinId, price) {
    if (this.isSkinOwned(skinId)) {
      this.showNotification("Этот скин уже куплен!", "error");
      return;
    }

    if (!this.canAfford(price)) {
      this.showNotification("Недостаточно!", "error");
      return;
    }

    // Списываем стоимость
    this.deductBalance(price);

    // Добавляем скин в коллекцию
    this.addOwnedSkin(skinId);

    // Обновляем интерфейс
    this.updateBalance();
    this.loadStoreItems();

    // Показываем уведомление
    this.showNotification("Скин успешно куплен!", "success");

    // Обновляем список скинов
    if (window.skinsManager) {
      window.skinsManager.loadAvailableSkins();
    }
  }

  isSkinOwned(skinId) {
    const ownedSkins = JSON.parse(localStorage.getItem("ownedSkins") || "[]");
    return ownedSkins.includes(skinId);
  }

  addOwnedSkin(skinId) {
    const ownedSkins = JSON.parse(localStorage.getItem("ownedSkins") || "[]");
    if (!ownedSkins.includes(skinId)) {
      ownedSkins.push(skinId);
      localStorage.setItem("ownedSkins", JSON.stringify(ownedSkins));
    }
  }

  getBalance() {
    return parseInt(localStorage.getItem("clickCount") || "0");
  }

  updateBalance() {
    // Метод оставлен для внутреннего использования, но не вызывает обновление UI
    return this.getBalance();
  }

  canAfford(price) {
    return this.getBalance() >= price;
  }

  deductBalance(amount) {
    const currentBalance = this.getBalance();
    const newBalance = currentBalance - amount;
    localStorage.setItem("clickCount", newBalance.toString());

    // Обновляем счетчик в кликере
    if (clicker) {
      clicker.count = newBalance;
      clicker.updateDisplay();
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#4CAF50" : type === "error" ? "#F44336" : "#2196F3"};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-out forwards";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  preloadStoreData() {
    // Предзагружаем изображения скинов для магазина
    setTimeout(() => {
      if (typeof storeItems === "undefined" || !storeItems) return;

      storeItems.forEach((item) => {
        if (item.id !== "p6") {
          // Базовый скин уже загружен
          const img = new Image();
          img.src = `assets/images/${item.image}`;
        }
      });
    }, 2000);
  }
}

// Инициализация менеджера магазина
document.addEventListener("DOMContentLoaded", () => {
  window.storeManager = new StoreManager();
});
