class SkinsManager {
  constructor() {
    this.skinsPopup = document.getElementById("skinsPopup");
    this.skinsBtn = document.getElementById("skinsBtn");
    this.closeSkinsPopup = document.getElementById("closeSkinsPopup");
    this.skinsGrid = document.getElementById("skinsGrid");

    this.currentSkin = localStorage.getItem("selectedSkin") || "p6";
    this.isClosing = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    // Предзагружаем скины
    this.preloadOwnedSkins();
  }

  setupEventListeners() {
    // Открытие/закрытие popup скинов
    this.skinsBtn.addEventListener("click", () => this.openSkinsPopup());
    this.closeSkinsPopup.addEventListener("click", () =>
      this.closeSkinsPopupWindow(),
    );

    // Закрытие по клику вне popup
    this.skinsPopup.addEventListener("click", (e) => {
      if (e.target === this.skinsPopup && !this.isClosing) {
        this.closeSkinsPopupWindow();
      }
    });

    // Закрытие по ESC
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.skinsPopup.classList.contains("active") &&
        !this.isClosing
      ) {
        this.closeSkinsPopupWindow();
      }
    });

    // Анимация при наведении на кнопку скинов
    this.skinsBtn.addEventListener("mouseenter", () => {
      this.skinsBtn.classList.add("animate-pulse");
    });

    this.skinsBtn.addEventListener("mouseleave", () => {
      this.skinsBtn.classList.remove("animate-pulse");
    });
  }

  loadAvailableSkins() {
    if (!this.skinsGrid) return;

    this.skinsGrid.innerHTML = "";

    // Проверяем существует ли storeItems
    if (typeof storeItems === "undefined" || !storeItems) {
      console.warn("storeItems is not defined, showing basic skin only");
      // Показываем только базовый скин
      this.showBasicSkin();
      return;
    }

    // Получаем купленные скины
    const ownedSkins = JSON.parse(
      localStorage.getItem("ownedSkins") || '["p6"]',
    );

    // Фильтруем скины, оставляя только купленные
    const availableSkins = storeItems.filter((skin) =>
      ownedSkins.includes(skin.id),
    );

    if (availableSkins.length === 0) {
      this.showBasicSkin();
      return;
    }

    availableSkins.forEach((skin) => {
      const skinCard = document.createElement("div");
      skinCard.className = `skin-card ${skin.id === this.currentSkin ? "active" : ""}`;
      skinCard.dataset.skin = skin.id;

      skinCard.innerHTML = `
                <div class="skin-preview">
                    <img src="assets/images/${skin.image}" alt="${skin.name}" onerror="this.src='assets/images/p6.png'">
                </div>
                <div class="skin-info">
                    <h3>${skin.name}</h3>
                    <p>${skin.description}</p>
                </div>
            `;

      skinCard.addEventListener("click", () => {
        this.selectSkin(skinCard);
      });

      this.skinsGrid.appendChild(skinCard);
    });
  }

  showBasicSkin() {
    const skinCard = document.createElement("div");
    skinCard.className = `skin-card ${"p6" === this.currentSkin ? "active" : ""}`;
    skinCard.dataset.skin = "p6";

    skinCard.innerHTML = `
            <div class="skin-preview">
                <img src="assets/images/p6.png" alt="Pixel 6">
            </div>
            <div class="skin-info">
                <h3>Pixel 6</h3>
                <p>Классический пиксель для настоящих ценителей</p>
            </div>
        `;

    skinCard.addEventListener("click", () => {
      this.selectSkin(skinCard);
    });

    this.skinsGrid.appendChild(skinCard);
  }

  openSkinsPopup() {
    if (this.isClosing) return;

    this.skinsPopup.classList.add("active");
    document.body.style.overflow = "hidden";
    this.loadAvailableSkins();

    // Анимация появления карточек с задержкой
    setTimeout(() => {
      const skinCards = this.skinsGrid.querySelectorAll(".skin-card");
      skinCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add("animate-fadeInUp");
      });
    }, 100);
  }

  closeSkinsPopupWindow() {
    if (this.isClosing) return;

    this.isClosing = true;

    // Анимация закрытия
    this.skinsPopup.classList.add("popup-closing");

    // Анимация исчезновения карточек
    const skinCards = this.skinsGrid.querySelectorAll(".skin-card");
    skinCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.05}s`;
      card.classList.remove("animate-fadeInUp");
      card.classList.add("animate-fadeOutDown");
    });

    setTimeout(() => {
      this.skinsPopup.classList.remove("active", "popup-closing");
      document.body.style.overflow = "";
      this.isClosing = false;

      // Сброс анимаций карточек
      setTimeout(() => {
        skinCards.forEach((card) => {
          card.classList.remove("animate-fadeOutDown");
          card.style.animationDelay = "";
        });
      }, 300);
    }, 400);
  }

  selectSkin(card) {
    if (this.isClosing) return;

    const skinId = card.dataset.skin;

    // Если скин уже выбран, ничего не делаем
    if (skinId === this.currentSkin) {
      this.showAlreadySelectedFeedback(card);
      return;
    }

    this.currentSkin = skinId;

    // Анимация выбора
    this.animateSkinSelection(card);

    // Смена изображения в кликере
    this.changeClickerSkin(skinId);

    // Сохранение выбора
    localStorage.setItem("selectedSkin", skinId);

    // Показ подтверждения
    this.showSelectionConfirmation(skinId);
  }

  animateSkinSelection(selectedCard) {
    // Сброс всех карточек
    const skinCards = this.skinsGrid.querySelectorAll(".skin-card");
    skinCards.forEach((card) => {
      card.classList.remove("active", "skin-selected");
    });

    // Анимация выбранной карточки
    selectedCard.classList.add("active", "skin-selected");

    // Создаем эффект частиц
    this.createParticles(selectedCard);

    // Анимация остальных карточек
    skinCards.forEach((card) => {
      if (card !== selectedCard) {
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
          card.style.transform = "scale(1)";
        }, 300);
      }
    });
  }

  changeClickerSkin(skinId) {
    if (!clicker) return;

    // Проверяем существует ли storeItems
    if (typeof storeItems === "undefined" || !storeItems) {
      console.warn("storeItems not available for skin change");
      return;
    }

    const skin = storeItems.find((s) => s.id === skinId);
    if (!skin) return;

    // Анимация смены изображения
    clicker.clickImage.classList.add("skin-change");

    setTimeout(() => {
      clicker.changeSkin(skin.image);

      setTimeout(() => {
        clicker.clickImage.classList.remove("skin-change");
        clicker.clickImage.classList.add("animate-bounceIn");

        setTimeout(() => {
          clicker.clickImage.classList.remove("animate-bounceIn");
        }, 600);
      }, 200);
    }, 200);
  }

  createParticles(card) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      this.createParticle(centerX, centerY, i);
    }
  }

  createParticle(x, y, index) {
    const particle = document.createElement("div");
    particle.className = "skin-particle";

    const size = 6 + Math.random() * 4;
    const angle = index * 45 * (Math.PI / 180);
    const distance = 60 + Math.random() * 40;
    const duration = 600 + Math.random() * 300;

    Object.assign(particle.style, {
      position: "fixed",
      width: `${size}px`,
      height: `${size}px`,
      background: this.getParticleColor(),
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: "1000",
      left: `${x}px`,
      top: `${y}px`,
      opacity: "0",
    });

    document.body.appendChild(particle);

    // Анимация частицы
    const animation = particle.animate(
      [
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
        },
        {
          transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
          opacity: 0,
        },
      ],
      {
        duration: duration,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    );

    animation.onfinish = () => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    };
  }

  getParticleColor() {
    const colors = [
      "#6750A4",
      "#B583DA",
      "#E67BD6",
      "#FF8DA1",
      "#006A6B",
      "#00B3A6",
      "#8E24AA",
      "#BA68C8",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  showSelectionConfirmation(skinId) {
    // Проверяем существует ли storeItems
    if (typeof storeItems === "undefined" || !storeItems) return;

    const skin = storeItems.find((s) => s.id === skinId);
    if (!skin) return;

    const selectedCard = Array.from(
      this.skinsGrid.querySelectorAll(".skin-card"),
    ).find((card) => card.dataset.skin === skinId);

    if (selectedCard) {
      selectedCard.classList.add("success-animation");

      setTimeout(() => {
        selectedCard.classList.remove("success-animation");
      }, 2000);
    }
  }

  showAlreadySelectedFeedback(card) {
    card.classList.add("animate-shake");

    setTimeout(() => {
      card.classList.remove("animate-shake");
    }, 500);
  }

  preloadOwnedSkins() {
    // Предзагружаем скины в фоне
    setTimeout(() => {
      if (typeof storeItems === "undefined" || !storeItems) return;

      const ownedSkins = JSON.parse(
        localStorage.getItem("ownedSkins") || '["p6"]',
      );

      const skinsToPreload = storeItems.filter((skin) =>
        ownedSkins.includes(skin.id),
      );

      skinsToPreload.forEach((skin) => {
        if (skin.id !== "p6") {
          // Базовый скин уже загружен
          const img = new Image();
          img.src = `assets/images/${skin.image}`;
          img.onerror = () => {
            console.warn(`Failed to load skin image: ${skin.image}`);
          };
        }
      });
    }, 1000);
  }
}

// Добавляем минимальные стили для частиц
const style = document.createElement("style");
style.textContent = `
    .skin-particle {
        box-shadow: 0 0 8px currentColor;
        filter: blur(0.5px);
    }

    .skin-card.skin-selected {
        animation: pulse 0.6s ease-in-out;
    }
`;
document.head.appendChild(style);

// Инициализация менеджера скинов
document.addEventListener("DOMContentLoaded", () => {
  window.skinsManager = new SkinsManager();
});
