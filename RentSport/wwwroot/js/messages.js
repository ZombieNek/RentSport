

/* получение чатов из хранилища */
function getAllChats() {
    const chats = [];
    const toDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_')) {
            try {
                const chatData = JSON.parse(localStorage.getItem(key));

                if (!chatData || !chatData.messages || !Array.isArray(chatData.messages)) {
                    toDelete.push(key);
                    continue;
                }

                const messages = chatData.messages;
                const adInfo = chatData.adInfo;

                if (!adInfo || !adInfo.adId || !adInfo.ownerId) {
                    toDelete.push(key);
                    continue;
                }

                const lastMessage = messages[messages.length - 1];
                const unreadCount = messages.filter(m => !m.isRead && m.sender !== 'user').length;

                chats.push({
                    key: key,
                    adId: adInfo.adId,
                    ownerId: adInfo.ownerId,
                    ownerName: adInfo.ownerName || 'Арендодатель',
                    ownerAvatar: adInfo.ownerAvatar || '',
                    adTitle: adInfo.adTitle || 'Объявление',
                    lastMessage: lastMessage?.text || '',
                    lastMessageTime: lastMessage?.time || new Date().toISOString(),
                    unreadCount: unreadCount
                });
            } catch (e) {
                console.warn('Ошибка парсинга, удаляем:', key, e);
                toDelete.push(key);
            }
        }
    }

    // удаление битых чатов
    toDelete.forEach(key => {
        console.log('Удаляем битый чат:', key);
        localStorage.removeItem(key);
    });

    // сортировка по времени
    chats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    return chats;
}

function getChatKey(adId, ownerId) {
    return `chat_${adId}_${ownerId}`;
}

function loadMessages(adId, ownerId) {
    const key = getChatKey(adId, ownerId);
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            const chatData = JSON.parse(stored);
            return chatData.messages || [];
        } catch (e) {
            return [];
        }
    }
    return [];
}
/*-----------------------------------------------*/

/* создание нового чата */
function ensureChatExists(adId, ownerId, ownerName, ownerAvatar, adTitle) {
    const key = getChatKey(adId, ownerId);
    const existing = localStorage.getItem(key);

    if (!existing) {
        const adInfo = {
            adId: adId,
            ownerId: ownerId,
            ownerName: ownerName || 'Арендодатель',
            ownerAvatar: ownerAvatar || '',
            adTitle: adTitle || 'Объявление'
        };

        const initialMessages = [{
            id: Date.now(),
            text: `Чат создан. Вы обсуждаете: "${adTitle}"`,
            sender: 'system',
            time: new Date().toISOString(),
            isSystem: true
        }];

        const chatData = {
            adInfo: adInfo,
            messages: initialMessages,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(key, JSON.stringify(chatData));
        console.log('Создан новый чат с сохранённой информацией');
    }
}
/*-----------------------------------------------*/

/* переменные состояния */
let currentChatKey = null;
let currentAdId = null;
let currentOwnerId = null;
/*-----------------------------------------------*/

/* меню удаления */
let currentContextChat = null;
const contextMenu = document.getElementById('contextMenu');

function showContextMenu(e, chatKey, adId, ownerId, ownerName, ownerAvatar, adTitle) {
    e.preventDefault();
    e.stopPropagation();
    currentContextChat = { chatKey, adId, ownerId, ownerName, ownerAvatar, adTitle };
    contextMenu.style.display = 'block';
    contextMenu.style.left = e.pageX + 'px';
    contextMenu.style.top = e.pageY + 'px';
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
    currentContextChat = null;
}

function deleteChatFromContext() {
    if (!currentContextChat) return;

    const key = getChatKey(currentContextChat.adId, currentContextChat.ownerId);
    localStorage.removeItem(key);

    if (currentAdId === currentContextChat.adId && currentOwnerId === currentContextChat.ownerId) {
        currentAdId = null;
        currentOwnerId = null;
        currentChatKey = null;
        const emptyDiv = document.getElementById('emptyChatState');
        const activeDiv = document.getElementById('activeChat');
        if (emptyDiv) emptyDiv.style.display = 'flex';
        if (activeDiv) activeDiv.style.display = 'none';
    }

    renderChatsList();
    hideContextMenu();
}

document.addEventListener('click', (e) => {
    if (contextMenu && !contextMenu.contains(e.target)) {
        hideContextMenu();
    }
});

window.showContextMenuFromItem = function (e, chatKey, adId, ownerId, ownerName, ownerAvatar, adTitle) {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e, chatKey, adId, ownerId, ownerName, ownerAvatar, adTitle);
};
/*-----------------------------------------------*/

/* мобильная адаптация */
function isMobile() {
    return window.innerWidth <= 768;
}

function showChatList() {
    document.querySelector('.chats-panel').classList.remove('hide-on-mobile');
    document.querySelector('.chat-panel').classList.remove('active-on-mobile');
}

