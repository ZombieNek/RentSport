
/* глобальные переменные */
let currentProfile = null;
let userAds = [];
let isEditingProfile = false;

// DOM элементы
const profileFormSection = document.getElementById('profileFormSection');
const profileInfoSection = document.getElementById('profileInfoSection');
const profileForm = document.getElementById('profileForm');
const myAdsGrid = document.getElementById('myAdsGrid');
const adModal = document.getElementById('adModal');
const adForm = document.getElementById('adForm');

/*-----------------------------------------------*/

/* функции ошибок */
function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        errorDiv.style.display = 'block';
    }
}

function hideError(elementId) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.classList.remove('show');
        errorDiv.style.display = 'none';
    }
}
/*-----------------------------------------------*/

/* валидация формы профиля */
function validateProfileForm() {
    let isValid = true;

    const fullName = document.getElementById('fullName')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const city = document.getElementById('city')?.value.trim() || '';

    // Имя
    if (!fullName) {
        showError('nameError', 'Имя обязательно');
        isValid = false;
    } else if (fullName.length < 2) {
        showError('nameError', 'Минимум 2 символа');
        isValid = false;
    } else if (fullName.length > 50) {
        showError('nameError', 'Максимум 50 символов');
        isValid = false;
    } else if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(fullName)) {
        showError('nameError', 'Только буквы, пробелы и дефисы');
        isValid = false;
    } else {
        hideError('nameError');
    }

    // Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
        showError('emailError', 'Email обязателен');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError('emailError', 'Введите корректный email (user@example.com)');
        isValid = false;
    } else {
        hideError('emailError');
    }

    // Телефон
    const phoneRegex = /^[\d\+][\d\(\)\-\s]{8,20}$/;
    if (!phone) {
        showError('phoneError', 'Телефон обязателен');
        isValid = false;
    } else if (!phoneRegex.test(phone)) {
        showError('phoneError', 'Введите номер телефона (например, +79991234567)');
        isValid = false;
    } else {
        hideError('phoneError');
    }

    // Город
    if (!city) {
        showError('cityError', 'Город обязателен');
        isValid = false;
    } else if (city.length < 2) {
        showError('cityError', 'Минимум 2 символа');
        isValid = false;
    } else {
        hideError('cityError');
    }

    return isValid;
}
/*-----------------------------------------------*/

/* валидация формы объявления */
function validateAdForm() {
    let isValid = true;

    const title = document.getElementById('adTitle')?.value.trim() || '';
    const category = document.getElementById('adCategory')?.value || '';
    const price = document.getElementById('adPrice')?.value || '';
    const location = document.getElementById('adLocation')?.value.trim() || '';

    // Название
    if (!title) {
        showError('adTitleError', 'Название обязательно');
        isValid = false;
    } else if (title.length < 3) {
        showError('adTitleError', 'Минимум 3 символа');
        isValid = false;
    } else if (title.length > 100) {
        showError('adTitleError', 'Максимум 100 символов');
        isValid = false;
    } else {
        hideError('adTitleError');
    }

    // Категория
    if (!category) {
        showError('adCategoryError', 'Выберите категорию');
        isValid = false;
    } else {
        hideError('adCategoryError');
    }

    // Цена
    const priceNum = parseInt(price);
    if (!price) {
        showError('adPriceError', 'Цена обязательна');
        isValid = false;
    } else if (isNaN(priceNum) || priceNum <= 0) {
        showError('adPriceError', 'Цена должна быть больше 0');
        isValid = false;
    } else if (priceNum > 100000) {
        showError('adPriceError', 'Цена не может превышать 100 000 ₽');
        isValid = false;
    } else {
        hideError('adPriceError');
    }

    // Локация
    if (!location) {
        showError('adLocationError', 'Укажите локацию');
        isValid = false;
    } else if (location.length < 2) {
        showError('adLocationError', 'Минимум 2 символа');
        isValid = false;
    } else {
        hideError('adLocationError');
    }

    // Фото (обязательно)
    const fileInput = document.getElementById('adImageFile');
    const photoDataInput = document.getElementById('adPhotoData');
    const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
    const hasPhotoData = photoDataInput && photoDataInput.value && photoDataInput.value.length > 0;
    const uploadArea = document.getElementById('imageUploadArea');
    const photoErrorDiv = document.getElementById('adPhotoError');

    if (!hasFile && !hasPhotoData) {
        if (photoErrorDiv) {
            photoErrorDiv.textContent = '❌ Добавьте фото товара';
            photoErrorDiv.style.display = 'block';
            photoErrorDiv.style.color = '#EF4444';
            photoErrorDiv.classList.add('show');
        }
        if (uploadArea) {
            uploadArea.classList.add('error');
            uploadArea.style.borderColor = '#EF4444';
            uploadArea.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
        }
        isValid = false;
    } else {
        if (photoErrorDiv) {
            photoErrorDiv.textContent = '';
            photoErrorDiv.style.display = 'none';
            photoErrorDiv.classList.remove('show');
        }
        if (uploadArea) {
            uploadArea.classList.remove('error');
            uploadArea.style.borderColor = '';
            uploadArea.style.backgroundColor = '';
        }
    }

    return isValid;
}
/*-----------------------------------------------*/

