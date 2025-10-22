// ==== HOPE MAP ANALYTICS (Fixed & Improved) ==== //
class HopeMapAnalytics {
    constructor() {
        this.trackedEvents = {};
        this.showPrivacyNotice();
    }

    // 🧩 Hiển thị thông báo quyền riêng tư
    showPrivacyNotice() {
        try {
            if (!localStorage.getItem('hope_map_analytics_consent')) {
                setTimeout(() => {
                    const consent = confirm(
                        'Hope Map sử dụng analytics ẩn danh để cải thiện trải nghiệm. Dữ liệu được bảo vệ và không chia sẻ với bên thứ ba. Bạn có đồng ý?'
                    );
                    localStorage.setItem('hope_map_analytics_consent', consent ? 'true' : 'false');

                    if (consent) {
                        this.trackEvent('privacy', 'consent_given', 'user_consented');
                    }
                }, 2000);
            }
        } catch (err) {
            console.error('Lỗi khi hiển thị thông báo quyền riêng tư:', err);
        }
    }

    // 📊 Theo dõi sự kiện quan trọng
    trackEvent(category, action, label) {
        if (!this.hasConsent()) return;

        console.log(`📊 Analytics: ${category} - ${action} - ${label}`);

        // Gửi đến Google Analytics (nếu có)
        if (typeof gtag === 'function') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }

        // Lưu vào localStorage để backup
        this.saveToLocalStorage(category, action, label);

        // Ghi log để debug
        this.trackedEvents[`${category}_${action}`] = {
            timestamp: new Date().toISOString(),
            label: label
        };
    }

    // ✅ Kiểm tra consent
    hasConsent() {
        return localStorage.getItem('hope_map_analytics_consent') === 'true';
    }

    // ==============================
    // 🎯 Các sự kiện cụ thể
    // ==============================
    trackSectionView(sectionName) {
        this.trackEvent('navigation', 'section_view', sectionName);
    }

    trackChatRoomJoin(roomName) {
        this.trackEvent('chat', 'join_room', roomName);
    }

    trackMoodSelection(mood) {
        this.trackEvent('mood', 'select_mood', mood);
    }

    trackRegistration(type) {
        this.trackEvent('registration', type, new Date().toISOString());
    }

    trackMapInteraction(action, details) {
        this.trackEvent('map', action, details);
    }

    // 💾 Lưu dữ liệu vào localStorage
    saveToLocalStorage(category, action, label) {
        try {
            const key = `hope_map_${category}_${action}_${Date.now()}`;
            const data = {
                category,
                action,
                label: this.sanitizeData(label),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                screenResolution: `${screen.width}x${screen.height}`,
                language: navigator.language
            };
            localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.warn('Lưu analytics thất bại:', err);
        }
    }

    // 🧼 Làm sạch dữ liệu nhạy cảm
    sanitizeData(data) {
        if (typeof data !== 'string') return data;
        return data
            .replace(/\b\d{10,}\b/g, '[PHONE_REMOVED]')  // số điện thoại
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REMOVED]') // email
            .replace(/\b\d{9,12}\b/g, '[ID_REMOVED]');  // CCCD/CMND
    }

    // 📂 Lấy dữ liệu analytics
    getAnalyticsData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('hope_map_')) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch {
                    // bỏ qua lỗi parse
                }
            }
        }
        return data;
    }

    // 📤 Xuất dữ liệu analytics ra file JSON
    exportAnalyticsData() {
        const data = this.getAnalyticsData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hope_map_analytics_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 🧹 Xóa toàn bộ dữ liệu analytics
    clearAnalyticsData() {
        const toDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('hope_map_')) {
                toDelete.push(key);
            }
        }
        toDelete.forEach(k => localStorage.removeItem(k));
        console.log('🧹 Đã xóa dữ liệu analytics');
    }

    // 📈 Tạo báo cáo tổng quan từ localStorage
    generateReport() {
        const data = this.getAnalyticsData();
        const report = {
            totalEvents: Object.keys(data).length,
            sections: {},
            chatRooms: {},
            moods: {},
            registrations: {},
            maps: {},
            generatedAt: new Date().toISOString()
        };

        Object.values(data).forEach(event => {
            const { category, action, label } = event || {};
            if (!category || !action) return;

            switch (category) {
                case 'navigation':
                    report.sections[label] = (report.sections[label] || 0) + 1;
                    break;
                case 'chat':
                    report.chatRooms[label] = (report.chatRooms[label] || 0) + 1;
                    break;
                case 'mood':
                    report.moods[label] = (report.moods[label] || 0) + 1;
                    break;
                case 'registration':
                    report.registrations[action] = (report.registrations[action] || 0) + 1;
                    break;
                case 'map':
                    report.maps[action] = (report.maps[action] || 0) + 1;
                    break;
            }
        });

        console.table(report);
        return report;
    }
}
