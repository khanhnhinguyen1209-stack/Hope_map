class MoodTracker {
    constructor() {
        this.moods = [
            { id: "happy", label: "Vui vẻ", description: "Cảm thấy tích cực", color: "bg-yellow-400", textColor: "text-yellow-800", icon: "😄" },
            { id: "normal", label: "Bình thường", description: "Không có gì đặc biệt", color: "bg-blue-400", textColor: "text-blue-800", icon: "🙂" },
            { id: "sad", label: "Buồn", description: "Cảm thấy u sầu", color: "bg-gray-400", textColor: "text-gray-800", icon: "😔" },
            { id: "anxious", label: "Lo âu", description: "Cảm thấy căng thẳng", color: "bg-red-400", textColor: "text-red-800", icon: "😰" }
        ];
        this.currentMood = null;
    }

    init() {
        this.renderMoodTracker();
        this.updateCommunityStats();
        this.checkTodayMood();
    }

    renderMoodTracker() {
        const moodSection = document.getElementById('mood-section');
        if (!moodSection) return;

        moodSection.innerHTML = `
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                <h2 class="text-2xl font-bold text-blue-700 mb-4 text-center">🧠 Theo Dõi Tâm Trạng Hàng Ngày</h2>
                <p class="text-center text-gray-600 mb-6">
                    Ghi lại cảm xúc của bạn mỗi ngày. Dữ liệu sẽ được ẩn danh và giúp cộng đồng hiểu rõ hơn về tình hình sức khỏe tâm thần.
                </p>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    ${this.moods.map(mood => `
                        <div class="mood-card ${mood.color} p-4 rounded-xl text-center cursor-pointer transition-all hover:scale-105 shadow-md flex flex-col items-center justify-center min-h-[140px]"
                             onclick="window.moodTracker.selectMood('${mood.id}')">
                            <div class="text-4xl mb-3">${mood.icon}</div>
                            <div class="font-bold ${mood.textColor} text-lg">${mood.label}</div>
                            <div class="text-sm text-gray-700 mt-1">${mood.description}</div>
                        </div>
                    `).join('')}
                </div>

                <div id="mood-selection" class="hidden text-center">
                    <p class="text-gray-600 mb-3">Hôm nay bạn đã chọn: <span id="selected-mood" class="font-semibold text-blue-700"></span></p>
                    <button onclick="window.moodTracker.saveMood()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
                        ✅ Xác nhận tâm trạng
                    </button>
                </div>
            </div>

            <div id="community-stats" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">📊 Thống Kê Cộng Đồng Hôm Nay</h2>
                <div id="stats-content">
                    <!-- Nội dung thống kê sẽ được cập nhật ở đây -->
                </div>
            </div>
        `;

        this.checkTodayMood();
    }

    selectMood(moodId) {
        this.currentMood = moodId;
        const selectedMood = this.moods.find(m => m.id === moodId);
        
        document.querySelectorAll('.mood-card').forEach(card => {
            card.classList.remove('ring-4', 'ring-blue-300', 'ring-offset-2');
        });
        
        const selectedCard = event.currentTarget;
        selectedCard.classList.add('ring-4', 'ring-blue-300', 'ring-offset-2');
        
        document.getElementById('selected-mood').textContent = selectedMood.label;
        document.getElementById('mood-selection').classList.remove('hidden');
    }

    saveMood() {
        if (!this.currentMood) return;

        const today = new Date().toDateString();
        const moodData = {
            mood: this.currentMood,
            date: today,
            timestamp: new Date().toISOString()
        };

        const history = JSON.parse(localStorage.getItem("hopeMapMoodHistory") || "[]");
        const filteredHistory = history.filter(m => m.date !== today);
        const updatedHistory = [...filteredHistory, moodData];
        
        localStorage.setItem("hopeMapMoodHistory", JSON.stringify(updatedHistory));
        
        this.showSuccessMessage();
        
        this.currentMood = null;
        this.updateCommunityStats();
        this.checkTodayMood();
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>✅</span>
                <span>Đã lưu tâm trạng của bạn!</span>
            </div>
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 3000);
    }

    checkTodayMood() {
        const today = new Date().toDateString();
        const history = JSON.parse(localStorage.getItem("hopeMapMoodHistory") || "[]");
        const todayMood = history.find(m => m.date === today);

        if (todayMood) {
            const mood = this.moods.find(m => m.id === todayMood.mood);
            if (document.getElementById('selected-mood')) {
                document.getElementById('selected-mood').textContent = mood.label;
                document.getElementById('mood-selection').classList.remove('hidden');
            }
            
            document.querySelectorAll('.mood-card').forEach(card => {
                const moodElement = card.querySelector('.font-bold');
                if (moodElement && moodElement.textContent === mood.label) {
                    card.classList.add('ring-4', 'ring-blue-300', 'ring-offset-2');
                }
            });
        } else {
            if (document.getElementById('mood-selection')) {
                document.getElementById('mood-selection').classList.add('hidden');
            }
            document.querySelectorAll('.mood-card').forEach(card => {
                card.classList.remove('ring-4', 'ring-blue-300', 'ring-offset-2');
            });
        }
    }

    calculateCommunityStats() {
        const today = new Date().toDateString();
        const history = JSON.parse(localStorage.getItem("hopeMapMoodHistory") || "[]");
        const todayMoods = history.filter(m => m.date === today);

        if (todayMoods.length === 0) return null;

        const moodCounts = {};
        this.moods.forEach(mood => moodCounts[mood.id] = 0);
        todayMoods.forEach(entry => moodCounts[entry.mood]++);

        const total = todayMoods.length;
        const stats = {};

        this.moods.forEach(mood => {
            const percentage = total > 0 ? Math.round((moodCounts[mood.id] / total) * 100) : 0;
            stats[mood.id] = { 
                percentage, 
                count: moodCounts[mood.id], 
                label: mood.label, 
                icon: mood.icon, 
                color: mood.color, 
                textColor: mood.textColor 
            };
        });

        return stats;
    }

    updateCommunityStats() {
        const stats = this.calculateCommunityStats();
        const statsElement = document.getElementById('stats-content');
        if (!statsElement) return;

        if (!stats) {
            statsElement.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <p class="text-lg mb-2">📊 Chưa có dữ liệu thống kê hôm nay</p>
                    <p class="text-sm">Hãy là người đầu tiên chia sẻ tâm trạng!</p>
                </div>
            `;
            return;
        }

        const totalPeople = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);
        
        statsElement.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                ${this.moods.map(mood => {
                    const stat = stats[mood.id];
                    return `
                        <div class="${mood.color} p-4 rounded-xl text-center shadow-md flex flex-col items-center justify-center min-h-[120px]">
                            <div class="text-3xl mb-2">${stat.icon}</div>
                            <div class="text-2xl font-bold ${mood.textColor} mb-1">${stat.percentage}%</div>
                            <div class="font-medium text-gray-700">${mood.label}</div>
                            <div class="text-sm text-gray-600 mt-1">(${stat.count} người)</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <p class="text-center text-blue-700 font-medium">
                    💡 Cảm ơn ${totalPeople} người đã chia sẻ tâm trạng hôm nay!
                </p>
            </div>
        `;
    }
}