/* валидация при потере фокуса */
function validateAdField(fieldName) {
    let error = '';
    let isValid = true;

    switch (fieldName) {
        case 'title':
            const title = document.getElementById('adTitle')?.value.trim() || '';
            if (!title) error = 'Название обязательно';
            break;
        case 'category':
            const category = document.getElementById('adCategory')?.value || '';
            if (!category) error = 'Выберите категорию';
            break;
        case 'price':
            const price = document.getElementById('adPrice')?.value || '';
            if (!price || price <= 0) error = 'Введите цену больше 0';
            break;
        case 'location':
            const location = document.getElementById('adLocation')?.value.trim() || '';
            if (!location) error = 'Укажите локацию';
            break;
    }

    const errorDiv = document.getElementById(`ad${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Error`);
    const input = document.getElementById(`ad${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`);

    if (error) {
        if (errorDiv) {
            errorDiv.textContent = error;
            errorDiv.classList.add('show');
        }
        if (input) input.classList.add('error');
        isValid = false;
    } else {
        if (errorDiv) errorDiv.classList.remove('show');
        if (input) input.classList.remove('error');
    }

    checkAdSubmitButton();
    return isValid;
}
/*-----------------------------------------------*/

/* блокировка кнопки сохранить */
function checkAdSubmitButton() {
    const title = document.getElementById('adTitle')?.value.trim() || '';
    const category = document.getElementById('adCategory')?.value || '';
    const price = document.getElementById('adPrice')?.value || '';
    const location = document.getElementById('adLocation')?.value.trim() || '';
    const hasFile = document.getElementById('adImageFile')?.files?.length > 0;
    const hasPhotoData = document.getElementById('adPhotoData')?.value?.length > 0;
    const hasPhoto = hasFile || hasPhotoData;
    const submitBtn = document.querySelector('#adForm .btn-primary');

    const isValid = title && category && price > 0 && location && hasPhoto;
    if (submitBtn) submitBtn.disabled = !isValid;

    const photoErrorDiv = document.getElementById('adPhotoError');
    const uploadArea = document.getElementById('imageUploadArea');

    if (!hasPhoto && (title || category || price || location)) {
        if (photoErrorDiv) {
            photoErrorDiv.textContent = '❌ Добавьте фото товара';
            photoErrorDiv.style.display = 'block';
        }
        if (uploadArea) uploadArea.classList.add('error');
    } else if (hasPhoto) {
        if (photoErrorDiv) {
            photoErrorDiv.textContent = '';
            photoErrorDiv.style.display = 'none';
        }
        if (uploadArea) uploadArea.classList.remove('error');
    }
}
/*-----------------------------------------------*/

/* првоерка фото перед отправкой */
function validatePhotoBeforeSubmit() {
    const fileInput = document.getElementById('adImageFile');
    const photoData = document.getElementById('adPhotoData').value;
    const errorDiv = document.getElementById('adPhotoError');
    const uploadArea = document.getElementById('imageUploadArea');

    const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
    const hasPhotoData = photoData && photoData.length > 0;

    if (!hasFile && !hasPhotoData) {
        if (errorDiv) {
            errorDiv.textContent = '❌ Добавьте фото товара';
            errorDiv.style.display = 'block';
            errorDiv.style.color = '#EF4444';
        }
        if (uploadArea) {
            uploadArea.classList.add('error');
            uploadArea.style.borderColor = '#EF4444';
            uploadArea.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
        }
        return false;
    } else {
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
        if (uploadArea) {
            uploadArea.classList.remove('error');
            uploadArea.style.borderColor = '';
            uploadArea.style.backgroundColor = '';
        }
        return true;
    }
}
/*-----------------------------------------------*/

