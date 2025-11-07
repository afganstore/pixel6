class SettingsManager {
  constructor() {
    this.settingsPopup = document.getElementById("settingsPopup");
    this.settingsBtn = document.getElementById("settingsBtn");
    this.closePopup = document.getElementById("closePopup");
    this.darkThemeToggle = document.getElementById("darkThemeToggle");
    this.resetDataBtn = document.getElementById("resetData");

    this.animationsToggle = document.getElementById("animationsToggle");
    this.particlesToggle = document.getElementById("particlesToggle");
    this.gradientToggle = document.getElementById("gradientToggle");

    this.soundToggle = document.getElementById("soundToggle");

    this.tabButtons = document.querySelectorAll(".tab-btn");
    this.settingCategories = document.querySelectorAll(".setting-category");
    this.settingsTabs = document.querySelector(".settings-tabs");

    this.customModCode = document.getElementById("customModCode");
    this.applyModBtn = document.getElementById("applyMod");
    this.clearModBtn = document.getElementById("clearMod");
    this.modStatus = document.getElementById("modStatus");
    this.autoLoadToggle = document.getElementById("autoLoadToggle");

    this.modConfirmationModal = document.getElementById("modConfirmationModal");
    this.confirmModYes = document.getElementById("confirmModYes");
    this.confirmModNo = document.getElementById("confirmModNo");
    this.codePreview = document.getElementById("codePreview");

    // Новые элементы для настройки фона
    this.backgroundTypeSelect = document.getElementById("backgroundTypeSelect");
    this.solidColorInput = document.getElementById("solidColorInput");
    this.colorPreview = document.getElementById("colorPreview");
    this.gradientColorInputs = [
      document.getElementById("gradientColor1"),
      document.getElementById("gradientColor2"),
      document.getElementById("gradientColor3"),
      document.getElementById("gradientColor4"),
    ];
    this.gradientColorPreviews = [
      document.getElementById("gradientColorPreview1"),
      document.getElementById("gradientColorPreview2"),
      document.getElementById("gradientColorPreview3"),
      document.getElementById("gradientColorPreview4"),
    ];
    this.gradientPreview = document.getElementById("gradientPreview");

    // Элементы для акцентного цвета
    this.accentColorPreview = document.getElementById("accentColorPreview");
    this.accentColorHex = document.getElementById("accentColorHex");
    this.accentColorName = document.getElementById("accentColorName");
    this.accentPresetsContainer = document.getElementById("accentPresets");

    // Переменные для color picker
    this.colorPickerOverlay = null;
    this.currentColorPicker = null;
    this.pendingColorChange = null;
    this.currentEscHandler = null;

    // Пресеты акцентных цветов
    this.accentColorPresets = [
      { name: "Фиолетовый", value: "#6750a4", default: true },
      { name: "Синий", value: "#2196f3" },
      { name: "Зеленый", value: "#4caf50" },
      { name: "Оранжевый", value: "#ff9800" },
      { name: "Розовый", value: "#e91e63" },
      { name: "Бирюзовый", value: "#00bcd4" },
      { name: "Красный", value: "#f44336" },
      { name: "Золотой", value: "#ffd700" },
    ];

    this.isClosing = false;
    this.currentTab = "all";
    this.pendingModCode = null;

    this.init();
  }

  init() {
    this.loadSettings();
    this.setupEventListeners();
    this.applyOptimizationSettings();
    this.setupTabs();
    this.setupModsEventListeners();
    this.loadAutoLoadMods();

    // Инициализация системы звуков
    this.initializeSoundSystem();

    // Инициализация настроек фона
    this.setupBackgroundSettings();
    this.loadBackgroundSettings();

    // Инициализация акцентного цвета
    this.setupAccentColor();
    this.loadAccentColor();

    // Обновляем структуру кнопок вкладок
    this.updateTabButtonsStructure();
  }

  // МЕТОД: Обновление структуры кнопок вкладок для разделения эмодзи и текста
  updateTabButtonsStructure() {
    this.tabButtons.forEach((button) => {
      const originalHTML = button.innerHTML;

      // Сохраняем оригинальный HTML в data-атрибут
      button.dataset.originalHTML = originalHTML;

      // Извлекаем эмодзи (первый символ или символы до пробела)
      const emojiMatch = originalHTML.match(/^.[^a-zA-Z0-9\s]*/);
      const textMatch = originalHTML.replace(/^.[^a-zA-Z0-9\s]*\s*/, "");

      if (emojiMatch) {
        const emoji = emojiMatch[0];
        const newHTML = `
                    <span class="tab-emoji">${emoji}</span>
                    <span class="tab-text">${textMatch}</span>
                `;
        button.innerHTML = newHTML;
      }
    });
  }

  // ОСТАЛЬНЫЕ МЕТОДЫ ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ
  setupAccentColor() {
    if (!this.accentColorPreview) return;

    // Обработчик клика на превью акцентного цвета
    this.accentColorPreview.addEventListener("click", () => {
      this.openColorPicker("accent", this.getCurrentAccentColor());
    });

    // Создаем пресеты цветов
    this.createAccentPresets();
  }

  createAccentPresets() {
    if (!this.accentPresetsContainer) return;

    this.accentColorPresets.forEach((preset, index) => {
      const presetElement = document.createElement("div");
      presetElement.className = `accent-preset preset-delay-${(index % 8) + 1} preset-stagger`;
      presetElement.style.background = preset.value;
      presetElement.title = preset.name;
      presetElement.dataset.color = preset.value;
      presetElement.dataset.name = preset.name;

      presetElement.addEventListener("click", () => {
        this.selectAccentPreset(presetElement, preset);
      });

      this.accentPresetsContainer.appendChild(presetElement);
    });
  }

  selectAccentPreset(presetElement, preset) {
    // Анимация выбора
    presetElement.classList.add("color-select-animation");

    // Убираем активный класс у всех пресетов
    document.querySelectorAll(".accent-preset").forEach((p) => {
      p.classList.remove("active", "preset-pulse");
    });

    // Добавляем активный класс к выбранному пресету
    presetElement.classList.add("active", "preset-pulse");

    // Применяем цвет
    this.applyAccentColor(preset.value, preset.name);

    // Показываем анимацию смены цвета
    this.showAccentColorChangeAnimation();

    setTimeout(() => {
      presetElement.classList.remove("color-select-animation");
    }, 600);
  }

  applyAccentColor(color, name = "Пользовательский") {
    // Сохраняем в localStorage
    localStorage.setItem("accentColor", color);
    localStorage.setItem("accentColorName", name);

    // Обновляем CSS переменную
    document.documentElement.style.setProperty("--accent-color", color);

    // Обновляем UI
    this.updateAccentColorUI(color, name);

    // Применяем цвет ко всем элементам
    this.applyAccentColorToElements(color);

    console.log(`🎨 Акцентный цвет изменен на: ${name} (${color})`);
  }

  updateAccentColorUI(color, name) {
    if (this.accentColorPreview) {
      this.accentColorPreview.style.background = color;
    }
    if (this.accentColorHex) {
      this.accentColorHex.textContent = color;
    }
    if (this.accentColorName) {
      this.accentColorName.textContent = name;
    }

    // Обновляем активный пресет
    document.querySelectorAll(".accent-preset").forEach((preset) => {
      if (preset.dataset.color === color) {
        preset.classList.add("active", "preset-pulse");
      } else {
        preset.classList.remove("active", "preset-pulse");
      }
    });
  }

  applyAccentColorToElements(color) {
    // Обновляем все элементы с акцентным цветом
    const accentElements = document.querySelectorAll(
      '[style*="--accent-color"], .tab-btn.active, .switch input:checked + .slider',
    );

    // Добавляем плавный переход
    document.documentElement.classList.add("smooth-color-transition");

    setTimeout(() => {
      document.documentElement.classList.remove("smooth-color-transition");
    }, 500);
  }

  showAccentColorChangeAnimation() {
    if (this.accentColorPreview) {
      this.accentColorPreview.classList.add("accent-glow");
      setTimeout(() => {
        this.accentColorPreview.classList.remove("accent-glow");
      }, 1500);
    }

    // Показываем уведомление
    this.showNotification(`Акцентный цвет изменен! 🎨`, "success");
  }

  loadAccentColor() {
    const savedColor = localStorage.getItem("accentColor") || "#6750a4";
    const savedName = localStorage.getItem("accentColorName") || "Фиолетовый";

    this.applyAccentColor(savedColor, savedName);
  }

  getCurrentAccentColor() {
    return localStorage.getItem("accentColor") || "#6750a4";
  }

  // ИСПРАВЛЕННЫЙ МЕТОД: Открытие color picker
  openColorPicker(type, currentColor, index = null) {
    // Закрываем предыдущий color picker если он открыт
    if (this.colorPickerOverlay) {
      this.closeColorPicker();
      return;
    }

    this.createColorPickerDialog(type, currentColor, index);
  }

  createColorPickerDialog(type, currentColor, index = null) {
    // Создаем overlay
    this.colorPickerOverlay = document.createElement("div");
    this.colorPickerOverlay.className = "color-picker-overlay";

    // Создаем диалог
    const dialog = document.createElement("div");
    dialog.className = "color-picker-dialog color-picker-open";

    const title = this.getColorPickerTitle(type, index);

    dialog.innerHTML = `
            <h3>${title}</h3>
            <input type="color" id="nativeColorPicker" value="${currentColor}"
                   style="width: 100%; height: 150px; border: none; border-radius: 8px; cursor: pointer;">
            <div class="color-picker-actions">
                <button class="color-picker-cancel" id="colorPickerCancel">Отмена</button>
                <button class="color-picker-confirm" id="colorPickerConfirm">Выбрать</button>
            </div>
        `;

    this.colorPickerOverlay.appendChild(dialog);
    document.body.appendChild(this.colorPickerOverlay);

    // Сохраняем контекст для использования в обработчиках
    this.pendingColorChange = { type, index, currentColor };

    // Обработчики событий
    const nativePicker = dialog.querySelector("#nativeColorPicker");
    const confirmBtn = dialog.querySelector("#colorPickerConfirm");
    const cancelBtn = dialog.querySelector("#colorPickerCancel");

    // Анимация при изменении цвета
    nativePicker.addEventListener("input", (e) => {
      this.animateColorChange(nativePicker);
    });

    confirmBtn.addEventListener("click", () => {
      this.confirmColorSelection(nativePicker.value);
    });

    cancelBtn.addEventListener("click", () => {
      this.closeColorPicker();
    });

    this.colorPickerOverlay.addEventListener("click", (e) => {
      if (e.target === this.colorPickerOverlay) {
        this.closeColorPicker();
      }
    });

    // Закрытие по ESC
    const escHandler = (e) => {
      if (e.key === "Escape") {
        this.closeColorPicker();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    // Сохраняем ссылку для удаления
    this.currentEscHandler = escHandler;

    // Фокус на color picker
    setTimeout(() => {
      nativePicker.focus();
    }, 100);
  }

  getColorPickerTitle(type, index) {
    switch (type) {
      case "accent":
        return "Выберите акцентный цвет";
      case "solid":
        return "Выберите цвет фона";
      case "gradient":
        return `Выберите цвет градиента ${index + 1}`;
      default:
        return "Выберите цвет";
    }
  }

  animateColorChange(colorPicker) {
    // Создаем ripple эффект
    this.createRippleEffect(colorPicker);

    // Добавляем класс анимации
    colorPicker.classList.add("color-hover");
    setTimeout(() => {
      colorPicker.classList.remove("color-hover");
    }, 300);
  }

  createRippleEffect(element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement("div");
    ripple.className = "color-ripple";
    ripple.style.width = "20px";
    ripple.style.height = "20px";
    ripple.style.left = rect.width / 2 - 10 + "px";
    ripple.style.top = rect.height / 2 - 10 + "px";

    element.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }

  confirmColorSelection(color) {
    if (!this.pendingColorChange) return;

    const { type, index } = this.pendingColorChange;

    // Анимация подтверждения
    this.animateColorConfirmation();

    switch (type) {
      case "accent":
        this.applyAccentColor(color, "Пользовательский");
        break;
      case "solid":
        this.changeSolidColor(color);
        break;
      case "gradient":
        this.changeGradientColor(index, color);
        break;
    }

    this.closeColorPicker();
  }

  animateColorConfirmation() {
    const confirmBtn = document.querySelector("#colorPickerConfirm");
    if (confirmBtn) {
      confirmBtn.classList.add("color-select-animation");
      setTimeout(() => {
        confirmBtn.classList.remove("color-select-animation");
      }, 600);
    }
  }

  closeColorPicker() {
    if (this.colorPickerOverlay) {
      const dialog = this.colorPickerOverlay.querySelector(
        ".color-picker-dialog",
      );
      if (dialog) {
        dialog.classList.remove("color-picker-open");
        dialog.classList.add("color-picker-close");
      }

      setTimeout(() => {
        if (this.colorPickerOverlay && this.colorPickerOverlay.parentNode) {
          this.colorPickerOverlay.parentNode.removeChild(
            this.colorPickerOverlay,
          );
        }
        this.colorPickerOverlay = null;

        if (this.currentEscHandler) {
          document.removeEventListener("keydown", this.currentEscHandler);
          this.currentEscHandler = null;
        }
        this.pendingColorChange = null;
      }, 300);
    }
  }

  initializeSoundSystem() {
    // Создаем контейнер для выбора звуков если его нет
    this.createSoundSelectionUI();
  }

  createSoundSelectionUI() {
    // Находим категорию звуков
    const audioCategory = document.querySelector('[data-category="audio"]');
    if (!audioCategory) return;

    // Проверяем, не добавлен ли уже блок выбора звуков
    if (document.getElementById("soundSelection")) return;

    const soundSelectionHTML = `
            <div class="sound-selection" id="soundSelection">
                <div class="sound-combobox">
                    <select class="sound-select" id="soundSelect">
                    </select>
                </div>
            </div>
        `;

    // Добавляем после переключателя звуков
    const soundToggle = audioCategory.querySelector("#soundToggle");
    if (soundToggle) {
      soundToggle
        .closest(".setting-item")
        .insertAdjacentHTML("afterend", soundSelectionHTML);
    }

    // Загружаем список звуков
    this.loadSoundOptions();
  }

  loadSoundOptions() {
    const soundSelect = document.getElementById("soundSelect");
    if (!soundSelect) return;

    // Проверяем доступность clickSounds
    if (typeof clickSounds === "undefined" || !clickSounds) {
      soundSelect.innerHTML =
        '<option value="">Ошибка загрузки звуков</option>';
      return;
    }

    const currentSoundId = localStorage.getItem("clickSound") || "pixel6";
    let html = "";

    clickSounds.sounds.forEach((sound) => {
      const isSelected = sound.id === currentSoundId;
      html += `<option value="${sound.id}" ${isSelected ? "selected" : ""}>${sound.name}</option>`;
    });

    soundSelect.innerHTML = html;

    // Добавляем обработчики событий
    this.addSoundEventListeners();
  }

  addSoundEventListeners() {
    const soundSelect = document.getElementById("soundSelect");
    if (!soundSelect) return;

    soundSelect.addEventListener("change", (e) => {
      const soundId = e.target.value;
      this.selectSound(soundId);
    });
  }

  selectSound(soundId) {
    if (!clicker) {
      this.showNotification("Кликер не инициализирован", "error");
      return;
    }

    const success = clicker.changeClickSound(soundId);

    if (success) {
      // Анимация выбора
      const soundSelect = document.getElementById("soundSelect");
      soundSelect.classList.add("sound-selected");
      setTimeout(() => {
        soundSelect.classList.remove("sound-selected");
      }, 300);

      // Получаем человеко-читаемое название звука
      const soundName = this.getSoundDisplayName(soundId);
      this.showNotification(`Звук изменен на: ${soundName}`, "success");
    } else {
      this.showNotification("Ошибка смены звука", "error");
      // Сбрасываем выбор в комбобоксе
      this.loadSoundOptions();
    }
  }

  getSoundDisplayName(soundId) {
    if (typeof clickSounds === "undefined" || !clickSounds) {
      return soundId; // fallback на ID если звуки не загружены
    }

    const sound = clickSounds.sounds.find((s) => s.id === soundId);
    return sound ? sound.name : soundId;
  }

  setupEventListeners() {
    this.settingsBtn.addEventListener("click", () => this.openPopup());
    this.closePopup.addEventListener("click", () => this.closePopupWindow());

    this.settingsPopup.addEventListener("click", (e) => {
      if (e.target === this.settingsPopup && !this.isClosing) {
        this.closePopupWindow();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.settingsPopup.classList.contains("active") &&
        !this.isClosing
      ) {
        this.closePopupWindow();
      }
    });

    this.darkThemeToggle.addEventListener("change", () =>
      this.toggleDarkTheme(),
    );
    this.resetDataBtn.addEventListener("click", () => this.resetAllData());

    if (this.animationsToggle) {
      this.animationsToggle.addEventListener("change", () =>
        this.toggleAnimations(),
      );
    }
    if (this.particlesToggle) {
      this.particlesToggle.addEventListener("change", () =>
        this.toggleParticles(),
      );
    }
    if (this.gradientToggle) {
      this.gradientToggle.addEventListener("change", () =>
        this.toggleGradient(),
      );
    }

    if (this.soundToggle) {
      this.soundToggle.addEventListener("change", () => this.toggleSound());
    }
  }

  // ИСПРАВЛЕННЫЙ МЕТОД: Настройка обработчиков для фона
  setupBackgroundSettings() {
    if (this.backgroundTypeSelect) {
      this.backgroundTypeSelect.addEventListener("change", (e) => {
        this.changeBackgroundType(e.target.value);
      });
    }

    // Обработчики для кликов на превью цветов
    if (this.colorPreview) {
      this.colorPreview.addEventListener("click", () => {
        const currentColor = this.solidColorInput?.value || "#6750a4";
        this.openColorPicker("solid", currentColor);
      });
    }

    // Обработчики для кастомных цветов градиента
    this.gradientColorPreviews.forEach((preview, index) => {
      if (preview) {
        preview.addEventListener("click", () => {
          const currentColor =
            this.gradientColorInputs[index]?.value || "#6750a4";
          this.openColorPicker("gradient", currentColor, index);
        });
      }
    });

    // Скрываем текстовые поля - они теперь только для хранения значений
    this.gradientColorInputs.forEach((input) => {
      if (input) {
        input.style.display = "none";
      }
    });
    if (this.solidColorInput) {
      this.solidColorInput.style.display = "none";
    }
  }

  changeBackgroundType(type) {
    localStorage.setItem("backgroundType", type);
    this.applyBackgroundSettings();

    // Показываем/скрываем соответствующие элементы
    this.toggleBackgroundSettingsVisibility(type);

    // Анимация переключения
    const containers = document.querySelectorAll(
      ".color-picker-container, .custom-gradient-container",
    );
    containers.forEach((container) => {
      if (container.style.display !== "none") {
        container.classList.add("background-type-switch");
        setTimeout(() => {
          container.classList.remove("background-type-switch");
        }, 300);
      }
    });
  }

  toggleBackgroundSettingsVisibility(type) {
    const colorPicker = document.querySelector(".color-picker-container");
    const customGradient = document.querySelector(".custom-gradient-container");

    if (colorPicker) {
      colorPicker.style.display = type === "solid" ? "block" : "none";
    }

    if (customGradient) {
      customGradient.style.display =
        type === "custom-gradient" ? "block" : "none";
    }
  }

  changeSolidColor(color) {
    if (!this.validateHexColor(color)) {
      return;
    }

    localStorage.setItem("solidBackgroundColor", color);
    this.applyBackgroundSettings();

    // Обновляем превью цвета
    if (this.colorPreview) {
      this.colorPreview.style.background = color;
    }
    if (this.solidColorInput) {
      this.solidColorInput.value = color;
    }
  }

  changeGradientColor(index, color) {
    if (!this.validateHexColor(color)) {
      return;
    }

    // Сохраняем цвет в массив
    const gradientColors = JSON.parse(
      localStorage.getItem("customGradientColors") ||
        '["#6750a4", "#b583da", "#e67bd6", "#ff8da1"]',
    );
    gradientColors[index] = color;
    localStorage.setItem(
      "customGradientColors",
      JSON.stringify(gradientColors),
    );

    // Обновляем превью цвета
    if (this.gradientColorPreviews[index]) {
      this.gradientColorPreviews[index].style.background = color;
    }
    if (this.gradientColorInputs[index]) {
      this.gradientColorInputs[index].value = color;
    }

    // Обновляем общий превью градиента
    this.updateGradientPreview();

    // Применяем настройки если выбран кастомный градиент
    if (localStorage.getItem("backgroundType") === "custom-gradient") {
      this.applyBackgroundSettings();
    }
  }

  updateGradientPreview() {
    if (!this.gradientPreview) return;

    const gradientColors = JSON.parse(
      localStorage.getItem("customGradientColors") ||
        '["#6750a4", "#b583da", "#e67bd6", "#ff8da1"]',
    );
    const gradientString = `linear-gradient(45deg, ${gradientColors.join(", ")})`;
    this.gradientPreview.style.background = gradientString;
  }

  validateHexColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  applyBackgroundSettings() {
    const backgroundType = localStorage.getItem("backgroundType") || "gradient";

    switch (backgroundType) {
      case "solid":
        this.applySolidBackground();
        break;
      case "custom-gradient":
        this.applyCustomGradientBackground();
        break;
      case "gradient":
      default:
        this.applyDefaultGradientBackground();
        break;
    }
  }

  applySolidBackground() {
    const solidColor =
      localStorage.getItem("solidBackgroundColor") || "#6750a4";
    document.body.style.background = solidColor;
    document.body.style.backgroundSize = "auto";
    document.body.style.animation = "none";
  }

  applyCustomGradientBackground() {
    const gradientColors = JSON.parse(
      localStorage.getItem("customGradientColors") ||
        '["#6750a4", "#b583da", "#e67bd6", "#ff8da1"]',
    );
    const gradientString = `linear-gradient(-45deg, ${gradientColors.join(", ")})`;

    document.body.style.background = gradientString;
    document.body.style.backgroundSize = "400% 400%";
    document.body.style.animation = "gradient 20s ease infinite";
  }

  applyDefaultGradientBackground() {
    document.body.style.background = `
            linear-gradient(
                -45deg,
                #6750a4,
                #b583da,
                #e67bd6,
                #ff8da1,
                #006a6b,
                #00b3a6,
                #8e24aa,
                #ba68c8
            )
        `;
    document.body.style.backgroundSize = "400% 400%";
    document.body.style.animation = "gradient 20s ease infinite";
  }

  loadBackgroundSettings() {
    // Загружаем настройки фона
    const backgroundType = localStorage.getItem("backgroundType") || "gradient";
    const solidColor =
      localStorage.getItem("solidBackgroundColor") || "#6750a4";
    const gradientColors = JSON.parse(
      localStorage.getItem("customGradientColors") ||
        '["#6750a4", "#b583da", "#e67bd6", "#ff8da1"]',
    );

    // Устанавливаем значения в UI
    if (this.backgroundTypeSelect) {
      this.backgroundTypeSelect.value = backgroundType;
    }

    if (this.solidColorInput) {
      this.solidColorInput.value = solidColor;
    }

    if (this.colorPreview) {
      this.colorPreview.style.background = solidColor;
    }

    // Устанавливаем цвета градиента
    gradientColors.forEach((color, index) => {
      if (this.gradientColorInputs[index]) {
        this.gradientColorInputs[index].value = color;
      }
      if (this.gradientColorPreviews[index]) {
        this.gradientColorPreviews[index].style.background = color;
      }
    });

    // Обновляем превью градиента
    this.updateGradientPreview();

    // Показываем/скрываем соответствующие элементы
    this.toggleBackgroundSettingsVisibility(backgroundType);

    // Применяем настройки
    this.applyBackgroundSettings();
  }

  setupModsEventListeners() {
    if (this.applyModBtn) {
      this.applyModBtn.addEventListener("click", () =>
        this.requestModApplication(),
      );
    }

    if (this.clearModBtn) {
      this.clearModBtn.addEventListener("click", () => this.clearModCode());
    }

    if (this.confirmModYes) {
      this.confirmModYes.addEventListener("click", () =>
        this.executePendingMod(),
      );
    }

    if (this.confirmModNo) {
      this.confirmModNo.addEventListener("click", () =>
        this.cancelModApplication(),
      );
    }

    if (this.modConfirmationModal) {
      this.modConfirmationModal.addEventListener("click", (e) => {
        if (e.target === this.modConfirmationModal) {
          this.cancelModApplication();
        }
      });
    }

    this.settingsBtn.addEventListener("click", () => {
      setTimeout(() => {
        this.loadSavedMod();
        this.updateAutoLoadList();
        this.loadSoundOptions(); // Обновляем список звуков при открытии настроек
      }, 100);
    });
  }

  setupTabs() {
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.tab;
        this.switchTab(tab);
      });
    });
  }

  switchTab(tab) {
    this.tabButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    const activeButton = Array.from(this.tabButtons).find(
      (btn) => btn.dataset.tab === tab,
    );
    if (activeButton) {
      activeButton.classList.add("active");
    }

    this.currentTab = tab;

    this.settingCategories.forEach((category) => {
      const categoryType = category.dataset.category;

      if (tab === "all" || categoryType === tab) {
        category.classList.remove("hidden");
        category.classList.add("tab-switch-animation");

        setTimeout(() => {
          category.classList.remove("tab-switch-animation");
        }, 300);
      } else {
        category.classList.add("hidden");
      }
    });

    // Обновляем список автозагрузки при переключении на вкладку модов
    if (tab === "mods") {
      this.updateAutoLoadList();
    }
  }

  openPopup() {
    if (this.isClosing) return;

    this.settingsPopup.classList.add("active");
    document.body.style.overflow = "hidden";

    this.switchTab("all");
  }

  closePopupWindow() {
    if (this.isClosing) return;

    this.isClosing = true;
    this.settingsPopup.classList.add("popup-closing");

    setTimeout(() => {
      this.settingsPopup.classList.remove("active", "popup-closing");
      document.body.style.overflow = "";
      this.isClosing = false;
    }, 400);
  }

  toggleDarkTheme() {
    const isDark = this.darkThemeToggle.checked;
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
    localStorage.setItem("darkTheme", isDark);
  }

  toggleSound() {
    if (!this.soundToggle) return;
    const isSoundOn = this.soundToggle.checked;
    localStorage.setItem("soundEnabled", isSoundOn);

    if (clicker && clicker.soundPool) {
      clicker.soundPool.forEach((audio) => {
        audio.volume = isSoundOn ? 0.7 : 0;
      });
    }
  }

  toggleAnimations() {
    const animationsEnabled = this.animationsToggle.checked;
    localStorage.setItem("animationsEnabled", animationsEnabled);
    this.applyOptimizationSettings();
  }

  toggleParticles() {
    const particlesEnabled = this.particlesToggle.checked;
    localStorage.setItem("particlesEnabled", particlesEnabled);
    this.applyOptimizationSettings();
  }

  toggleGradient() {
    const gradientEnabled = this.gradientToggle.checked;
    localStorage.setItem("gradientEnabled", gradientEnabled);
    this.applyOptimizationSettings();
  }

  applyOptimizationSettings() {
    const animationsEnabled =
      localStorage.getItem("animationsEnabled") !== "false";
    const particlesEnabled =
      localStorage.getItem("particlesEnabled") !== "false";
    const gradientEnabled = localStorage.getItem("gradientEnabled") !== "false";

    if (animationsEnabled) {
      document.body.classList.remove("no-animations");
    } else {
      document.body.classList.add("no-animations");
    }

    if (gradientEnabled) {
      document.body.style.animation = "gradient 20s ease infinite";
    } else {
      document.body.style.animation = "none";
    }
  }

  resetAllData() {
    if (
      confirm(
        "Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.",
      )
    ) {
      if (clicker) {
        clicker.resetData();
      }
      localStorage.removeItem("clickCount");

      // Сбрасываем настройки фона
      localStorage.removeItem("backgroundType");
      localStorage.removeItem("solidBackgroundColor");
      localStorage.removeItem("customGradientColors");
      this.loadBackgroundSettings();

      // Сбрасываем акцентный цвет
      localStorage.removeItem("accentColor");
      localStorage.removeItem("accentColorName");
      this.loadAccentColor();

      this.resetDataBtn.classList.add("animate-shake");
      setTimeout(() => {
        this.resetDataBtn.classList.remove("animate-shake");
      }, 500);

      // Обновляем интерфейс звуков
      setTimeout(() => {
        this.loadSoundOptions();
      }, 100);
    }
  }

  loadSettings() {
    const darkTheme = localStorage.getItem("darkTheme") === "true";
    this.darkThemeToggle.checked = darkTheme;
    document.documentElement.setAttribute(
      "data-theme",
      darkTheme ? "dark" : "light",
    );

    if (this.soundToggle) {
      const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
      this.soundToggle.checked = soundEnabled;
    }

    if (this.animationsToggle) {
      const animationsEnabled =
        localStorage.getItem("animationsEnabled") !== "false";
      this.animationsToggle.checked = animationsEnabled;
    }
    if (this.particlesToggle) {
      const particlesEnabled =
        localStorage.getItem("particlesEnabled") !== "false";
      this.particlesToggle.checked = particlesEnabled;
    }
    if (this.gradientToggle) {
      const gradientEnabled =
        localStorage.getItem("gradientEnabled") !== "false";
      this.gradientToggle.checked = gradientEnabled;
    }

    this.applyOptimizationSettings();
  }

  parseModMetadata(code) {
    const metadata = {
      name: "Пользовательский мод",
      author: "Неизвестный автор",
      description: "Без описания",
      version: "1.0",
      hasMetadata: false,
      codePreview: code.length > 100 ? code.substring(0, 100) + "..." : code,
    };

    try {
      const lines = code.split("\n");
      let inMetadata = false;

      for (let i = 0; i < Math.min(lines.length, 20); i++) {
        const line = lines[i].trim();

        if (line === "// ==Mod==") {
          inMetadata = true;
          metadata.hasMetadata = true;
          continue;
        }

        if (line === "// ==/Mod==") {
          break;
        }

        if (inMetadata) {
          const nameMatch = line.match(/\/\/\s*@name\s+(.+)/i);
          const authorMatch = line.match(/\/\/\s*@author\s+(.+)/i);
          const descriptionMatch = line.match(/\/\/\s*@description\s+(.+)/i);
          const versionMatch = line.match(/\/\/\s*@version\s+(.+)/i);

          if (nameMatch) metadata.name = nameMatch[1].trim();
          if (authorMatch) metadata.author = authorMatch[1].trim();
          if (descriptionMatch)
            metadata.description = descriptionMatch[1].trim();
          if (versionMatch) metadata.version = versionMatch[1].trim();
        }
      }
    } catch (error) {
      console.warn("Ошибка парсинга мета-информации:", error);
    }

    return metadata;
  }

  showCodePreview(code) {
    if (!this.codePreview) return;

    const metadata = this.parseModMetadata(code);

    if (metadata.hasMetadata) {
      this.codePreview.innerHTML = `
                <div class="mod-metadata-preview">
                    <h4>📋 Информация о моде:</h4>
                    <div><strong>Название:</strong> ${metadata.name}</div>
                    <div><strong>Автор:</strong> ${metadata.author}</div>
                    <div><strong>Версия:</strong> ${metadata.version}</div>
                    <div><strong>Описание:</strong> ${metadata.description}</div>
                </div>
            `;
    } else {
      this.codePreview.textContent = metadata.codePreview;
    }
  }

  requestModApplication() {
    const code = this.customModCode.value.trim();

    if (!code) {
      this.showModStatus("Введите код мода", "error");
      return;
    }

    this.pendingModCode = code;
    this.showCodePreview(code);
    this.showConfirmationModal();
  }

  showConfirmationModal() {
    if (this.modConfirmationModal) {
      this.modConfirmationModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  hideConfirmationModal() {
    if (this.modConfirmationModal) {
      this.modConfirmationModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  executePendingMod() {
    if (!this.pendingModCode) {
      this.hideConfirmationModal();
      return;
    }

    try {
      const result = this.executeModCode(this.pendingModCode);

      if (result && result.success) {
        this.showModStatus("Мод успешно применен!", "success");
        this.saveModCode(this.pendingModCode);

        // Сохраняем мод для автозагрузки если включена галочка
        if (this.autoLoadToggle && this.autoLoadToggle.checked) {
          this.saveAutoLoadMod(this.pendingModCode);
        }
      } else if (result && result.error) {
        this.showModStatus(`Ошибка выполнения: ${result.error}`, "error");
      } else {
        this.showModStatus("Мод применен", "info");
        this.saveModCode(this.pendingModCode);

        // Сохраняем мод для автозагрузки если включена галочка
        if (this.autoLoadToggle && this.autoLoadToggle.checked) {
          this.saveAutoLoadMod(this.pendingModCode);
        }
      }
    } catch (error) {
      this.showModStatus(`Ошибка: ${error.message}`, "error");
      console.error("Mod execution error:", error);
    }

    this.pendingModCode = null;
    this.hideConfirmationModal();
  }

  cancelModApplication() {
    this.pendingModCode = null;
    this.hideConfirmationModal();
    this.showModStatus("Выполнение кода отменено", "info");
  }

  executeModCode(code) {
    const safeGlobals = {
      clicker: clicker,
      storeManager: window.storeManager,
      skinsManager: window.skinsManager,
      storeItems: typeof storeItems !== "undefined" ? storeItems : [],
      localStorage: localStorage,
      console: console,
    };

    try {
      const modFunction = new Function(
        ...Object.keys(safeGlobals),
        `
                try {
                    ${code}
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            `,
      );

      const result = modFunction(...Object.values(safeGlobals));
      return result;
    } catch (error) {
      throw new Error(`Синтаксическая ошибка: ${error.message}`);
    }
  }

  showModStatus(message, type) {
    if (!this.modStatus) return;

    this.modStatus.textContent = message;
    this.modStatus.className = `mod-status ${type}`;
    this.modStatus.style.display = "block";

    if (type === "success" || type === "info") {
      setTimeout(() => {
        if (this.modStatus) {
          this.modStatus.style.display = "none";
        }
      }, 3000);
    }
  }

  clearModCode() {
    if (this.customModCode) {
      this.customModCode.value = "";
    }
    if (this.modStatus) {
      this.modStatus.style.display = "none";
    }

    localStorage.removeItem("customModCode");
    this.showModStatus("Код очищен", "info");
  }

  loadSavedMod() {
    const savedCode = localStorage.getItem("customModCode");
    if (savedCode && this.customModCode) {
      this.customModCode.value = savedCode;
    }
  }

  saveModCode(code) {
    localStorage.setItem("customModCode", code);
  }

  // ==================== СИСТЕМА АВТОЗАГРУЗКИ МОДОВ ====================

  saveAutoLoadMod(code) {
    const metadata = this.parseModMetadata(code);
    const modName = metadata.hasMetadata
      ? metadata.name
      : "Пользовательский мод";

    // Генерируем уникальный ID для мода
    const modId =
      "autoload_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    // Сохраняем мод в localStorage с метаданными
    const modData = {
      id: modId,
      name: modName,
      code: code,
      metadata: metadata,
      timestamp: Date.now(),
    };

    localStorage.setItem(modId, JSON.stringify(modData));

    // Добавляем ID в список автозагружаемых модов
    const autoLoadList = JSON.parse(
      localStorage.getItem("autoLoadMods") || "[]",
    );
    autoLoadList.push(modId);
    localStorage.setItem("autoLoadMods", JSON.stringify(autoLoadList));

    this.showModStatus(
      `Мод "${modName}" сохранен для автозагрузки! 🔄`,
      "success",
    );
    console.log(`💾 Мод сохранен для автозагрузки: ${modName} (${modId})`);

    // Обновляем список автозагрузки
    this.updateAutoLoadList();
  }

  loadAutoLoadMods() {
    const autoLoadList = JSON.parse(
      localStorage.getItem("autoLoadMods") || "[]",
    );

    if (autoLoadList.length === 0) {
      return;
    }

    console.log(`🔄 Загружаем ${autoLoadList.length} модов с автозагрузкой...`);

    // Запускаем загрузку с небольшой задержкой чтобы игра успела инициализироваться
    setTimeout(() => {
      autoLoadList.forEach((modId, index) => {
        setTimeout(() => {
          this.executeAutoLoadMod(modId);
        }, index * 500); // Задержка между выполнением модов
      });
    }, 2000);
  }

  executeAutoLoadMod(modId) {
    const modDataStr = localStorage.getItem(modId);

    if (!modDataStr) {
      console.warn(`❌ Мод для автозагрузки не найден: ${modId}`);
      this.removeFromAutoLoadList(modId);
      return;
    }

    try {
      const modData = JSON.parse(modDataStr);
      console.log(`🚀 Выполняем автозагрузку мода: ${modData.name} (${modId})`);

      const result = this.executeModCode(modData.code);

      if (result && result.success) {
        console.log(`✅ Мод автозагружен успешно: ${modData.name}`);
      } else if (result && result.error) {
        console.error(
          `❌ Ошибка выполнения автозагрузки мода ${modData.name}:`,
          result.error,
        );
        this.removeFromAutoLoadList(modId);
      } else {
        console.log(`✅ Мод автозагружен: ${modData.name}`);
      }
    } catch (error) {
      console.error(`❌ Критическая ошибка автозагрузки мода ${modId}:`, error);
      this.removeFromAutoLoadList(modId);
    }
  }

  removeFromAutoLoadList(modId) {
    const autoLoadList = JSON.parse(
      localStorage.getItem("autoLoadMods") || "[]",
    );
    const updatedList = autoLoadList.filter((id) => id !== modId);
    localStorage.setItem("autoLoadMods", JSON.stringify(updatedList));

    // Удаляем сам мод из localStorage
    localStorage.removeItem(modId);

    console.log(`🗑️ Мод удален из автозагрузки: ${modId}`);

    // Обновляем список
    this.updateAutoLoadList();
  }

  updateAutoLoadList() {
    const autoLoadListContainer = document.getElementById("autoLoadList");
    if (!autoLoadListContainer) return;

    const autoLoadList = JSON.parse(
      localStorage.getItem("autoLoadMods") || "[]",
    );

    if (autoLoadList.length === 0) {
      autoLoadListContainer.innerHTML =
        '<div class="no-mods-message">Нет модов для автозагрузки</div>';
      return;
    }

    let html = '<div class="auto-load-header">Моды для автозагрузки:</div>';

    autoLoadList.forEach((modId) => {
      const modDataStr = localStorage.getItem(modId);
      if (modDataStr) {
        try {
          const modData = JSON.parse(modDataStr);
          html += `
                        <div class="auto-load-item">
                            <div class="auto-load-info">
                                <strong>${modData.name}</strong>
                                ${modData.metadata.hasMetadata ? `<div class="auto-load-meta">v${modData.metadata.version} • ${modData.metadata.author}</div>` : ""}
                            </div>
                            <button class="auto-load-remove" data-modid="${modId}">🗑️</button>
                        </div>
                    `;
        } catch (e) {
          // Если не удалось распарсить, показываем базовую информацию
          html += `
                        <div class="auto-load-item">
                            <div class="auto-load-info">
                                <strong>Неизвестный мод</strong>
                                <div class="auto-load-meta">Ошибка загрузки</div>
                            </div>
                            <button class="auto-load-remove" data-modid="${modId}">🗑️</button>
                        </div>
                    `;
        }
      }
    });

    autoLoadListContainer.innerHTML = html;

    // Добавляем обработчики для кнопок удаления
    autoLoadListContainer
      .querySelectorAll(".auto-load-remove")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const modId = e.target.dataset.modid;
          this.removeFromAutoLoadList(modId);
        });
      });
  }

  // Метод для очистки всех автозагружаемых модов
  clearAllAutoLoadMods() {
    const autoLoadList = JSON.parse(
      localStorage.getItem("autoLoadMods") || "[]",
    );

    autoLoadList.forEach((modId) => {
      localStorage.removeItem(modId);
    });

    localStorage.removeItem("autoLoadMods");
    this.showModStatus("Все автозагружаемые моды очищены! 🗑️", "success");
    console.log("🗑️ Все автозагружаемые моды очищены");

    this.updateAutoLoadList();
  }

  showNotification(message, type = "info") {
    // Создаем уведомление если его нет в DOM
    let notification = document.querySelector(".sound-notification");
    if (!notification) {
      notification = document.createElement("div");
      notification.className = `sound-notification ${type}`;
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
    }

    notification.textContent = message;
    notification.className = `sound-notification ${type}`;

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOutRight 0.3s ease-out forwards";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SettingsManager();
});
