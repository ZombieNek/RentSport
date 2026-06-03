/* получение айди */
function getAdIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}
/*-----------------------------------------------*/

/*поиск объявления через айди */
async function findAdById(adId) {
    // 1. Ищем в пользовательских объявлениях
    const userAds = JSON.parse(localStorage.getItem('rentspot_user_ads') || '[]');
    const userAd = userAds.find(ad => ad.id === adId);
    if (userAd) return { ad: userAd, type: 'user' };

    // 2. Ищем в случайных объявлениях
    const randomAds = JSON.parse(sessionStorage.getItem('rentspot_random_ads') || '[]');
    const randomAd = randomAds.find(ad => ad.id === adId);
    if (randomAd) return { ad: randomAd, type: 'random' };

    return null;
}
/*-----------------------------------------------*/

/* загрузка владельца */
async function enrichWithOwnerData(ad) {
    if (ad.ownerName && ad.ownerAvatar && ad.ownerEmail) return ad;

    try {
        const response = await fetch('https://randomuser.me/api/?results=20');
        if (response.ok) {
            const data = await response.json();
            const users = data.results.map((user, index) => ({
                id: index + 1,
                name: `${user.name.first} ${user.name.last}`,
                avatar: user.picture.medium,
                email: user.email
            }));

            const ownerId = ad.ownerId || Math.floor(Math.random() * 20) + 1;
            const owner = users[(ownerId - 1) % users.length];

            ad.ownerName = owner.name;
            ad.ownerAvatar = owner.avatar;
            ad.ownerEmail = owner.email;
        }
    } catch (error) {
        console.error('Ошибка загрузки владельца:', error);
        ad.ownerName = 'Арендодатель';
        ad.ownerAvatar = 'https://randomuser.me/api/portraits/thumb/men/1.jpg';
        ad.ownerEmail = 'rent@example.com';
    }

    return ad;
}
/*-----------------------------------------------*/

/* получение пользователя */
function getCurrentUser() {
    const savedProfile = localStorage.getItem('rentspot_profile');
    return savedProfile ? JSON.parse(savedProfile) : null;
}
/*-----------------------------------------------*/

/* загрузка похожих объявлений */
async function loadSimilarAds(currentAd) {
    const randomAds = JSON.parse(sessionStorage.getItem('rentspot_random_ads') || '[]');
    const userAds = JSON.parse(localStorage.getItem('rentspot_user_ads') || '[]');
    const allAds = [...randomAds, ...userAds];

    const similar = allAds
        .filter(ad => ad.id !== currentAd.id && ad.category === currentAd.category)
        .slice(0, 4);

    const container = document.getElementById('similarAdsGrid');
    if (!container) return;

    if (similar.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Нет похожих объявлений</p>';
        return;
    }

    container.innerHTML = similar.map(ad => `
        <a href="offer.html?id=${encodeURIComponent(ad.id)}" class="similar-card">
            <img src="${ad.photoData || ad.photoUrl || 'https://picsum.photos/400/300?random=1'}" alt="${escapeHtml(ad.title)}" loading="lazy" onerror="this.src='https://picsum.photos/400/300?random=1'">
            <div class="similar-card-content">
                <div class="similar-card-title">${escapeHtml(ad.title)}</div>
                <div class="similar-card-price">${ad.price} ₽/ч</div>
            </div>
        </a>
    `).join('');
}
/*-----------------------------------------------*/

