class HopeMap {
    constructor() {
        this.map = null;
        this.currentMood = null;
        this.currentChatRoom = null;
        this.userLocation = null;
        this.initializeMap();
        this.loadSampleData();
    }

    initializeMap() {
        setTimeout(() => {
            if (document.getElementById('hope-map') && !this.map) {
                this.map = L.map('hope-map').setView([10.8231, 106.6297], 11);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(this.map);
                
                this.addSampleMarkers();
            }
        }, 100);
    }

    addSampleMarkers() {
        if (!this.map) return;

        const locations = [
            { lat: 10.8231, lng: 106.6297, type: 'helper', name: 'Tình nguyện viên A - Quận 1' },
            { lat: 10.7769, lng: 106.7009, type: 'support', name: 'Cần trò chuyện - Quận 3' },
            { lat: 10.8142, lng: 106.6438, type: 'emergency', name: 'Cần hỗ trợ khẩn cấp - Quận Bình Thạnh' },
            { lat: 10.7546, lng: 106.6787, type: 'helper', name: 'Chuyên gia tâm lý - Quận 7' },
            { lat: 10.8505, lng: 106.7717, type: 'support', name: 'Cần lắng nghe - Quận 12' },
            { lat: 10.7629, lng: 106.6820, type: 'helper', name: 'Tình nguyện viên B - Quận 4' },
            { lat: 10.8700, lng: 106.8030, type: 'support', name: 'Cần trò chuyện - Quận Thủ Đức' },
            { lat: 10.7380, lng: 106.6621, type: 'helper', name: 'Counselor - Quận 8' },
            { lat: 10.8006, lng: 106.6504, type: 'emergency', name: 'Cần hỗ trợ khẩn cấp - Quận 10' },
            { lat: 10.7893, lng: 106.6147, type: 'helper', name: 'Tình nguyện viên C - Quận 5' },
        ];

        locations.forEach(location => {
            const color = location.type === 'emergency' ? 'red' : 
                         location.type === 'support' ? 'yellow' : 'green';
            
            const marker = L.circleMarker([location.lat, location.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                radius: 10
            }).addTo(this.map);
            
            marker.bindPopup(`
                <div class="text-center p-2">
                    <strong>${location.name}</strong><br>
                    <small>Vị trí đã được ẩn danh hóa</small><br>
                    ${location.type === 'helper' ? 
                        '<button class="bg-green-500 text-white px-3 py-1 rounded mt-2">Kết nối</button>' :
                        '<button class="bg-blue-500 text-white px-3 py-1 rounded mt-2">Hỗ trợ</button>'
                    }
                </div>
            `);
        });
    }

    loadSampleData() {
        this.sampleChatMessages = {
            general: [
                { user: 'Người dùng A', message: 'Chào mọi người! Hôm nay thế nào?', time: '10:30' },
                { user: 'Người dùng B', message: 'Chào bạn! Mình ổn, cảm ơn bạn đã hỏi 😊', time: '10:32' },
                { user: 'Người dùng C', message: 'Hôm nay trời đẹp quá, tâm trạng cũng tốt hơn', time: '10:35' }
            ],
            support: [
                { user: 'Tình nguyện viên X', message: 'Có ai cần trò chuyện không? Mình đang online', time: '09:15' },
                { user: 'Người dùng D', message: 'Cảm ơn bạn. Mình đang hơi buồn...', time: '09:20' },
                { user: 'Tình nguyện viên X', message: 'Mình hiểu cảm giác đó. Bạn có muốn chia sẻ không?', time: '09:22' }
            ],
            recovery: [
                { user: 'Người dùng E', message: 'Hôm nay tròn 1 tháng mình không có cơn lo âu nào!', time: '08:45' },
                { user: 'Người dùng F', message: 'Chúc mừng bạn! Đó là một thành tựu tuyệt vời 🎉', time: '08:47' },
                { user: 'Người dùng G', message: 'Cảm hứng quá! Mình cũng đang cố gắng', time: '08:50' }
            ]
        };
    }
}

// Khởi tạo HopeMap
const hopeMap = new HopeMap();

// --- Điều hướng ---
function showSection(sectionName) {
    document.querySelectorAll('.section-content').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('text-gray-600', 'hover:bg-gray-100');
    });

    document.getElementById(sectionName + '-section').classList.remove('hidden');
    document.getElementById('nav-' + sectionName).classList.add('bg-blue-500', 'text-white');
    document.getElementById('nav-' + sectionName).classList.remove('text-gray-600', 'hover:bg-gray-100');

    if (sectionName === 'map') setTimeout(() => hopeMap.initializeMap(), 100);
}

function joinAsHelper() {
    showSection('register');
    document.querySelector('#helper-form').scrollIntoView({ behavior: 'smooth' });
}

function requestHelp() {
    showSection('register');
    document.querySelector('#help-request-form').scrollIntoView({ behavior: 'smooth' });
}

