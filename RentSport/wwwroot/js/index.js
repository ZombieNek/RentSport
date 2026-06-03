

/* глоабльыне константы и переменные */
let allAds = [];
let currentCategory = 'all';
let currentSort = 'default';
let searchQuery = '';

const categories = ['all', 'сноуборд', 'скейтборд', 'коньки', 'велосипед', 'ролики', 'самокат'];

const categoryNames = {
    'all': 'Все',
    'сноуборд': 'Сноуборд',
    'скейтборд': 'Скейтборд',
    'коньки': 'Коньки',
    'велосипед': 'Велосипед',
    'ролики': 'Ролики',
    'самокат': 'Самокат'
};
/*-----------------------------------------------*/

/* разделение фото по категориям */
const categoryToFolder = {
    'сноуборд': 'snowboard',
    'скейтборд': 'skates',
    'коньки': 'ski',
    'велосипед': 'bike',
    'ролики': 'roller',
    'самокат': 'scooter'
};

const folderImageCount = {
    'snowboard': 5,
    'skates': 5,
    'ski': 5,
    'bike': 5,
    'roller': 5,
    'scooter': 5
};

function getRandomImageForCategory(category) {
    const folder = categoryToFolder[category];
    if (!folder) {
        console.warn('Неизвестная категория:', category);
        return 'images/snowboard/1.jpg';
    }
    const maxImages = folderImageCount[folder];
    const randomNum = Math.floor(Math.random() * maxImages) + 1;
    return `images/${folder}/${randomNum}.jpg`;
}
/*-----------------------------------------------*/

/* данные для генерации объявлений */
const titlesByCategory = {
    'сноуборд': [
        'Сноуборд Burton ',
        'Сноуборд Snow Tech',
        'Сдам сноуборд не дорого',
        'Сноуборд женский',
        'Сноуборд Nitro',
        'Сноуборд Jones',
        'Сноуборд Arbor'
    ],
    'скейтборд': [
        'Скейтборд Element',
        'Скейтборд Santa Cruz',
        'Скейтборд',
        'Доска детская',
        'Скейтборд для трюков',
        'Скейтборд Penny',
        'Сдам скейтборд'
    ],
    'коньки': [
        'Коньки',
        'Сдам хойкейные коньки',
        'Коньки женские',
        'Детские коньки',
        'Коньки для хоккея',
        'Коньки профессиональные',
        'Коньки дешево'
    ],
    'велосипед': [
        'Велосипед скоростной',
        'Шоссейный велосипед',
        'Электровелосипед',
        'Трюковой велосипед',
        'Сдам велосипед дешево',
        'Горный велосипед ',
        'Складной велосипед'
    ],
    'ролики': [
        'Роликовые коньки Seba',
        'Ролики Powerslide',
        'Ролики дешево',
        'Ролики детские',
        'Ролики Roces',
        'Сдам ролики',
        'Ролики мужские'
    ],
    'самокат': [
        'Самокат Ninebot',
        'Самокат для детей',
        'Трюковой самокат',
        'Сдам детский самокат',
        'Электросамокат',
        'Самокат городской',
        'Самокат с доставкой'
    ]
};

const locations = [
    'Москва, Парк Горького',
    'Санкт-Петербург, Крестовский остров',
    'Сочи, Красная Поляна',
    'Казань, Кремлёвская набережная',
    'Екатеринбург, Центральный парк',
    'Новосибирск, Заельцовский парк',
    'Краснодар, Парк Галицкого',
    'Нижний Новгород, Верхневолжская набережная',
    'Ростов-на-Дону, Парк Левобережный',
    'Самара, Набережная'
];
/*-----------------------------------------------*/

/* вспомогательные функции */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function declension(n, one, few, many) {
    n = Math.abs(n) % 100;
    if (n >= 5 && n <= 20) return many;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return few;
    return many;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
/*-----------------------------------------------*/

/* работа с api */
let cachedUsers = null;

async function loadUsers() {
    if (cachedUsers) return cachedUsers;

    const stored = sessionStorage.getItem('rentspot_users');
    if (stored) {
        cachedUsers = JSON.parse(stored);
        return cachedUsers;
    }

    try {
        const response = await fetch('https://randomuser.me/api/?results=15');
        if (!response.ok) throw new Error('Ошибка загрузки пользователей');
        const data = await response.json();

        cachedUsers = data.results.map((user, index) => ({
            id: index + 1,
            name: `${user.name.first} ${user.name.last}`,
            avatar: user.picture.thumbnail,
            email: user.email
        }));

        sessionStorage.setItem('rentspot_users', JSON.stringify(cachedUsers));
        return cachedUsers;
    } catch (error) {
        console.error('API Error:', error);
        cachedUsers = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Арендодатель ${i + 1}`,
            avatar: `https://randomuser.me/api/portraits/thumb/men/${(i % 50) + 1}.jpg`,
            email: `user${i + 1}@example.com`
        }));
        sessionStorage.setItem('rentspot_users', JSON.stringify(cachedUsers));
        return cachedUsers;
    }
}
/*-----------------------------------------------*/

/* работа с хранилищем */
function loadUserAds() {
    const stored = localStorage.getItem('rentspot_user_ads');
    return stored ? JSON.parse(stored) : [];
}
/*-----------------------------------------------*/

