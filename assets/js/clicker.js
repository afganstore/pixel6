class PixelClicker {
  constructor() {
    this.counter = document.getElementById("counter");
    this.clickImage = document.getElementById("clickImage");
    this.soundPool = [];
    this.poolSize = 5;

    this.loadCount();
    this.setupEventListeners();
    this.initializeSoundPool();
    this.updateDisplay();
    this.startContinuousGradient();

    // Инициализируем коллекцию скинов если ее нет
    this.initializeSkins();

    // Сразу загружаем выбранный скин
    this.loadSkinSetting();
  }

  initializeSkins() {
    if (!localStorage.getItem("ownedSkins")) {
      localStorage.setItem("ownedSkins", '["p6"]'); // Базовый скин
    }
    if (!localStorage.getItem("selectedSkin")) {
      localStorage.setItem("selectedSkin", "p6"); // Выбранный скин
    }

    // Инициализация для модов
    if (!localStorage.getItem("customModCode")) {
      localStorage.setItem("customModCode", "");
    }
  }

  initializeSoundPool() {
    for (let i = 0; i < this.poolSize; i++) {
      const audio = new Audio("assets/sounds/pixel6.mp3");
      audio.volume = 0.7;
      this.soundPool.push(audio);
    }
  }

  getAvailableSound() {
    for (let audio of this.soundPool) {
      if (audio.paused || audio.ended) {
        return audio;
      }
    }
    const audio = this.soundPool[0];
    audio.currentTime = 0;
    return audio;
  }

  loadCount() {
    const savedCount = localStorage.getItem("clickCount");
    this.count = savedCount ? parseInt(savedCount) : 0;
  }

  saveCount() {
    localStorage.setItem("clickCount", this.count.toString());
  }

  setupEventListeners() {
    this.clickImage.addEventListener("click", (e) => this.handleClick(e));

    this.clickImage.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        this.handleClick(e);
      },
      { passive: false },
    );
  }

  handleClick(event) {
    this.count++;
    this.playClickSound();
    this.showClickOverlay(event);
    this.animateClick();
    this.saveCount();
    this.updateDisplay();

    // Обновляем баланс в магазине если он открыт
    if (window.storeManager) {
      window.storeManager.updateBalance();
    }
  }

  getRandomPositionAroundPixel(event) {
    const pixelRect = this.clickImage.getBoundingClientRect();
    const pixelCenterX = pixelRect.left + pixelRect.width / 2;
    const pixelCenterY = pixelRect.top + pixelRect.height / 2;

    const distance = 50 + Math.random() * 100;
    const angle = Math.random() * Math.PI * 2;

    const x = pixelCenterX + Math.cos(angle) * distance;
    const y = pixelCenterY + Math.sin(angle) * distance;

    return { x, y };
  }

  showClickOverlay(event) {
    const overlay = document.createElement("div");
    overlay.className = "click-overlay";
    overlay.textContent = `+${this.getIncrementValue()}`;

    const position = this.getRandomPositionAroundPixel(event);
    overlay.style.left = `${position.x}px`;
    overlay.style.top = `${position.y}px`;

    const rotation = -15 + Math.random() * 30;
    overlay.style.transform = `rotate(${rotation}deg)`;

    document.body.appendChild(overlay);

    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 1200);
  }

  playClickSound() {
    const audio = this.getAvailableSound();
    audio.currentTime = 0;
    audio.play().catch((e) => {
      console.log("Audio play failed:", e);
    });
  }

  animateClick() {
    this.clickImage.classList.add("click-pulse");
    setTimeout(() => {
      this.clickImage.classList.remove("click-pulse");
    }, 150);
  }

  startContinuousGradient() {
    let position = 0;

    const animateGradient = () => {
      position = (position + 0.1) % 100;
      document.body.style.backgroundPosition = `${position}% ${position}%`;
      requestAnimationFrame(animateGradient);
    };

    animateGradient();
  }

  loadSkinSetting() {
    const savedSkinId = localStorage.getItem("selectedSkin") || "p6";

    // Сначала устанавливаем базовый скин
    this.clickImage.src = `assets/images/p6.png`;

    // Потом пытаемся загрузить выбранный скин
    this.loadSelectedSkin(savedSkinId);
  }

  loadSelectedSkin(skinId) {
    // Ждем загрузки storeItems
    this.waitForStoreItems()
      .then(() => {
        if (typeof storeItems !== "undefined" && storeItems) {
          const skin = storeItems.find((s) => s.id === skinId);
          if (skin && skin.id !== "p6") {
            // Не перезагружаем базовый скин
            const img = new Image();
            img.onload = () => {
              this.clickImage.src = `assets/images/${skin.image}`;
            };
            img.onerror = () => {
              console.warn(`Не удалось загрузить скин: ${skin.image}`);
              this.clickImage.src = `assets/images/p6.png`;
            };
            img.src = `assets/images/${skin.image}`;
          }
        }
      })
      .catch(() => {
        console.warn("storeItems не загрузился, используем базовый скин");
      });
  }

  waitForStoreItems() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 секунд максимум

      const checkStoreItems = () => {
        attempts++;
        if (typeof storeItems !== "undefined" && storeItems) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error("storeItems не загрузился за отведенное время"));
        } else {
          setTimeout(checkStoreItems, 100);
        }
      };
      checkStoreItems();
    });
  }

  changeSkin(imageName) {
    this.clickImage.src = `assets/images/${imageName}`;
  }

  resetData() {
    this.count = 0;
    this.saveCount();
    this.updateDisplay();
    localStorage.setItem("ownedSkins", '["p6"]'); // Оставляем только базовый скин
    localStorage.setItem("selectedSkin", "p6"); // Сбрасываем выбранный скин

    // Обновляем интерфейсы
    if (window.storeManager) {
      window.storeManager.updateBalance();
      window.storeManager.loadStoreItems();
    }
    if (window.skinsManager) {
      window.skinsManager.loadAvailableSkins();
      window.skinsManager.currentSkin = "p6";
    }

    // Перезагружаем текущий скин
    this.loadSkinSetting();
  }

  getIncrementValue() {
    return 1;
  }

  forceUpdate() {
    this.updateDisplay();
    if (window.storeManager) {
      window.storeManager.updateBalance();
    }
  }

  formatNumber(number) {
    const str = number.toString();

    if (str.length <= 12) {
      return this.addSeparators(str);
    }

    const visiblePart = str.slice(0, -3);
    return this.addSeparators(visiblePart) + "...";
  }

  addSeparators(str) {
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  updateDisplay() {
    this.counter.textContent = this.formatNumber(this.count);
    this.checkTextOverflow();
  }

  checkTextOverflow() {
    const counter = this.counter;
    const isOverflowing = counter.scrollWidth > counter.clientWidth;

    if (isOverflowing) {
      this.handleOverflow();
    }
  }

  handleOverflow() {
    const str = this.count.toString();

    if (str.length <= 12) return;

    const visiblePart = str.slice(0, -3);
    this.counter.textContent = this.addSeparators(visiblePart) + "...";
  }
}

// Глобальная переменная для доступа из других скриптов
let clicker;

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  clicker = new PixelClicker();
});
