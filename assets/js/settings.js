class SettingsManager {
  constructor() {
    this.settingsPopup = document.getElementById("settingsPopup");
    this.settingsBtn = document.getElementById("settingsBtn");
    this.closePopup = document.getElementById("closePopup");
    this.darkThemeToggle = document.getElementById("darkThemeToggle");
    this.resetDataBtn = document.getElementById("resetData");
    this.imageOptions = document.querySelectorAll(".image-option");

    this.init();
  }

  init() {
    this.loadSettings();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Открытие/закрытие popup
    this.settingsBtn.addEventListener("click", () => this.openPopup());
    this.closePopup.addEventListener("click", () => this.closePopupWindow());

    // Закрытие по клику вне popup
    this.settingsPopup.addEventListener("click", (e) => {
      if (e.target === this.settingsPopup) {
        this.closePopupWindow();
      }
    });

    // Закрытие по ESC
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        this.settingsPopup.classList.contains("active")
      ) {
        this.closePopupWindow();
      }
    });

    // Настройки
    this.darkThemeToggle.addEventListener("change", () =>
      this.toggleDarkTheme(),
    );
    this.resetDataBtn.addEventListener("click", () => this.resetAllData());

    // Выбор изображения
    this.imageOptions.forEach((option) => {
      option.addEventListener("click", () => this.selectImage(option));
    });
  }

  openPopup() {
    this.settingsPopup.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closePopupWindow() {
    this.settingsPopup.classList.remove("active");
    document.body.style.overflow = "";
  }

  toggleDarkTheme() {
    const isDark = this.darkThemeToggle.checked;
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
    localStorage.setItem("darkTheme", isDark);
  }

  selectImage(option) {
    const imageName = option.dataset.image;

    // Обновляем активный класс
    this.imageOptions.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");

    // Меняем изображение в кликере
    if (clicker) {
      clicker.changeImage(imageName);
    }

    localStorage.setItem("selectedImage", imageName);
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
      this.closePopupWindow();
    }
  }

  loadSettings() {
    // Загрузка темы
    const darkTheme = localStorage.getItem("darkTheme") === "true";
    this.darkThemeToggle.checked = darkTheme;
    document.documentElement.setAttribute(
      "data-theme",
      darkTheme ? "dark" : "light",
    );

    // Загрузка выбранного изображения
    const selectedImage = localStorage.getItem("selectedImage") || "p6.png";
    this.imageOptions.forEach((option) => {
      if (option.dataset.image === selectedImage) {
        option.classList.add("active");
      }
    });
  }
}

// Инициализация менеджера настроек
document.addEventListener("DOMContentLoaded", () => {
  new SettingsManager();
});
