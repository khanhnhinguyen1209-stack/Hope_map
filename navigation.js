// ==== HOPE MAP NAVIGATION SYSTEM (Fixed & Optimized) ==== //

function showSection(sectionName) {
    try {
        console.log('🔄 Chuyển sang section:', sectionName);

        // Ẩn toàn bộ section nội dung
        document.querySelectorAll(".section-content").forEach(sec => sec.classList.add("hidden"));

        // Reset navigation style
        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.classList.remove("bg-blue-500", "text-white");
            btn.classList.add("text-gray-600", "hover:bg-gray-100");
        });

        // Hiển thị section được chọn
        const targetSection = document.getElementById(`${sectionName}-section`);
        const targetNav = document.getElementById(`nav-${sectionName}`);

        if (targetSection) {
            targetSection.classList.remove("hidden");
            targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
            console.log(`✅ Hiển thị section: ${sectionName}`);
        } else {
            console.warn(`⚠️ Không tìm thấy section: ${sectionName}-section`);
        }

        if (targetNav) {
            targetNav.classList.add("bg-blue-500", "text-white");
            targetNav.classList.remove("text-gray-600", "hover:bg-gray-100");
        }

        // Khởi tạo phần tương ứng
        initializeSection(sectionName);

        // Theo dõi analytics (nếu có)
        if (window.hopeMapAnalytics) {
            window.hopeMapAnalytics.trackSectionView(sectionName);
        }

        // Cập nhật footer vị trí
        fixFooterPosition();

    } catch (error) {
        console.error("❌ Lỗi khi chuyển section:", error);
    }
}

function initializeSection(sectionName) {
    setTimeout(() => {
        switch (sectionName) {
            case "map": initializeMapSection(); break;
            case "mood": initializeMoodSection(); break;
            case "chat": initializeChatSection(); break;
            case "stories": initializeStoriesSection(); break;
            case "register": initializeRegisterSection(); break;
        }
    }, 150);
}

// --- MAP --- //
function initializeMapSection() {
    if (window.hopeMap) {
        const mapElement = document.getElementById('hope-map');
        if (mapElement) {
            mapElement.style.height = '500px';
            mapElement.style.width = '100%';
            setTimeout(() => window.hopeMap.initializeMap(), 300);
        }
    }
}

// --- MOOD --- //
function initializeMoodSection() {
    if (window.moodTracker) {
        window.moodTracker.updateCommunityStats();
        window.moodTracker.checkTodayMood();
    }
}

// --- CHAT --- //
function initializeChatSection() {
    console.log('💬 Khởi tạo chat section');
    const chatInterface = document.getElementById('chat-interface');
    const roomGrid = document.querySelector("[class*='grid-cols-3']");

    if (chatInterface) chatInterface.classList.add('hidden');
    if (roomGrid) roomGrid.classList.remove('hidden');

    // Reset current room nếu có
    if (window.chatSystem && window.chatSystem.currentRoom) {
        window.chatSystem.leaveChatRoom();
    }

    updateOnlineUsers();
}

// --- STORIES --- //
function initializeStoriesSection() {
    console.log('📖 Khởi tạo stories section');
    // Có thể thêm logic tải stories động ở đây
}

// --- REGISTER --- //
function initializeRegisterSection() {
    console.log('📝 Khởi tạo register section');
    // Có thể thêm logic khởi tạo form ở đây
}

// --- ONLINE COUNTER --- //
function updateOnlineUsers() {
    const onlineCounts = {
        general: 20 + Math.floor(Math.random() * 10),
        support: 10 + Math.floor(Math.random() * 6),
        recovery: 5 + Math.floor(Math.random() * 5)
    };

    const selector = room => document.querySelector(`[onclick="joinChatRoom('${room}')"] .text-green-600`);
    const generalElement = selector('general');
    const supportElement = selector('support');
    const recoveryElement = selector('recovery');

    if (generalElement) generalElement.textContent = `🟢 ${onlineCounts.general} người online`;
    if (supportElement) supportElement.textContent = `🟢 ${onlineCounts.support} người online`;
    if (recoveryElement) recoveryElement.textContent = `🟢 ${onlineCounts.recovery} người online`;

    console.log('👥 Đã cập nhật số người online');
}

// --- HELPER NAV --- //
function joinAsHelper() {
    showSection("register");
    setTimeout(() => {
        const helperForm = document.getElementById("helper-form");
        if (helperForm) helperForm.scrollIntoView({ behavior: "smooth" });
    }, 300);
}

function requestHelp() {
    showSection("register");
    setTimeout(() => {
        const helpForm = document.getElementById("help-request-form");
        if (helpForm) helpForm.scrollIntoView({ behavior: "smooth" });
    }, 300);
}

// --- STORY --- //
function shareStory() {
    const story = prompt("Hãy chia sẻ câu chuyện hy vọng của bạn:");
    if (story && story.trim()) {
        alert("💖 Cảm ơn bạn đã chia sẻ! Câu chuyện của bạn sẽ được kiểm duyệt trước khi hiển thị.");
        // Ở đây có thể thêm logic gửi story đến server hoặc lưu localStorage
    }
}

// --- FOOTER FIX --- //
function fixFooterPosition() {
    const footer = document.querySelector("footer");
    if (!footer) return;
    footer.style.marginTop = "auto";
    footer.style.position = "relative";
    footer.style.bottom = "0";
}

