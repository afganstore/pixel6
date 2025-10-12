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
      if (item.type === "skin") {
        this.createSkinItem(item);
      } else if (item.type === "upgrade") {
        this.createUpgradeItem(item);
      }
    });

    // Обновляем информацию о прокачке
    this.updateUpgradeInfo();

    // Добавляем обработчики для кнопок покупки
    this.addBuyButtonListeners();
  }

  createSkinItem(item) {
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
                            data-type="skin"
                            data-price="${item.price}"
                            ${isOwned ? "disabled" : !canAfford ? "disabled" : ""}>
                        ${isOwned ? "Куплен" : !canAfford ? "Недостаточно" : "Купить"}
                    </button>
                    ${!isOwned && !canAfford ? '<div class="insufficient-funds">Не хватает: ' + (item.price - this.getBalance()) + "</div>" : ""}
                </div>
            `;

    this.storeGrid.appendChild(storeItem);
  }

  createUpgradeItem(item) {
    const currentLevel = this.getUpgradeLevel(item.id);
    const nextLevel = currentLevel + 1;
    const currentPrice = this.calculateUpgradePrice(item.id, nextLevel);
    const canAfford = this.canAfford(currentPrice);
    const isMaxLevel = currentLevel >= item.maxLevel;

    // Рассчитываем текущий и максимальный бонус
    const currentBonus = currentLevel * item.multiplier;
    const maxBonus = item.maxLevel * item.multiplier;

    const storeItem = document.createElement("div");
    storeItem.className = `store-item upgrade-item ${isMaxLevel ? "max-level" : ""}`;
    storeItem.innerHTML = `
                <div class="store-item-preview">
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--accent-color); border-radius: 12px; color: white; font-size: 24px; font-weight: bold;">
                        +${item.multiplier}
                    </div>
                </div>
                <div class="store-item-info">
                    <h3>${item.name} (Ур. ${currentLevel})</h3>
                    <p>${item.description}</p>
                    <div class="upgrade-stats">
                        <div style="font-size: 0.9rem; margin: 0.5rem 0;">
                            <span style="color: var(--success-color)">Текущий бонус: +${currentBonus}</span><br>
                            <span style="color: #ff4444">Максимум: +${maxBonus} за клик</span>
                        </div>
                    </div>
                    <div class="upgrade-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(currentLevel / item.maxLevel) * 100}%"></div>
                        </div>
                        <span class="progress-text">${currentLevel} / ${item.maxLevel}</span>
                    </div>
                    <div class="store-item-price">
                        <span class="price">${isMaxLevel ? "МАКС." : currentPrice}</span>
                    </div>
                    <button class="buy-btn upgrade-btn ${isMaxLevel ? "max-level" : ""}"
                            data-id="${item.id}"
                            data-type="upgrade"
                            data-price="${currentPrice}"
                            ${isMaxLevel ? "disabled" : !canAfford ? "disabled" : ""}>
                        ${isMaxLevel ? "Макс. уровень" : !canAfford ? "Недостаточно" : "Улучшить"}
                    </button>
                    ${!isMaxLevel && !canAfford ? '<div class="insufficient-funds">Не хватает: ' + (currentPrice - this.getBalance()) + "</div>" : ""}
                </div>
            `;

    this.storeGrid.appendChild(storeItem);
  }

  calculateUpgradePrice(upgradeId, level) {
    const baseItem = storeItems.find((item) => item.id === upgradeId);
    if (!baseItem) return 0;

    // Базовая цена + 100 за каждый уровень
    return baseItem.price + (level - 1) * 100;
  }

  getUpgradeLevel(upgradeId) {
    return parseInt(localStorage.getItem(`upgrade_${upgradeId}_level`) || "0");
  }

  setUpgradeLevel(upgradeId, level) {
    localStorage.setItem(`upgrade_${upgradeId}_level`, level.toString());
  }

  getTotalMultiplier() {
    let totalMultiplier = 1;

    if (typeof storeItems === "undefined" || !storeItems)
      return totalMultiplier;

    storeItems.forEach((item) => {
      if (item.type === "upgrade") {
        const level = this.getUpgradeLevel(item.id);
        totalMultiplier += level * item.multiplier;
      }
    });

    return totalMultiplier;
  }

  updateUpgradeInfo() {
    // Обновляем информацию о множителе в описаниях прокачки
    const multiplierElements = document.querySelectorAll("#currentMultiplier");
    const totalMultiplier = this.getTotalMultiplier();

    multiplierElements.forEach((element) => {
      element.textContent = totalMultiplier;
    });

    // Обновляем прогресс бары
    const progressBars = document.querySelectorAll(".progress-fill");
    progressBars.forEach((bar) => {
      const storeItem = bar.closest(".store-item");
      if (storeItem) {
        const upgradeId = storeItem.querySelector(".buy-btn")?.dataset.id;
        if (upgradeId) {
          const baseItem = storeItems.find((item) => item.id === upgradeId);
          if (baseItem) {
            const currentLevel = this.getUpgradeLevel(upgradeId);
            bar.style.width = `${(currentLevel / baseItem.maxLevel) * 100}%`;

            // Обновляем текст прогресса
            const progressText = storeItem.querySelector(".progress-text");
            if (progressText) {
              progressText.textContent = `${currentLevel} / ${baseItem.maxLevel}`;
            }
          }
        }
      }
    });
  }

  addBuyButtonListeners() {
    const buyButtons = this.storeGrid.querySelectorAll(
      ".buy-btn:not(:disabled):not(.owned):not(.max-level)",
    );

    buyButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const itemId = e.target.dataset.id;
        const itemType = e.target.dataset.type;
        const price = parseInt(e.target.dataset.price);

        if (itemType === "skin") {
          this.buySkin(itemId, price);
        } else if (itemType === "upgrade") {
          this.buyUpgrade(itemId, price);
        }
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

  buyUpgrade(upgradeId, price) {
    if (!this.canAfford(price)) {
      this.showNotification("Недостаточно!", "error");
      return;
    }

    const baseItem = storeItems.find((item) => item.id === upgradeId);
    if (!baseItem) return;

    const currentLevel = this.getUpgradeLevel(upgradeId);
    const nextLevel = currentLevel + 1;

    if (nextLevel > baseItem.maxLevel) {
      this.showNotification("Достигнут максимальный уровень!", "error");
      return;
    }

    // Списываем стоимость
    this.deductBalance(price);

    // Увеличиваем уровень прокачки
    this.setUpgradeLevel(upgradeId, nextLevel);

    // Обновляем интерфейс
    this.updateBalance();
    this.loadStoreItems();

    // Показываем уведомление
    const newBonus = nextLevel * baseItem.multiplier;
    const totalMultiplier = this.getTotalMultiplier();
    this.showNotification(
      `Прокачка улучшена до уровня ${nextLevel}! Бонус: +${newBonus} (Всего: +${totalMultiplier - 1})`,
      "success",
    );

    // Обновляем кликер
    if (clicker) {
      clicker.forceUpdate();
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
        if (item.id !== "p6" && item.type === "skin") {
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