/* загрузка фото в объявление */
function setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const fileInput = document.getElementById('adImageFile');
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removeImageBtn');
    const photoDataInput = document.getElementById('adPhotoData');

    if (!uploadArea) return;

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0]);
            checkAdSubmitButton();
            validatePhotoBeforeSubmit();
        }
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0]);
            checkAdSubmitButton();
            validatePhotoBeforeSubmit();
        }
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (photoDataInput) photoDataInput.value = '';
            if (previewDiv) previewDiv.style.display = 'none';
            if (uploadArea) uploadArea.style.display = 'block';
            if (fileInput) fileInput.value = '';
            checkAdSubmitButton();
            validatePhotoBeforeSubmit();
        });
    }
}

function handleImageFile(file) {
    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
        alert('Пожалуйста, выберите файл в формате JPEG или PNG');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImg = document.getElementById('previewImg');
        const previewDiv = document.getElementById('imagePreview');
        const uploadArea = document.getElementById('imageUploadArea');
        const photoDataInput = document.getElementById('adPhotoData');

        previewImg.src = e.target.result;
        previewDiv.style.display = 'block';
        uploadArea.style.display = 'none';
        photoDataInput.value = e.target.result;
    };
    reader.readAsDataURL(file);
}
/*-----------------------------------------------*/

/* управление прфоилем */
function loadProfile() {
    const saved = localStorage.getItem('rentspot_profile');
    if (saved) {
        currentProfile = JSON.parse(saved);
        showProfileInfo();
    } else {
        showProfileForm(false);
    }
}

function showProfileForm(isEditing = false) {
    isEditingProfile = isEditing;
    if (profileFormSection) profileFormSection.style.display = 'block';
    if (profileInfoSection) profileInfoSection.style.display = 'none';

    const formTitle = document.getElementById('profileFormTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');

    if (isEditing && currentProfile) {
        if (formTitle) formTitle.textContent = 'Редактирование профиля';
        if (submitBtn) submitBtn.textContent = 'Сохранить изменения';
        if (cancelBtn) cancelBtn.style.display = 'block';
        document.getElementById('fullName').value = currentProfile.fullName || '';
        document.getElementById('email').value = currentProfile.email || '';
        document.getElementById('phone').value = currentProfile.phone || '';
        document.getElementById('city').value = currentProfile.city || '';
        document.getElementById('bio').value = currentProfile.bio || '';
    } else {
        if (formTitle) formTitle.textContent = 'Создание профиля';
        if (submitBtn) submitBtn.textContent = 'Создать профиль';
        if (cancelBtn) cancelBtn.style.display = 'none';
        document.getElementById('fullName').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('city').value = '';
        document.getElementById('bio').value = '';
    }
}

function showProfileInfo() {
    if (profileFormSection) profileFormSection.style.display = 'none';
    if (profileInfoSection) profileInfoSection.style.display = 'block';

    if (currentProfile) {
        document.getElementById('profileName').textContent = currentProfile.fullName || '';
        document.getElementById('profileEmail').textContent = currentProfile.email || '';
        document.getElementById('profilePhone').textContent = currentProfile.phone || '';
        document.getElementById('profileCity').textContent = currentProfile.city || '';
        document.getElementById('profileBio').textContent = currentProfile.bio || 'Пользователь ничего не рассказал о себе';

        const avatar = document.getElementById('profileAvatar');
        if (currentProfile.avatar && currentProfile.avatar.startsWith('data:image')) {
            avatar.src = currentProfile.avatar;
        } else if (currentProfile.avatar && currentProfile.avatar.startsWith('http')) {
            avatar.src = currentProfile.avatar;
        } else {
            const initials = (currentProfile.fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
            avatar.src = `https://ui-avatars.com/api/?name=${initials}&background=2563EB&color=fff&size=120`;
        }
    }

    loadUserAds();
}

function saveProfile(profileData) {
    localStorage.setItem('rentspot_profile', JSON.stringify(profileData));
    currentProfile = profileData;
}

// Обработчик отправки формы профиля
if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateProfileForm()) return;
        const profile = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            city: document.getElementById('city').value.trim(),
            bio: document.getElementById('bio').value.trim() || '',
            avatar: currentProfile?.avatar || null,
            createdAt: currentProfile?.createdAt || new Date().toISOString()
        };
        saveProfile(profile);
        showProfileInfo();
    });
}

// Кнопки редактирования и отмены
document.getElementById('editProfileBtn')?.addEventListener('click', () => showProfileForm(true));
document.getElementById('cancelEditBtn')?.addEventListener('click', () => showProfileInfo());

/*-----------------------------------------------*/

/* управление объявлениями */
function loadUserAds() {
    const saved = localStorage.getItem('rentspot_user_ads');
    userAds = saved ? JSON.parse(saved) : [];
    renderMyAds();
}