/* генерация обх\ъявлений */
function generateRandomAds(count = 15) {
    const ads = [];
    const availableCategories = ['сноуборд', 'скейтборд', 'коньки', 'велосипед', 'ролики', 'самокат'];

    for (let i = 0; i < count; i++) {
        const category = getRandomItem(availableCategories);
        const title = getRandomItem(titlesByCategory[category]);
        const price = getRandomInt(100, 3000);
        const location = getRandomItem(locations);

        ads.push({
            id: `random_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 8)}`,
            title: title,
            category: category,
            price: price,
            location: location,
            lat: 55.751244 + (Math.random() - 0.5) * 0.2,
            lng: 37.618423 + (Math.random() - 0.5) * 0.2,
            photoUrl: getRandomImageForCategory(category),
            ownerId: getRandomInt(1, 15),
            ownerName: '',
            ownerAvatar: '',
            isRandom: true,
            createdAt: new Date(Date.now() - getRandomInt(0, 30) * 86400000).toISOString()
        });
    }
    return ads;
}
/*-----------------------------------------------*/

/* загрузка обявлений */
async function loadAllAds() {
    const grid = document.getElementById('adsGrid');
    if (grid) {
        grid.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>Загрузка объявлений...</p></div>`;
    }

    const users = await loadUsers();
    const randomAds = generateRandomAds(15);

    randomAds.forEach(ad => {
        const owner = users[(ad.ownerId - 1) % users.length];
        ad.ownerName = owner.name;
        ad.ownerAvatar = owner.avatar;
        ad.ownerEmail = owner.email;
    });

    sessionStorage.setItem('rentspot_random_ads', JSON.stringify(randomAds));

    let userAds = loadUserAds();
    let currentUser = null;
    const savedProfile = localStorage.getItem('rentspot_profile');

    if (savedProfile) {
        currentUser = JSON.parse(savedProfile);
    } else if (users.length > 0) {
        currentUser = users[0];
    }

    if (userAds.length > 0 && currentUser) {
        userAds = userAds.map(ad => {
            const updatedAd = { ...ad };
            if (!updatedAd.photoData && !updatedAd.photoUrl) {
                updatedAd.photoData = null;
            }
            updatedAd.ownerName = currentUser.fullName || currentUser.name || 'Пользователь';
            updatedAd.ownerAvatar = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedAd.ownerName)}&background=2563EB&color=fff&size=120`;
            updatedAd.ownerEmail = currentUser.email || '';
            updatedAd.isUserAd = true;
            return updatedAd;
        });
        localStorage.setItem('rentspot_user_ads', JSON.stringify(userAds));
    }

    allAds = shuffleArray([...randomAds, ...userAds]);
    return allAds;
}
/*-----------------------------------------------*/

/* фильтрация и сортировка */
function filterAds() {
    let filtered = [...allAds];

    if (currentCategory !== 'all') {
        filtered = filtered.filter(ad => ad.category === currentCategory);
    }

    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(ad =>
            ad.title.toLowerCase().includes(query) ||
            ad.location.toLowerCase().includes(query)
        );
    }

    switch (currentSort) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'title-asc':
            filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
            break;
        case 'title-desc':
            filtered.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
            break;
        default:
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
}
/*-----------------------------------------------*/

/* рендер карточек */
function renderAds() {
    const filtered = filterAds();
    const grid = document.getElementById('adsGrid');
    const resultsCount = document.getElementById('resultsCount');

    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="loading-spinner"><p>😕 Ничего не найдено<br>Попробуйте изменить фильтры</p></div>`;
        if (resultsCount) resultsCount.textContent = '0 объявлений';
        return;
    }

    if (resultsCount) {
        resultsCount.textContent = `${filtered.length} ${declension(filtered.length, 'объявление', 'объявления', 'объявлений')}`;
    }

    grid.innerHTML = filtered.map(ad => `
        <a href="offer.html?id=${encodeURIComponent(ad.id)}" class="ad-card" data-id="${ad.id}">
            <div class="card-image">
                <img src="${ad.photoData || ad.photoUrl || 'images/snowboard/1.jpg'}" alt="${escapeHtml(ad.title)}" loading="lazy" onerror="this.src='/images/snowboard/1.jpg'">
            </div>
            <div class="card-content">
                <div class="card-title">
                    <span>${escapeHtml(ad.title)}</span>
                    <span class="card-price">${ad.price} ₽/ч</span>
                </div>
                <div class="card-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${escapeHtml(ad.location)}
                </div>
                <div class="card-owner">
                    <img src="${ad.ownerAvatar}" class="owner-avatar" alt="" onerror="this.src='https://randomuser.me/api/portraits/thumb/men/1.jpg'">
                    <span class="owner-name">${escapeHtml(ad.ownerName)}</span>
                </div>
            </div>
        </a>
    `).join('');
}
/*-----------------------------------------------*/

/* рендер категорий */
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
        <button class="category ${currentCategory === cat ? 'active' : ''}" data-category="${cat}">
            ${categoryNames[cat]}
        </button>
    `).join('');

    document.querySelectorAll('.category').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            renderCategories();
            renderAds();
        });
    });
}
/*-----------------------------------------------*/

/* запуск сраницы */
async function init() {
    await loadAllAds();
    renderCategories();
    renderAds();

    // Поиск
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderAds();
        });
    }

    // Кнопки сортировки
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSort = btn.dataset.sort;
            renderAds();
        });
    });

    // Сброс фильтров
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentCategory = 'all';
            searchQuery = '';
            currentSort = 'default';
            const searchInputEl = document.getElementById('searchInput');
            if (searchInputEl) searchInputEl.value = '';
            renderCategories();
            renderAds();
        });
    }

    // Тёмная тема
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('rentspot_dark_theme', document.body.classList.contains('dark-theme'));
        });
        const savedTheme = localStorage.getItem('rentspot_dark_theme');
        if (savedTheme === 'true') document.body.classList.add('dark-theme');
    }

    // Плавающая кнопка 
    const fab = document.getElementById('fabButton');
    if (fab) {
        const checkMobile = () => {
            fab.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
    }
}
/*-----------------------------------------------*/

document.addEventListener('DOMContentLoaded', init);
