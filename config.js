// config.js
const CONFIG = {
    GEMINI_API_KEY: null // Sẽ được set từ localStorage hoặc user input
};

// Load API key từ localStorage khi khởi động
document.addEventListener('DOMContentLoaded', function() {
    CONFIG.GEMINI_API_KEY = localStorage.getItem('gemini_api_key');
    
    if (!CONFIG.GEMINI_API_KEY) {
        const userKey = prompt(
            'Để sử dụng tính năng Chat AI, vui lòng nhập Gemini API Key:\n\n' +
            'Lấy key tại: https://aistudio.google.com/app/apikey\n\n' +
            'Key sẽ được lưu cục bộ trên trình duyệt của bạn.'
        );
        if (userKey) {
            CONFIG.GEMINI_API_KEY = userKey;
            localStorage.setItem('gemini_api_key', userKey);
        }
    }
});