/* рендер объявления */
function renderOffer(ad) {
    const categoryNames = {
        'сноуборд': 'Сноуборды',
        'скейтборд': 'Скейтборды',
        'коньки': 'Коньки',
        'велосипед': 'Велосипеды',
        'ролики': 'Ролики',
        'самокат': 'Самокаты'
    };

    // Навигация
    document.getElementById('breadcrumbCategory').textContent = categoryNames[ad.category] || 'Объявление';

    // Заголовок и цена
    document.getElementById('offerTitle').textContent = ad.title || 'Без названия';
    document.getElementById('offerPrice').textContent = `${ad.price} ₽/час`;

    // Категория и дата
    document.getElementById('offerCategory').textContent = categoryNames[ad.category] || ad.category || 'Спорттовар';
    if (ad.createdAt) {
        const date = new Date(ad.createdAt);
        document.getElementById('offerDate').textContent = date.toLocaleDateString('ru-RU');
    } else {
        document.getElementById('offerDate').textContent = 'Недавно';
    }

    // Описание
    document.getElementById('offerDescription').textContent = ad.description || 'Описание отсутствует';

    // Фото
    const photoUrl = ad.photoData || ad.photoUrl || 'https://picsum.photos/800/600?random=1';
    document.getElementById('mainPhoto').src = photoUrl;
    document.getElementById('mainPhoto').alt = ad.title;

    // Карта 
    const mapPlaceholder = document.getElementById('mapPlaceholder');
    if (mapPlaceholder && ad.location) {
        mapPlaceholder.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
            <p>${escapeHtml(ad.location)}</p>
            <small>Точное местоположение покажет арендодатель</small>
        `;
    }

    // Владелец
    document.getElementById('ownerName').textContent = ad.ownerName || 'Арендодатель';
    document.getElementById('ownerEmail').textContent = ad.ownerEmail || 'email не указан';

    const ownerAvatar = document.getElementById('ownerAvatar');
    if (ad.ownerAvatar) {
        ownerAvatar.src = ad.ownerAvatar;
    } else {
        const initials = (ad.ownerName || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
        ownerAvatar.src = `https://ui-avatars.com/api/?name=${initials}&background=2563EB&color=fff&size=120`;
    }
    /*-----------------------------------------------*/

    /* кнопки действий */
    const contactBtn = document.getElementById('contactBtn');
    const currentUser = getCurrentUser();
    const isOwner = currentUser && ad.isUserAd && currentUser.email === ad.ownerEmail;
    const sellerActions = document.querySelector('.seller-actions');

    if (isOwner) {
        // Скрываем кнопки для своего объявления
        if (sellerActions) sellerActions.style.display = 'none';

        // Добавляем уведомление
        const sellerCard = document.querySelector('.seller-card');
        if (sellerCard && !sellerCard.querySelector('.owner-notice')) {
            const notice = document.createElement('div');
            notice.className = 'owner-notice';
            notice.innerHTML = `
                <div style="text-align: center; padding: 16px; background: var(--gray-bg); border-radius: 12px; margin-top: 16px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style="margin-top: 8px; font-size: 14px;">📌 Это ваше объявление</p>
                    <p style="font-size: 12px; color: var(--text-secondary);">Вы не можете написать сообщение самому себе</p>
                </div>
            `;
            sellerCard.appendChild(notice);
        }
    } else if (contactBtn) {
        const newContactBtn = contactBtn.cloneNode(true);
        contactBtn.parentNode.replaceChild(newContactBtn, contactBtn);

        newContactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const adId = getAdIdFromUrl();
            const ownerId = ad.ownerId || '1';
            const ownerName = encodeURIComponent(ad.ownerName || 'Арендодатель');
            const ownerAvatar = encodeURIComponent(ad.ownerAvatar || '');
            const adTitle = encodeURIComponent(ad.title || 'Объявление');

            window.location.href = `messages.html?adId=${adId}&ownerId=${ownerId}&ownerName=${ownerName}&ownerAvatar=${ownerAvatar}&adTitle=${adTitle}`;
        });
    }

    // показать телефон
    const callBtn = document.getElementById('callBtn');
    if (callBtn) {
        const newCallBtn = callBtn.cloneNode(true);
        callBtn.parentNode.replaceChild(newCallBtn, callBtn);

        newCallBtn.addEventListener('click', () => {
            showPhoneModal('+7 (999) 123-45-67');
        });
    }
}
/*-----------------------------------------------*/


/* показ состояний */
function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('offerContent').style.display = 'none';
}

function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('offerContent').style.display = 'none';
}

function showContent() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('offerContent').style.display = 'block';
}
/*-----------------------------------------------*/

/*модальное окно телефона */
function showPhoneModal(phoneNumber) {
    const modal = document.getElementById('phoneModal');
    const phoneDisplay = document.getElementById('phoneNumberDisplay');
    const callLink = document.getElementById('callPhoneLink');
    const closeBtn = document.querySelector('.phone-modal-close');

    phoneDisplay.textContent = phoneNumber;
    callLink.href = `tel:${phoneNumber.replace(/[\s\(\)\-]/g, '')}`;
    modal.style.display = 'flex';

    // Обработчик копирования номера
    if (phoneDisplay._clickHandler) {
        phoneDisplay.removeEventListener('click', phoneDisplay._clickHandler);
    }
    phoneDisplay._clickHandler = () => {
        navigator.clipboard.writeText(phoneNumber)
            .then(() => showCopyTooltip('Номер скопирован!'))
            .catch(() => alert('Не удалось скопировать номер'));
    };
    phoneDisplay.addEventListener('click', phoneDisplay._clickHandler);

    // Закрытие модалки
    const closeModal = () => modal.style.display = 'none';
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}
/*-----------------------------------------------*/

/* копирование номера */
function showCopyTooltip(message) {
    const oldTooltip = document.querySelector('.copy-tooltip');
    if (oldTooltip) oldTooltip.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'copy-tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);

    setTimeout(() => tooltip.classList.add('show'), 10);
    setTimeout(() => {
        tooltip.classList.remove('show');
        setTimeout(() => tooltip.remove(), 300);
    }, 1500);
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

/* запуск страницы */
async function init() {
    showLoading();

    const adId = getAdIdFromUrl();
    if (!adId) {
        showError();
        return;
    }

    const result = await findAdById(adId);
    if (!result || !result.ad) {
        showError();
        return;
    }

    let ad = result.ad;
    if (result.type === 'random' && (!ad.ownerName || !ad.ownerAvatar)) {
        ad = await enrichWithOwnerData(ad);
        const randomAds = JSON.parse(sessionStorage.getItem('rentspot_random_ads') || '[]');
        const index = randomAds.findIndex(a => a.id === ad.id);
        if (index !== -1) {
            randomAds[index] = ad;
            sessionStorage.setItem('rentspot_random_ads', JSON.stringify(randomAds));
        }
    }

    renderOffer(ad);
    await loadSimilarAds(ad);
    showContent();
}
/*-----------------------------------------------*/

/* темная тема */
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('rentspot_dark_theme', document.body.classList.contains('dark-theme'));
    });

    const savedTheme = localStorage.getItem('rentspot_dark_theme');
    if (savedTheme === 'true') document.body.classList.add('dark-theme');
}
/*-----------------------------------------------*/

document.addEventListener('DOMContentLoaded', init);