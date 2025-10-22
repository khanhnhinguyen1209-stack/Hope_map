// ==== MAIN APPLICATION FILE ==== //

// Biến toàn cục
let hopeMap;
let moodTracker;
let chatSystem;
let hopeMapAnalytics;

// Khởi tạo ứng dụng khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Hope Map - Khởi tạo ứng dụng...');
    
    initializeApplication();
    setupEventListeners();
    setupLayout();
    
    // Hiển thị section map mặc định
    setTimeout(() => {
        showSection("map");
    }, 500);
});

// Khởi tạo ứng dụng
function initializeApplication() {
    try {
        // Khởi tạo các module chính
        window.hopeMap = new HopeMap();
        window.moodTracker = new MoodTracker();
        window.chatSystem = new ChatRoomSystem();
        window.hopeMapAnalytics = new HopeMapAnalytics();
        
        // Khởi tạo mood tracker
        setTimeout(() => {
            if (window.moodTracker) {
                window.moodTracker.init();
            }
        }, 1000);
        
        console.log('✅ Đã khởi tạo tất cả modules');
        
    } catch (error) {
        console.error('❌ Lỗi khởi tạo ứng dụng:', error);
    }
}
function updateOnlineUsers() {
    try {
        const onlineCounts = {
            general: 21 + Math.floor(Math.random() * 5),
            support: 14 + Math.floor(Math.random() * 3)
        };
        
        // Cập nhật số người online cho 2 phòng
        const generalElements = document.querySelectorAll('[onclick*="general"] .text-green-600, [onclick*="general"] .online-count');
        const supportElements = document.querySelectorAll('[onclick*="support"] .text-green-600, [onclick*="support"] .online-count');
        
        generalElements.forEach(el => {
            if (el) el.textContent = `🟢 ${onlineCounts.general} người online`;
        });
        supportElements.forEach(el => {
            if (el) el.textContent = `🟢 ${onlineCounts.support} người online`;
        });
        
        console.log('👥 Đã cập nhật số người online cho 2 phòng');
    } catch (error) {
        console.error('❌ Lỗi cập nhật online users:', error);
    }
}
function initializeChatSection() {
    console.log('💬 Khởi tạo chat section với 2 phòng');
    
    const chatInterface = document.getElementById('chat-interface');
    // Sửa thành grid-cols-2
    const roomGrid = document.querySelector('.grid.md\\:grid-cols-2, .grid.md\\:grid-cols-3');
    
    if (chatInterface) {
        chatInterface.classList.add('hidden');
    }
    
    if (roomGrid) {
        roomGrid.classList.remove('hidden');
    }
    
    // Reset current room nếu có
    if (window.chatSystem && window.chatSystem.currentRoom) {
        window.chatSystem.leaveChatRoom();
    }
    
    updateOnlineUsers();
    
    // Fix footer sau khi khởi tạo chat
    setTimeout(fixFooterPosition, 150);
}
// Thiết lập layout chính - FIXED FOOTER
function setupLayout() {
    console.log('⚙️ Đang thiết lập layout...');
    
    // Đảm bảo body có flex layout
    document.body.style.display = 'flex';
    document.body.style.flexDirection = 'column';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Tìm hoặc tạo main container
    let mainContainer = document.getElementById('app-main-content');
    if (!mainContainer) {
        // Nếu không có, tìm phần tử chứa nội dung chính
        const sections = document.querySelector('.container.mx-auto, main, #app');
        if (sections) {
            sections.parentElement.classList.add('flex-1');
        } else {
            // Tạo container mới nếu cần
            const contentSections = document.querySelectorAll('.section-content');
            if (contentSections.length > 0) {
                contentSections[0].parentElement.classList.add('flex-1');
            }
        }
    } else {
        mainContainer.classList.add('flex-1');
    }
    
    // Đảm bảo footer có margin-top auto
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.marginTop = 'auto';
        footer.classList.add('footer-fixed-bottom');
    }
    
    // Đảm bảo map container có chiều cao
    const mapElement = document.getElementById('hope-map');
    if (mapElement) {
        mapElement.style.height = '500px';
        mapElement.style.width = '100%';
    }

    // Fix cho mobile
    if (window.innerWidth < 768) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.add('text-sm', 'px-3', 'py-2');
        });
    }
    
    console.log('✅ Đã thiết lập layout');
}

