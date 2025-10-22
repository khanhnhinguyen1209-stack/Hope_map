// ==== CHAT ROOM SYSTEM (Fixed - 2 Rooms Only) ==== //
class ChatRoomSystem {
    constructor() {
        this.currentRoom = null;
        this.username = 'Người Ẩn Danh_' + Math.floor(Math.random() * 1000);
        this.messages = {
            general: [],
            support: []
            // Đã xóa phòng recovery
        };
        this.geminiAI = new GeminiChatAI();
        this.isTyping = false;
        
        // Khởi tạo ngay lập tức
        this.init();
    }

    init() {
        console.log('🚀 Khởi tạo hệ thống chat với 2 phòng...');
        this.loadSampleMessages();
        this.setupRoomClickHandlers(); // QUAN TRỌNG: Thêm hàm này
        this.setupEventListeners();
        this.setupGeminiAPI();
    }

    // THÊM HÀM MỚI: Xử lý click vào phòng chat
    setupRoomClickHandlers() {
        console.log('🎯 Thiết lập click handlers cho phòng chat...');
        
        // Sử dụng event delegation
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[onclick*="joinChatRoom"]');
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                
                const onclickAttr = target.getAttribute('onclick');
                const roomMatch = onclickAttr.match(/joinChatRoom\('([^']+)'\)/);
                
                if (roomMatch && roomMatch[1]) {
                    const room = roomMatch[1];
                    console.log('🎯 Click vào phòng:', room);
                    this.joinChatRoom(room);
                }
            }
        });

        // Alternative: Gán trực tiếp event listeners
        setTimeout(() => {
            const rooms = ['general', 'support'];
            rooms.forEach(room => {
                const buttons = document.querySelectorAll(`[onclick*="joinChatRoom('${room}')"]`);
                buttons.forEach(button => {
                    button.style.cursor = 'pointer';
                    // Giữ nguyên onclick để tương thích
                });
            });
        }, 500);
    }

    setupGeminiAPI() {
        const existingKey = localStorage.getItem('gemini_api_key');
        if (!existingKey) {
            setTimeout(() => {
                this.showApiKeyModal();
            }, 1000);
        }
    }

    showApiKeyModal() {
        const key = prompt('🔑 Để sử dụng AI trong phòng hỗ trợ, vui lòng nhập Gemini API Key:\n\nLấy miễn phí tại: https://aistudio.google.com/', '');
        if (key) {
            localStorage.setItem('gemini_api_key', key);
            this.geminiAI = new GeminiChatAI();
            alert('✅ Đã lưu API Key thành công!');
        }
    }

    loadSampleMessages() {
        // Chỉ còn 2 phòng
        this.messages.general = [
            { user: 'Hệ thống', text: 'Chào mừng đến với Phòng Chung! Đây là nơi mọi người có thể trò chuyện trực tiếp với nhau 💬', time: this.getCurrentTime(), isSystem: true },
            { user: 'Mây Trắng', text: 'Xin chào mọi người! Có ai online không?', time: this.getCurrentTime(-5) },
            { user: 'Nắng Mai', text: 'Chào bạn! Mình mới tham gia, rất vui được gặp mọi người!', time: this.getCurrentTime(-3) }
        ];

        this.messages.support = [
            { user: 'Hệ thống', text: 'Chào mừng đến với Phòng Hỗ Trợ! AI Gemini sẽ trò chuyện và hỗ trợ bạn 24/7 🤖', time: this.getCurrentTime(), isSystem: true },
            { user: 'AI Gemini', text: 'Xin chào! Tôi là AI Gemini, sẵn sàng lắng nghe và hỗ trợ bạn. Hãy chia sẻ cảm xúc hoặc vấn đề bạn đang gặp phải 💙', time: this.getCurrentTime(-2), isBot: true }
        ];
    }

    getCurrentTime(minutesAgo = 0) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - minutesAgo);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    setupEventListeners() {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        const sendButton = document.getElementById('send-message-btn');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
    }

    joinChatRoom(room) {
        if (!['general', 'support'].includes(room)) {
            console.error('❌ Phòng không hợp lệ:', room);
            return;
        }

        console.log('🎯 Tham gia phòng:', room);
        this.currentRoom = room;
        
        // Sửa selector thành grid-cols-2
        const roomGrid = document.querySelector('.grid.md\\:grid-cols-2, .grid.md\\:grid-cols-3');
        const chatInterface = document.getElementById('chat-interface');
        
        if (roomGrid) roomGrid.classList.add('hidden');
        if (chatInterface) {
            chatInterface.classList.remove('hidden');
            chatInterface.style.minHeight = '500px';
        }
        
        // Chỉ còn 2 phòng
        const roomTitles = {
            general: '💬 Phòng Chung - Trò chuyện cộng đồng',
            support: '🤖 Phòng Hỗ Trợ - AI Gemini 24/7'
        };
        const roomTitleEl = document.getElementById('chat-room-title');
        if (roomTitleEl) {
            roomTitleEl.textContent = roomTitles[room];
        }
        
        this.displayMessages();
        this.addSystemMessage(`👋 ${this.username} đã tham gia phòng`);
        
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }, 100);
        
        // Chỉ còn phòng hỗ trợ có AI
        if (room === 'support') {
            setTimeout(() => {
                this.addAIMessage('Xin chào! Tôi là AI Gemini. Tôi có thể giúp gì cho bạn hôm nay? 💫');
            }, 1000);
        }

        // Track analytics
        if (window.hopeMapAnalytics) {
            window.hopeMapAnalytics.trackChatRoomJoin(room);
        }
    }

    leaveChatRoom() {
        console.log('👋 Rời phòng:', this.currentRoom);
        if (this.currentRoom) {
            this.addSystemMessage(`👋 ${this.username} đã rời phòng`);
        }
        
        this.currentRoom = null;
        const roomGrid = document.querySelector('.grid.md\\:grid-cols-2, .grid.md\\:grid-cols-3');
        const chatInterface = document.getElementById('chat-interface');
        
        if (roomGrid) roomGrid.classList.remove('hidden');
        if (chatInterface) chatInterface.classList.add('hidden');
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) {
            console.error('❌ Không tìm thấy input chat');
            return;
        }
        
        const message = input.value.trim();
        if (!message || !this.currentRoom) return;

        console.log('📤 Gửi tin nhắn:', message);

        const userMessage = {
            user: this.username,
            text: message,
            time: this.getCurrentTime()
        };
        
        this.messages[this.currentRoom].push(userMessage);
        this.displayMessages();
        input.value = '';
        this.scrollToBottom();
        
        // Chỉ còn 2 loại phòng
        if (this.currentRoom === 'support') {
            await this.generateAIResponse(message);
        } else if (this.currentRoom === 'general') {
            this.simulateOtherUsers(message);
        }
    }

    async generateAIResponse(userMessage) {
        if (!this.geminiAI.apiKey) {
            this.addSystemMessage('⚠️ Vui lòng cung cấp Gemini API Key để sử dụng AI');
            return;
        }

        this.showTypingIndicator();
        
        try {
            const prompt = `Bạn là một trợ lý AI hỗ trợ tâm lý thân thiện. Hãy trả lời bằng tiếng Việt với giọng điệu đồng cảm, ấm áp (2-3 câu). Người dùng nói: "${userMessage}"`;
            
            const aiResponse = await this.geminiAI.generateAIResponse(prompt);
            this.hideTypingIndicator();
            
            this.addAIMessage(aiResponse);
            
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Lỗi AI:', error);
            
            const fallbackResponse = this.getFallbackResponse(userMessage);
            this.addAIMessage(fallbackResponse);
        }
    }

    addAIMessage(text) {
        const aiMessage = {
            user: 'AI Gemini',
            text: text,
            time: this.getCurrentTime(),
            isBot: true
        };
        
        this.messages[this.currentRoom].push(aiMessage);
        this.displayMessages();
        this.scrollToBottom();
    }

    simulateOtherUsers(userMessage) {
        if (Math.random() < 0.3) {
            setTimeout(() => {
                const randomUser = ['Mây Trắng', 'Nắng Mai', 'Gió Nhẹ', 'Bình Yên'][Math.floor(Math.random() * 4)];
                const responses = [
                    "Mình cũng nghĩ vậy!",
                    "Cảm ơn bạn đã chia sẻ 💙",
                    "Ý kiến hay đấy!",
                    "Một ngày tốt lành nhé! 🌸",
                    "Chúng mình cùng nhau vượt qua nhé! 💪"
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                
                const otherUserMessage = {
                    user: randomUser,
                    text: response,
                    time: this.getCurrentTime()
                };
                
                this.messages.general.push(otherUserMessage);
                this.displayMessages();
                this.scrollToBottom();
            }, 2000 + Math.random() * 3000);
        }
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const typingEl = document.createElement('div');
        typingEl.id = 'typing-indicator';
        typingEl.className = 'flex justify-start mb-3';
        typingEl.innerHTML = `
            <div class="bg-gray-100 rounded-lg px-4 py-2">
                <div class="flex items-center gap-1">
                    <span class="font-semibold text-sm text-gray-700">AI Gemini</span>
                    <span class="text-xs text-gray-500">đang nhập...</span>
                </div>
                <div class="flex gap-1 mt-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        container.appendChild(typingEl);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) {
            typingEl.remove();
        }
    }

    getFallbackResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('buồn') || lowerMsg.includes('chán')) {
            return 'Mình hiểu bạn đang cảm thấy không ổn. Hãy nhớ rằng mọi cảm xúc đều là tạm thời 💙';
        }
        if (lowerMsg.includes('lo lắng') || lowerMsg.includes('căng thẳng')) {
            return 'Lo lắng là phản ứng tự nhiên. Thử hít thở sâu vài lần nhé 🌿';
        }
        if (lowerMsg.includes('cảm ơn')) {
            return 'Không có gì đâu! Mình luôn sẵn sàng lắng nghe bạn 🌸';
        }
        if (lowerMsg.includes('chào') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            return 'Xin chào! Rất vui được gặp bạn. Mình là AI Gemini, sẵn sàng lắng nghe và hỗ trợ bạn 💫';
        }
        
        return 'Cảm ơn bạn đã chia sẻ. Mình đang lắng nghe và thấu hiểu 💭';
    }

    displayMessages() {
        const container = document.getElementById('chat-messages');
        if (!container || !this.currentRoom) return;

        const messagesToShow = this.messages[this.currentRoom];
        container.innerHTML = messagesToShow
            .map(msg => this.createMessageHTML(msg))
            .join('');
            
        this.scrollToBottom();
    }

    createMessageHTML(msg) {
        if (msg.isSystem) {
            return `
                <div class="text-center text-gray-500 text-sm italic my-2">
                    ${msg.text}
                </div>
            `;
        }
        
        const isCurrentUser = msg.user === this.username;
        const isBot = msg.isBot;
        
        return `
            <div class="flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3">
                <div class="max-w-xs lg:max-w-md ${isCurrentUser ? 'bg-blue-100 border border-blue-200' : isBot ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'} rounded-lg px-4 py-2 shadow-sm">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-semibold text-sm ${isBot ? 'text-green-700' : isCurrentUser ? 'text-blue-700' : 'text-gray-700'}">
                            ${isBot ? '🤖 ' : ''}${msg.user}
                        </span>
                        <span class="text-xs text-gray-500">${msg.time}</span>
                    </div>
                    <div class="text-gray-800">${msg.text}</div>
                </div>
            </div>
        `;
    }

    addSystemMessage(text) {
        if (!this.currentRoom) return;
        
        const systemMsg = {
            user: 'Hệ thống',
            text: text,
            time: this.getCurrentTime(),
            isSystem: true
        };
        
        this.messages[this.currentRoom].push(systemMsg);
        this.displayMessages();
        this.scrollToBottom();
    }

    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }
}

// ==== GEMINI AI CLASS ==== //
class GeminiChatAI {
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key');
        if (this.apiKey) {
            this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`;
        }
    }

    async generateAIResponse(message) {
        if (!this.apiKey || this.apiKey === 'null') {
            throw new Error('No API Key');
        }

        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }],
                    generationConfig: { 
                        maxOutputTokens: 150, 
                        temperature: 0.7 
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi chưa hiểu ý của bạn.";
        } catch (error) {
            console.error("Lỗi Gemini AI:", error);
            throw error;
        }
    }
}