function showChatWindow() {
    document.querySelector('.chats-panel').classList.add('hide-on-mobile');
    document.querySelector('.chat-panel').classList.add('active-on-mobile');
}

function initMobileView() {
    if (!isMobile()) {
        document.querySelector('.chats-panel')?.classList.remove('hide-on-mobile');
        document.querySelector('.chat-panel')?.classList.remove('active-on-mobile');
        return;
    }
    document.querySelector('.chats-panel')?.classList.remove('hide-on-mobile');
    document.querySelector('.chat-panel')?.classList.remove('active-on-mobile');
}
/*-----------------------------------------------*/

/* рендер списка чатов */
function renderChatsList(searchQuery = '') {
    const container = document.getElementById('chatsList');
    if (!container) return;

    let chats = getAllChats();

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        chats = chats.filter(chat =>
            chat.ownerName.toLowerCase().includes(query) ||
            chat.adTitle.toLowerCase().includes(query)
        );
    }

    if (chats.length === 0) {
        container.innerHTML = `<div class="empty-state" style="text-align: center; padding: 40px; color: var(--text-secondary);"><p>📭 Нет чатов</p><p style="font-size: 12px;">Напишите кому-нибудь, чтобы начать диалог</p></div>`;
        return;
    }

    container.innerHTML = chats.map(chat => `
        <div class="chat-list-item ${currentChatKey === chat.key ? 'active' : ''}" 
             data-chat-key="${chat.key}"
             data-ad-id="${chat.adId}" 
             data-owner-id="${chat.ownerId}" 
             data-owner-name="${escapeHtml(chat.ownerName)}" 
             data-owner-avatar="${escapeHtml(chat.ownerAvatar)}" 
             data-ad-title="${escapeHtml(chat.adTitle)}"
             oncontextmenu="showContextMenuFromItem(event, '${chat.key}', '${chat.adId}', '${chat.ownerId}', '${escapeHtml(chat.ownerName)}', '${escapeHtml(chat.ownerAvatar)}', '${escapeHtml(chat.adTitle)}')">
            <img src="${chat.ownerAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(chat.ownerName) + '&background=2563EB&color=fff'}" 
                 class="chat-list-avatar" 
                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(chat.ownerName)}&background=2563EB&color=fff'">
            <div class="chat-list-info">
                <div class="chat-list-name">
                    <span>${escapeHtml(chat.ownerName)}</span>
                    <span class="chat-list-time">${formatTime(chat.lastMessageTime)}</span>
                </div>
                <div class="chat-list-last-message">${escapeHtml(chat.lastMessage.substring(0, 50))}${chat.lastMessage.length > 50 ? '...' : ''}</div>
                <div class="chat-list-ad">📦 ${escapeHtml(chat.adTitle)}</div>
            </div>
            ${chat.unreadCount > 0 ? `<div class="unread-dot"></div>` : ''}
        </div>
    `).join('');

    document.querySelectorAll('.chat-list-item').forEach(item => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);

        newItem.addEventListener('click', (e) => {
            if (e.button === 0) {
                e.preventDefault();
                const adId = newItem.dataset.adId;
                const ownerId = newItem.dataset.ownerId;
                const ownerName = newItem.dataset.ownerName;
                const ownerAvatar = newItem.dataset.ownerAvatar;
                const adTitle = newItem.dataset.adTitle;
                openChat(adId, ownerId, ownerName, ownerAvatar, adTitle);
                if (isMobile()) showChatWindow();
            }
        });
    });
}
/*-----------------------------------------------*/