function saveUserAds() {
    localStorage.setItem('rentspot_user_ads', JSON.stringify(userAds));
    renderMyAds();
}

function renderMyAds() {
    if (!myAdsGrid) return;
    if (userAds.length === 0) {
        myAdsGrid.innerHTML = `<div class="loading-spinner"><p>😕 У вас пока нет объявлений<br>Создайте первое объявление!</p></div>`;
        return;
    }
    myAdsGrid.innerHTML = userAds.map(ad => `
        <a href="offer.html?id=${encodeURIComponent(ad.id)}" class="ad-card" data-id="${ad.id}">
            <div class="card-image">
                <img src="${ad.photoData || 'https://picsum.photos/400/300?random=1'}" alt="${escapeHtml(ad.title)}" loading="lazy" onerror="this.src='https://picsum.photos/400/300?random=1'">
            </div>
            <div class="card-content">
                <div class="card-title">
                    <span>${escapeHtml(ad.title)}</span>
                    <span class="card-price">${ad.price} ₽/ч</span>
                </div>
                <div class="card-location">
                    📍 ${escapeHtml(ad.location)}
                </div>
                <div class="card-actions">
                    <button class="edit-ad-btn" data-id="${ad.id}" onclick="event.preventDefault(); event.stopPropagation(); editAd('${ad.id}')">✎ Редактировать</button>
                    <button class="delete-ad-btn" data-id="${ad.id}" onclick="event.preventDefault(); event.stopPropagation(); deleteAd('${ad.id}')">🗑 Удалить</button>
                </div>
            </div>
        </a>
    `).join('');
}

function editAd(id) {
    const ad = userAds.find(a => a.id === id);
    if (!ad) return;
    document.getElementById('modalTitle').textContent = 'Редактирование объявления';
    document.getElementById('adId').value = ad.id;
    document.getElementById('adTitle').value = ad.title || '';
    document.getElementById('adCategory').value = ad.category || '';
    document.getElementById('adPrice').value = ad.price || '';
    document.getElementById('adLocation').value = ad.location || '';
    document.getElementById('adDescription').value = ad.description || '';
    const uploadArea = document.getElementById('imageUploadArea');
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const photoDataInput = document.getElementById('adPhotoData');
    if (ad.photoData) {
        previewImg.src = ad.photoData;
        previewDiv.style.display = 'block';
        uploadArea.style.display = 'none';
        photoDataInput.value = ad.photoData;
    } else {
        previewDiv.style.display = 'none';
        uploadArea.style.display = 'block';
        photoDataInput.value = '';
    }
    adModal.style.display = 'flex';
}

function saveAdSubmit() {
    if (!validatePhotoBeforeSubmit()) {
        document.getElementById('imageUploadArea').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    if (!validateAdForm()) return;
    const adId = document.getElementById('adId').value;
    let photoData = document.getElementById('adPhotoData').value;
    const fileInput = document.getElementById('adImageFile');
    if (fileInput && fileInput.files && fileInput.files[0] && !photoData) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64data = e.target.result;
            saveAdToStorage(adId, base64data);
        };
        reader.readAsDataURL(file);
        return;
    }
    saveAdToStorage(adId, photoData);
}

function saveAdToStorage(adId, photoData) {
    const newAd = {
        id: adId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        title: document.getElementById('adTitle').value.trim(),
        category: document.getElementById('adCategory').value,
        price: parseInt(document.getElementById('adPrice').value),
        location: document.getElementById('adLocation').value.trim(),
        photoData: photoData || null,
        description: document.getElementById('adDescription').value.trim() || '',
        createdAt: new Date().toISOString()
    };
    if (adId) {
        const index = userAds.findIndex(a => a.id === adId);
        if (index !== -1) userAds[index] = newAd;
    } else {
        userAds.unshift(newAd);
    }
    localStorage.setItem('rentspot_user_ads', JSON.stringify(userAds));
    closeAdModal();
    renderMyAds();
}