// Thiết lập event listeners
function setupEventListeners() {
    // Form handlers
    setupFormHandlers();
    
    // Chat input
    const chatInput = document.getElementById("chat-input");
    if (chatInput) {
        chatInput.addEventListener("keypress", e => {
            if (e.key === "Enter") sendMessage();
        });
    }
    
    // Send message button
    const sendButton = document.getElementById("send-message-btn");
    if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
    }
    
    // Window resize
    window.addEventListener('resize', handleWindowResize);
    
    // Periodic updates
    setInterval(updateOnlineUsers, 30000);
    
    // Cập nhật online users ban đầu
    setTimeout(updateOnlineUsers, 1000);
    
    // Thêm listener cho chat system để fix layout khi mở/đóng chat
    document.addEventListener('chatStateChanged', function(e) {
        fixFooterPosition();
    });
}

// Hàm fix vị trí footer
function fixFooterPosition() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    
    // Luôn đảm bảo footer ở dưới cùng
    footer.style.marginTop = 'auto';
    footer.style.position = 'relative';
    footer.style.bottom = '0';
    footer.style.width = '100%';
    
    // Kiểm tra nếu content quá ngắn
    const mainContent = document.querySelector('.flex-1, .main-content, [class*="container"]');
    const bodyHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;
    
    if (bodyHeight < windowHeight) {
        footer.style.position = 'fixed';
        footer.style.bottom = '0';
    } else {
        footer.style.position = 'relative';
    }
}

// Xử lý resize window - UPDATED
function handleWindowResize() {
    // Re-initialize map khi resize nếu đang ở section map
    if (document.getElementById('map-section') && !document.getElementById('map-section').classList.contains('hidden')) {
        setTimeout(() => {
            if (window.hopeMap && window.hopeMap.map) {
                window.hopeMap.map.invalidateSize();
                console.log('🔄 Đã cập nhật kích thước bản đồ');
            }
        }, 300);
    }
    
    // Responsive cho navigation
    if (window.innerWidth < 768) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.add('text-sm', 'px-3', 'py-2');
        });
    } else {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('text-sm', 'px-3', 'py-2');
            btn.classList.add('px-4', 'py-2');
        });
    }
    
    // Fix lại vị trí footer khi resize
    setTimeout(fixFooterPosition, 100);
}

// Navigation functions - UPDATED với footer fix
function showSection(sectionName) {
    try {
        console.log('🔄 Chuyển sang section:', sectionName);
        
        // Ẩn tất cả sections nội dung
        document.querySelectorAll(".section-content").forEach(sec => {
            if (sec) {
                sec.classList.add("hidden");
            }
        });
        
        // Reset navigation
        document.querySelectorAll(".nav-btn").forEach(btn => {
            if (btn) {
                btn.classList.remove("bg-blue-500", "text-white");
                btn.classList.add("text-gray-600", "hover:bg-gray-100");
            }
        });

        // Hiển thị section được chọn
        const targetSection = document.getElementById(sectionName + "-section");
        const targetNav = document.getElementById("nav-" + sectionName);
        
        if (targetSection) {
            targetSection.classList.remove("hidden");
            console.log('✅ Hiển thị section:', sectionName);
            
            // Đảm bảo section có flex grow
            targetSection.classList.add('flex-1');
        } else {
            console.error('❌ Không tìm thấy section:', sectionName + "-section");
            return;
        }
        
        if (targetNav) {
            targetNav.classList.add("bg-blue-500", "text-white");
            targetNav.classList.remove("text-gray-600", "hover:bg-gray-100");
        }

        // Khởi tạo lại components dựa trên section
        initializeSection(sectionName);
        
        // Fix footer position sau khi chuyển section
        setTimeout(fixFooterPosition, 200);
        
        // Track analytics
        if (window.hopeMapAnalytics) {
            window.hopeMapAnalytics.trackSectionView(sectionName);
        }
        
    } catch (error) {
        console.error("❌ Lỗi khi chuyển section:", error);
    }
}

// Khởi tạo section cụ thể - UPDATED
function initializeSection(sectionName) {
    setTimeout(() => {
        switch(sectionName) {
            case "map":
                initializeMapSection();
                break;
                
            case "mood":
                initializeMoodSection();
                break;
                
            case "chat":
                initializeChatSection();
                break;
                
            case "stories":
                initializeStoriesSection();
                break;
                
            case "register":
                initializeRegisterSection();
                break;
        }
        
        // Luôn fix footer position sau khi khởi tạo section
        fixFooterPosition();
    }, 100);
}

