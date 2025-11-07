class PixelClicker {
  constructor() {
    this.counter = document.getElementById("counter");
    this.clickImage = document.getElementById("clickImage");
    this.soundPool = [];
    this.poolSize = 5;
    this.currentSound = this.getCurrentSound();

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

  getCurrentSound() {
    const savedSoundId = localStorage.getItem("clickSound") || "pixel6";

    // Проверяем существует ли выбранный звук
    if (typeof clickSounds !== "undefined" && clickSounds) {
      const sound = clickSounds.sounds.find((s) => s.id === savedSoundId);
      if (sound) {
        return sound;
      }
    }

    // Возвращаем звук по умолчанию
    return clickSounds.default;
  }

  initializeSoundPool() {
    for (let i = 0; i < this.poolSize; i++) {
      const audio = new Audio(`assets/sounds/${this.currentSound.file}`);
      audio.volume = 0.7;
      audio.preload = "auto";
      this.soundPool.push(audio);
    }
  }

  updateSoundPool() {
    // Останавливаем все текущие звуки
    this.soundPool.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Пересоздаем пул с новым звуком
    this.soundPool = [];
    for (let i = 0; i < this.poolSize; i++) {
      const audio = new Audio(`assets/sounds/${this.currentSound.file}`);
      audio.volume = 0.7;
      audio.preload = "auto";
      this.soundPool.push(audio);
    }
  }

  changeClickSound(soundId) {
    if (typeof clickSounds === "undefined" || !clickSounds) {
      console.warn("clickSounds not available");
      return false;
    }

    const newSound = clickSounds.sounds.find((s) => s.id === soundId);
    if (!newSound) {
      console.warn(`Sound not found: ${soundId}`);
      return false;
    }

    this.currentSound = newSound;
    localStorage.setItem("clickSound", soundId);
    this.updateSoundPool();

    return true;
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

  getIncrementValue() {
    const baseIncrement = 1;
    let multiplier = 1;

    // Получаем множитель из системы прокачки
    if (window.storeManager) {
      multiplier = window.storeManager.getTotalMultiplier();
    }

    return baseIncrement * multiplier;
  }

  handleClick(event) {
    const increment = this.getIncrementValue();
    this.count += increment;
    this.playClickSound();
    this.showClickOverlay(event, increment);
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

  showClickOverlay(event, increment) {
    const overlay = document.createElement("div");
    overlay.className = "click-overlay";
    overlay.textContent = `+${increment}`;

    const position = this.getRandomPositionAroundPixel(event);
    overlay.style.left = `${position.x}px`;
    overlay.style.top = `${position.y}px`;

    const rotation = -15 + Math.random() * 30;
    overlay.style.transform = `rotate(${rotation}deg)`;

    // Разный цвет в зависимости от величины инкремента
    if (increment >= 1000) {
      overlay.style.color = "#ff4444";
      overlay.style.fontSize = "3.5rem";
      overlay.style.fontWeight = "900";
      overlay.style.textShadow =
        "0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(255, 68, 68, 0.8), 0 8px 40px rgba(255, 68, 68, 0.6)";
    } else if (increment >= 500) {
      overlay.style.color = "#ff6b35";
      overlay.style.fontSize = "3rem";
      overlay.style.fontWeight = "700";
      overlay.style.textShadow =
        "0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(255, 107, 53, 0.8)";
    } else if (increment >= 100) {
      overlay.style.color = "#ffaa00";
      overlay.style.fontSize = "2.8rem";
      overlay.style.fontWeight = "600";
      overlay.style.textShadow =
        "0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(255, 170, 0, 0.8)";
    } else if (increment >= 50) {
      overlay.style.color = "#ffd700";
      overlay.style.fontSize = "2.5rem";
      overlay.style.textShadow =
        "0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(255, 215, 0, 0.8)";
    } else if (increment >= 10) {
      overlay.style.color = "#a0e7a0";
      overlay.style.fontSize = "2.2rem";
      overlay.style.textShadow =
        "0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(160, 231, 160, 0.8)";
    }

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
    const backgroundType = localStorage.getItem("backgroundType") || "gradient";

    // Анимация градиента нужна только для градиентных фонов
    if (backgroundType === "gradient" || backgroundType === "custom-gradient") {
      let position = 0;

      const animateGradient = () => {
        position = (position + 0.1) % 100;
        document.body.style.backgroundPosition = `${position}% ${position}%`;
        requestAnimationFrame(animateGradient);
      };

      animateGradient();
    }
    // Для сплошного цвета анимация не нужна
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
    localStorage.setItem("clickSound", "pixel6"); // Сбрасываем звук

    // Сбрасываем прокачку
    if (typeof storeItems !== "undefined" && storeItems) {
      storeItems.forEach((item) => {
        if (item.type === "upgrade") {
          localStorage.removeItem(`upgrade_${item.id}_level`);
        }
      });
    }

    // Обновляем интерфейсы
    if (window.storeManager) {
      window.storeManager.updateBalance();
      window.storeManager.loadStoreItems();
    }
    if (window.skinsManager) {
      window.skinsManager.loadAvailableSkins();
      window.skinsManager.currentSkin = "p6";
    }

    // Перезагружаем текущий скин и звук
    this.loadSkinSetting();
    this.currentSound = this.getCurrentSound();
    this.updateSoundPool();
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