/* открытие чата */
function openChat(adId, ownerId, ownerName, ownerAvatar, adTitle) {
    if (!adId || !ownerId) {
        console.error('Нет данных для открытия чата');
        return;
    }

    ensureChatExists(adId, ownerId, ownerName, ownerAvatar, adTitle);

    currentAdId = adId;
    currentOwnerId = ownerId;
    currentChatKey = `chat_${adId}_${ownerId}`;

    const emptyDiv = document.getElementById('emptyChatState');
    const activeDiv = document.getElementById('activeChat');
    if (emptyDiv) emptyDiv.style.display = 'none';
    if (activeDiv) {
        activeDiv.style.display = 'flex';
        activeDiv.style.flexDirection = 'column';
        activeDiv.style.height = '100%';
    }

    const nameEl = document.getElementById('chatName');
    const adTitleEl = document.getElementById('chatAdTitle');
    const avatarEl = document.getElementById('chatAvatar');

    if (nameEl) nameEl.textContent = ownerName || 'Арендодатель';
    if (adTitleEl) adTitleEl.textContent = adTitle || 'Объявление';
    if (avatarEl) {
        avatarEl.src = ownerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName || 'User')}&background=2563EB&color=fff`;
    }

    const messages = loadMessages(adId, ownerId);
    renderMessages(messages);

    setupMessageSender(adId, ownerId, ownerName, ownerAvatar, adTitle);
    setupMessageInputValidation();
    markMessagesAsRead(adId, ownerId);
    renderChatsList();
}

function renderMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (!messages || messages.length === 0) {
        container.innerHTML = `<div class="empty-chat-state" style="text-align: center; padding: 40px;"><p>💬 Напишите первое сообщение</p></div>`;
        return;
    }

    const visibleMessages = messages.filter(m => !m.isSystem);

    if (visibleMessages.length === 0) {
        container.innerHTML = `<div class="empty-chat-state" style="text-align: center; padding: 40px;"><p>💬 Напишите первое сообщение</p></div>`;
        return;
    }

    container.innerHTML = visibleMessages.map(msg => {
        const isOutgoing = msg.sender === 'user';
        const time = new Date(msg.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="message ${isOutgoing ? 'message-outgoing' : 'message-incoming'}">
                <div class="message-bubble">${escapeHtml(msg.text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}
/*-----------------------------------------------*/

/* отправка сообщений */
function setupMessageSender(adId, ownerId, ownerName, ownerAvatar, adTitle) {
    const sendBtn = document.getElementById('sendMessageBtn');
    const messageInput = document.getElementById('messageInput');

    if (!sendBtn || !messageInput) return;

    const newSendBtn = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

    newSendBtn.addEventListener('click', () => {
        sendMessage(adId, ownerId, ownerName, ownerAvatar, adTitle);
    });

    if (messageInput._enterListener) {
        messageInput.removeEventListener('keydown', messageInput._enterListener);
    }

    messageInput._enterListener = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!newSendBtn.disabled) {
                sendMessage(adId, ownerId, ownerName, ownerAvatar, adTitle);
            }
        }
    };
    messageInput.addEventListener('keydown', messageInput._enterListener);
}

function sendMessage(adId, ownerId, ownerName, ownerAvatar, adTitle) {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) return;

    ensureChatExists(adId, ownerId, ownerName, ownerAvatar, adTitle);

    const messages = loadMessages(adId, ownerId);
    const newMessage = {
        id: Date.now(),
        text: text,
        sender: 'user',
        time: new Date().toISOString(),
        isRead: true,
        isSystem: false
    };

    messages.push(newMessage);

    const adInfo = {
        adId: adId,
        ownerId: ownerId,
        ownerName: ownerName || 'Арендодатель',
        ownerAvatar: ownerAvatar || '',
        adTitle: adTitle || 'Объявление'
    };

    const key = getChatKey(adId, ownerId);
    const chatData = {
        adInfo: adInfo,
        messages: messages,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(chatData));

    renderMessages(messages);
    input.value = '';
    setupMessageInputValidation();
    renderChatsList();
}
/*-----------------------------------------------*/

/* отметка о прочтении */
function markMessagesAsRead(adId, ownerId) {
    const key = getChatKey(adId, ownerId);
    const stored = localStorage.getItem(key);
    if (stored) {
        const chatData = JSON.parse(stored);
        let hasChanges = false;
        chatData.messages.forEach(msg => {
            if (!msg.isRead && msg.sender !== 'user') {
                msg.isRead = true;
                hasChanges = true;
            }
        });
        if (hasChanges) {
            localStorage.setItem(key, JSON.stringify(chatData));
            renderChatsList();
        }
    }
}
/*-----------------------------------------------*/

/* валидация ввода */
function setupMessageInputValidation() {
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    if (!input || !sendBtn) return;

    function validate() {
        sendBtn.disabled = !input.value.trim();
    }

    input.removeEventListener('input', validate);
    input.addEventListener('input', validate);
    validate();
}
/*-----------------------------------------------*/

/* форматирование времени */
function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    if (diffDays < 7) return `${diffDays} д`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}
/*-----------------------------------------------*/


/* поиск по чатам */
const searchInput = document.getElementById('chatsSearch');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderChatsList(e.target.value);
    });
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

/* запуск страницы */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('deleteChatContextBtn')) {
        document.getElementById('deleteChatContextBtn').addEventListener('click', deleteChatFromContext);
    }

    initMobileView();
    renderChatsList();

    const backBtn = document.getElementById('backToChatsBtn');
    if (backBtn) {
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        newBackBtn.addEventListener('click', showChatList);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const adId = urlParams.get('adId');
    const ownerId = urlParams.get('ownerId');
    const ownerName = urlParams.get('ownerName');
    const ownerAvatar = urlParams.get('ownerAvatar');
    const adTitle = urlParams.get('adTitle');

    if (adId && ownerId) {
        openChat(adId, ownerId, decodeURIComponent(ownerName || 'Арендодатель'), decodeURIComponent(ownerAvatar || ''), decodeURIComponent(adTitle || 'Объявление'));
        if (isMobile()) showChatWindow();
    }
});

window.addEventListener('resize', function () {
    setTimeout(initMobileView, 100);
});
/*-----------------------------------------------*/