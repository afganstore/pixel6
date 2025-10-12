// База данных магазина скинов и прокачки
const storeItems = [
  {
    id: "p6",
    name: "Pixel 6",
    description: "<strong><em>у меня пиксель 6</strong></em>",
    image: "p6.png",
    price: 0, // Бесплатный
    type: "skin",
  },
  {
    id: "esha",
    name: "Еша",
    description: "Кот <b>афгана</b>",
    image: "esha.png",
    price: 1000,
    type: "skin",
  },
  {
    id: "eshagold",
    name: "Золотой Еша",
    description: "Кот <b>афгана</b>, но <strong>ЗОЛОТОЙ!</strong>",
    image: "goldesha.png",
    price: 10000,
    type: "skin",
  },
  {
    id: "iphone11",
    name: "iPhone 11",
    description: "<strong>шотает все флагманы</strong>",
    image: "11.png",
    price: 5000,
    type: "skin",
  },
  {
    id: "upgrade_10",
    name: "Прокачка +10",
    description:
      "Увеличивает множитель кликов<br>Текущий множитель: <span id='currentMultiplier'>1</span><br>Максимум: <span style='color: #ff4444'>+1000</span> за клик",
    image: "upgrade.png",
    price: 1000,
    type: "upgrade",
    multiplier: 10,
    maxLevel: 100,
  },
];