// Khởi tạo chat section - UPDATED với footer fix
function initializeChatSection() {
    console.log('💬 Khởi tạo chat section');
    
    const chatInterface = document.getElementById('chat-interface');
    const roomGrid = document.querySelector('.grid.md\\:grid-cols-3');
    
    if (chatInterface) {
        chatInterface.classList.add('hidden');
    }
    
    if (roomGrid) {
        roomGrid.classList.remove('hidden');
    }
    
    // Reset current room nếu có
    if (window.chatSystem && window.chatSystem.currentRoom) {
        window.chatSystem.leaveChatRoom();
    }
    
    updateOnlineUsers();
    
    // Fix footer sau khi khởi tạo chat
    setTimeout(fixFooterPosition, 150);
}

// Các hàm khác giữ nguyên...
function setupFormHandlers() {
    const helperForm = document.getElementById("helper-form");
    if (helperForm) {
        helperForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleHelperRegistration(this);
        });
    }

    const helpRequestForm = document.getElementById("help-request-form");
    if (helpRequestForm) {
        helpRequestForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleHelpRequest(this);
        });
    }
}

function handleHelperRegistration(form) {
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.area) {
            alert('⚠️ Vui lòng chọn khu vực hoạt động');
            return;
        }

        if (window.hopeMap && window.hopeMap.userLocation) {
            data.lat = window.hopeMap.userLocation[0];
            data.lng = window.hopeMap.userLocation[1];
        }

        const list = JSON.parse(localStorage.getItem("hopeMapHelpers") || "[]");
        list.push({ 
            ...data, 
            id: "HLP" + Date.now(), 
            timestamp: new Date().toISOString(),
            support_type: 'Lắng nghe, hỗ trợ tâm lý'
        });
        localStorage.setItem("hopeMapHelpers", JSON.stringify(list));
        
        alert("✅ Đăng ký tình nguyện viên thành công!");
        form.reset();
        
        if (window.hopeMap) {
            window.hopeMap.addDynamicMarkers();
        }
        
        if (window.hopeMapAnalytics) {
            window.hopeMapAnalytics.trackRegistration('helper');
        }
        
    } catch (error) {
        console.error('❌ Lỗi đăng ký helper:', error);
        alert('❌ Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
    }
}

function handleHelpRequest(form) {
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.urgency) {
            alert('⚠️ Vui lòng chọn mức độ cần hỗ trợ');
            return;
        }

        if (window.hopeMap && window.hopeMap.userLocation) {
            data.lat = window.hopeMap.userLocation[0];
            data.lng = window.hopeMap.userLocation[1];
        }

        const list = JSON.parse(localStorage.getItem("hopeMapRequests") || "[]");
        list.push({ 
            ...data, 
            id: "REQ" + Date.now(), 
            timestamp: new Date().toISOString(),
            description: data.description || 'Cần hỗ trợ tâm lý'
        });
        localStorage.setItem("hopeMapRequests", JSON.stringify(list));
        
        alert("✅ Yêu cầu hỗ trợ đã được gửi!");
        form.reset();
        
        if (window.hopeMap) {
            window.hopeMap.addDynamicMarkers();
        }
        
        if (window.hopeMapAnalytics) {
            window.hopeMapAnalytics.trackRegistration('help_request');
        }
        
    } catch (error) {
        console.error('❌ Lỗi gửi yêu cầu hỗ trợ:', error);
        alert('❌ Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    }
}

// Thêm CSS động cho footer
function injectFooterCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .footer-fixed-bottom {
            margin-top: auto !important;
            position: relative !important;
            bottom: 0 !important;
            width: 100% !important;
        }
        
        @media (max-height: 600px) {
            .footer-fixed-bottom {
                position: relative !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Gọi inject CSS khi khởi tạo
injectFooterCSS();

// Export các hàm cần thiết ra global scope
window.showSection = showSection;
window.joinChatRoom = joinChatRoom;
window.leaveChatRoom = leaveChatRoom;
window.sendMessage = sendMessage;
window.joinAsHelper = joinAsHelper;
window.requestHelp = requestHelp;
window.recenterMap = recenterMap;
window.resetMapData = resetMapData;
window.shareStory = shareStory;
window.updateApiKey = updateApiKey;
window.fixFooterPosition = fixFooterPosition; // Thêm hàm này để có thể gọi từ nơi khác

console.log('✅ Main.js đã được tải thành công với footer fix');