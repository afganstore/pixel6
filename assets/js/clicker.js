class PixelClicker {
  constructor() {
    this.counter = document.getElementById("counter");
    this.clickImage = document.getElementById("clickImage");
    this.settingsBtn = document.getElementById("settingsBtn");
    this.soundPool = [];
    this.poolSize = 5;

    this.loadCount();
    this.setupEventListeners();
    this.initializeSoundPool();
    this.updateDisplay();
    this.startContinuousGradient();
    this.loadImageSetting();
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

  loadImageSetting() {
    const savedImage = localStorage.getItem("clickImage") || "p6.png";
    this.clickImage.src = `assets/images/${savedImage}`;
  }

  changeImage(imageName) {
    this.clickImage.src = `assets/images/${imageName}`;
    localStorage.setItem("clickImage", imageName);
  }

  resetData() {
    this.count = 0;
    this.saveCount();
    this.updateDisplay();
  }

  getIncrementValue() {
    return 1;
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

// Глобальная переменная для доступа из settings.js
let clicker;

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  clicker = new PixelClicker();
});