// --- Theo dõi tâm trạng ---
function selectMood(mood, event) {
    hopeMap.currentMood = mood;
    document.querySelectorAll('.mood-card').forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('mood-details').classList.remove('hidden');
}

function saveMood() {
    if (!hopeMap.currentMood) {
        alert('Vui lòng chọn tâm trạng trước khi lưu.');
        return;
    }

    const note = document.getElementById('mood-note').value;
    const moodData = {
        mood: hopeMap.currentMood,
        note: note,
        timestamp: new Date().toISOString(),
        date: new Date().toDateString()
    };

    const savedMoods = JSON.parse(localStorage.getItem('hopeMapMoods') || '[]');
    savedMoods.push(moodData);
    localStorage.setItem('hopeMapMoods', JSON.stringify(savedMoods));

    alert('✅ Đã lưu tâm trạng của bạn! Cảm ơn bạn đã chia sẻ.');

    document.querySelectorAll('.mood-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('mood-note').value = '';
    document.getElementById('mood-details').classList.add('hidden');
    hopeMap.currentMood = null;
}

// --- Chat ---
function joinChatRoom(roomType) {
    hopeMap.currentChatRoom = roomType;
    const titles = { general: 'Phòng Chung', support: 'Phòng Hỗ Trợ', recovery: 'Phòng Hồi Phục' };
    document.getElementById('chat-room-title').textContent = titles[roomType];
    document.getElementById('chat-interface').classList.remove('hidden');
    loadChatMessages(roomType);
    document.getElementById('chat-interface').scrollIntoView({ behavior: 'smooth' });
}

function loadChatMessages(roomType) {
    const messagesContainer = document.getElementById('chat-messages');
    const messages = hopeMap.sampleChatMessages[roomType] || [];
    messagesContainer.innerHTML = messages.map(msg => `
        <div class="chat-bubble mb-3 p-3 bg-white rounded-lg shadow-sm">
            <div class="font-medium text-sm text-blue-600">${msg.user}</div>
            <div class="text-gray-800">${msg.message}</div>
            <div class="text-xs text-gray-500 mt-1">${msg.time}</div>
        </div>
    `).join('');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message || !hopeMap.currentChatRoom) return;

    const messagesContainer = document.getElementById('chat-messages');
    const newMessage = document.createElement('div');
    newMessage.className = 'chat-bubble mb-3 p-3 bg-blue-100 rounded-lg shadow-sm ml-auto';
    newMessage.innerHTML = `
        <div class="font-medium text-sm text-blue-600">Bạn</div>
        <div class="text-gray-800">${message}</div>
        <div class="text-xs text-gray-500 mt-1">${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</div>
    `;
    messagesContainer.appendChild(newMessage);
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(() => {
        const responses = [
            'Cảm ơn bạn đã chia sẻ 💙',
            'Mình hiểu cảm giác của bạn',
            'Bạn không đơn độc đâu, chúng mình ở đây cùng bạn',
            'Hãy cứ từ từ, mọi thứ sẽ ổn thôi'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage = document.createElement('div');
        responseMessage.className = 'chat-bubble mb-3 p-3 bg-white rounded-lg shadow-sm';
        responseMessage.innerHTML = `
            <div class="font-medium text-sm text-green-600">Tình nguyện viên</div>
            <div class="text-gray-800">${randomResponse}</div>
            <div class="text-xs text-gray-500 mt-1">${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</div>
        `;
        messagesContainer.appendChild(responseMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000 + Math.random() * 2000);
}

function leaveChatRoom() {
    document.getElementById('chat-interface').classList.add('hidden');
    hopeMap.currentChatRoom = null;
}

// --- Chia sẻ câu chuyện ---
function shareStory() {
    const story = prompt('Chia sẻ câu chuyện của bạn (sẽ được ẩn danh):');
    if (story && story.trim()) {
        alert('✅ Cảm ơn bạn đã chia sẻ! Câu chuyện sẽ được kiểm duyệt và đăng tải sớm.');
    }
}

// --- Xử lý form ---
document.getElementById('help-request-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    const requests = JSON.parse(localStorage.getItem('hopeMapRequests') || '[]');
    requests.push({ ...data, id: 'REQ' + Date.now(), timestamp: new Date().toISOString(), status: 'pending' });
    localStorage.setItem('hopeMapRequests', JSON.stringify(requests));
    alert('✅ Yêu cầu hỗ trợ đã được gửi!');
    this.reset();
});

document.getElementById('helper-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    const helpers = JSON.parse(localStorage.getItem('hopeMapHelpers') || '[]');
    helpers.push({ ...data, id: 'HLP' + Date.now(), timestamp: new Date().toISOString(), status: 'pending_verification' });
    localStorage.setItem('hopeMapHelpers', JSON.stringify(helpers));
    alert('✅ Đăng ký tình nguyện viên thành công!');
    this.reset();
});

document.getElementById('chat-input')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

// Mặc định hiển thị bản đồ
showSection('map');