function closeAdModal() {
    if (adModal) adModal.style.display = 'none';
    if (adForm) adForm.reset();
    document.getElementById('adPhotoData').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageUploadArea').style.display = 'block';
    document.getElementById('adId').value = '';
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

/* счетчик символов */
const bio = document.getElementById('bio');
const bioCounter = document.getElementById('bioCounter');
if (bio && bioCounter) {
    bio.addEventListener('input', () => {
        const len = bio.value.length;
        bioCounter.textContent = `${len} / 500 символов`;
    });
}
/*-----------------------------------------------*/

/* загрузка аватарки */
function setupAvatarUpload() {
    const avatarWrapper = document.getElementById('avatarWrapper');
    const avatarInput = document.getElementById('avatarFileInput');
    if (!avatarWrapper || !avatarInput) return;

    avatarWrapper.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) handleAvatarFile(e.target.files[0]);
    });

    avatarWrapper.addEventListener('dragover', (e) => {
        e.preventDefault();
        avatarWrapper.classList.add('drag-over');
    });

    avatarWrapper.addEventListener('dragleave', () => {
        avatarWrapper.classList.remove('drag-over');
    });

    avatarWrapper.addEventListener('drop', (e) => {
        e.preventDefault();
        avatarWrapper.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.match('image/jpeg') || file.type.match('image/png') || file.type.match('image/jpg')) {
                handleAvatarFile(file);
            } else {
                alert('Пожалуйста, выберите файл в формате JPEG или PNG');
            }
        }
    });
}

function handleAvatarFile(file) {
    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
        alert('Пожалуйста, выберите файл в формате JPEG или PNG');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер 5MB');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const avatarData = e.target.result;
        document.getElementById('profileAvatar').src = avatarData;
        if (currentProfile) {
            currentProfile.avatar = avatarData;
            saveProfile(currentProfile);
        }
    };
    reader.readAsDataURL(file);
}
/*-----------------------------------------------*/

/* запуск страницы */
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    setupImageUpload();
    setupAvatarUpload();

    // Кнопка создания объявления
    document.getElementById('createAdBtn')?.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Создание объявления';
        document.getElementById('adId').value = '';
        document.getElementById('adForm').reset();
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('imageUploadArea').style.display = 'block';
        document.getElementById('adPhotoData').value = '';
        adModal.style.display = 'flex';
        const submitBtn = document.querySelector('#adForm .btn-primary');
        if (submitBtn) submitBtn.disabled = true;
    });

    // Закрытие модалки
    document.querySelectorAll('.modal-close, #cancelAdBtn').forEach(btn => {
        btn?.addEventListener('click', closeAdModal);
    });

    window.addEventListener('click', (e) => {
        if (e.target === adModal) closeAdModal();
    });

    // Отправка формы объявления
    if (adForm) {
        adForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validatePhotoBeforeSubmit()) {
                document.getElementById('imageUploadArea').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            saveAdSubmit();
        });
    }

    // Валидация полей
    const adTitleInput = document.getElementById('adTitle');
    const adCategorySelect = document.getElementById('adCategory');
    const adPriceInput = document.getElementById('adPrice');
    const adLocationInput = document.getElementById('adLocation');
    const adImageFile = document.getElementById('adImageFile');

    adTitleInput?.addEventListener('blur', () => validateAdField('title'));
    adCategorySelect?.addEventListener('blur', () => validateAdField('category'));
    adPriceInput?.addEventListener('blur', () => validateAdField('price'));
    adLocationInput?.addEventListener('blur', () => validateAdField('location'));

    adTitleInput?.addEventListener('input', () => checkAdSubmitButton());
    adCategorySelect?.addEventListener('change', () => checkAdSubmitButton());
    adPriceInput?.addEventListener('input', () => checkAdSubmitButton());
    adLocationInput?.addEventListener('input', () => checkAdSubmitButton());
    adImageFile?.addEventListener('change', () => checkAdSubmitButton());
});
/*-----------------------------------------------*/

/* функции дял кнопок */
window.editAd = function (id) {
    const ad = userAds.find(a => a.id === id);
    if (!ad) return;
    document.getElementById('modalTitle').textContent = 'Редактирование объявления';
    document.getElementById('adId').value = ad.id;
    document.getElementById('adTitle').value = ad.title;
    document.getElementById('adCategory').value = ad.category;
    document.getElementById('adPrice').value = ad.price;
    document.getElementById('adLocation').value = ad.location;
    document.getElementById('adDescription').value = ad.description || '';
    const uploadArea = document.getElementById('imageUploadArea');
    const previewDiv = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const photoDataInput = document.getElementById('adPhotoData');
    if (ad.photoData) {
        previewImg.src = ad.photoData;
        previewDiv.style.display = 'block';
        uploadArea.style.display = 'none';
        photoDataInput.value = ad.photoData;
    } else {
        previewDiv.style.display = 'none';
        uploadArea.style.display = 'block';
        photoDataInput.value = '';
    }
    adModal.style.display = 'flex';
};

window.deleteAd = function (id) {
    userAds = userAds.filter(ad => ad.id !== id);
    localStorage.setItem('rentspot_user_ads', JSON.stringify(userAds));
    renderMyAds();
};
/*-----------------------------------------------*/