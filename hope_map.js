class HopeMap {
    constructor() {
        this.map = null;
        this.currentMood = null;
        this.currentChatRoom = null;
        this.userLocation = JSON.parse(localStorage.getItem('hopeMapUserLocation')) || null;
        this.markerLayer = null;
        this.sampleChatMessages = {};

        // Tọa độ chính xác hơn cho các quận/huyện TP.HCM
        this.districtCoordinates = {
            'quan1': [10.7756, 106.7019],       // Trung tâm Quận 1 (Bến Thành)
            'quan3': [10.7821, 106.6862],       // Trung tâm Quận 3 (Công viên Lê Văn Tám)
            'quan4': [10.7649, 106.7050],       // Trung tâm Quận 4 (Cầu Kênh Tẻ)
            'quan5': [10.7543, 106.6664],       // Trung tâm Quận 5 (Chợ Lớn)
            'quan6': [10.7464, 106.6492],       // Trung tâm Quận 6 (Công viên Phú Lâm)
            'quan7': [10.7314, 106.7243],       // Trung tâm Quận 7 (Phú Mỹ Hưng)
            'quan8': [10.7243, 106.6286],       // Trung tâm Quận 8 (Cầu Chữ Y)
            'quan10': [10.7679, 106.6664],      // Trung tâm Quận 10 (Bệnh viện Chợ Rẫy)
            'quan11': [10.7639, 106.6433],      // Trung tâm Quận 11 (Công viên Lê Thị Riêng)
            'quan12': [10.8633, 106.6544],      // Trung tâm Quận 12 (Công viên phần mềm Quang Trung)
            'binhThanh': [10.8011, 106.6981],   // Trung tâm Bình Thạnh (Cầu Sài Gòn)
            'goVap': [10.8387, 106.6653],       // Trung tâm Gò Vấp (Công viên Gia Định)
            'tanBinh': [10.7972, 106.6453],     // Trung tâm Tân Bình (Sân bay Tân Sơn Nhất)
            'tanPhu': [10.7905, 106.6281],      // Trung tâm Tân Phú (Công viên Tân Phú)
            'phuNhuan': [10.7992, 106.6753],    // Trung tâm Phú Nhuận (Công viên Gia Định)
            'thuDuc': [10.8497, 106.7717],      // Trung tâm Thủ Đức (Đại học Quốc gia)
            'binhTan': [10.7656, 106.6033],     // Trung tâm Bình Tân (Aeon Mall Bình Tân)
            'nhaBe': [10.6967, 106.7967],       // Trung tâm Nhà Bè (Cảng Hiệp Phước)
            'binhChanh': [10.7200, 106.5667],   // Trung tâm Bình Chánh (Thị trấn Tân Túc)
            'cuChi': [10.9733, 106.4933],       // Trung tâm Củ Chi (Địa đạo Củ Chi)
            'hocMon': [10.8794, 106.5953],      // Trung tâm Hóc Môn (Chợ Hóc Môn)
            'canGio': [10.4147, 106.9667],      // Trung tâm Cần Giờ (Thị trấn Cần Thạnh)
            'other': [10.8231, 106.6297],       // Trung tâm TP.HCM (Nhà thờ Đức Bà)
            'online': [10.8231, 106.6297],
            'allDistricts': [10.8231, 106.6297]
        };

        this.loadSampleData();
    }

    initializeMap() {
        setTimeout(() => {
            const mapElement = document.getElementById('hope-map');
            if (mapElement && !this.map) {
                this.map = L.map('hope-map').setView([10.8231, 106.6297], 12);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(this.map);

                // Thêm layer control
                this.addLayerControl();

                // Khôi phục vị trí người dùng nếu có
                if (this.userLocation) {
                    this.showUserLocation(this.userLocation[0], this.userLocation[1]);
                } else {
                    this.locateUser();
                }

                this.addDynamicMarkers();
                
                // Thêm nút reset dữ liệu
                this.addResetButton();
            } else if (this.map) {
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
            }
        }, 100);
    }

    addLayerControl() {
        if (!this.map) return;

        // Thêm các base layer khác (nếu cần)
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        const baseLayers = {
            "Bản đồ đường": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
            "Ảnh vệ tinh": satelliteLayer
        };

        L.control.layers(baseLayers).addTo(this.map);
    }

    locateUser() {
        if (navigator.geolocation) {
            // Hiển thị thông báo đang định vị
            this.showLocatingMessage();

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    this.userLocation = [latitude, longitude];
                    localStorage.setItem('hopeMapUserLocation', JSON.stringify(this.userLocation));
                    this.showUserLocation(latitude, longitude);
                    this.showLocationAccuracy(pos.coords.accuracy);
                },
                (err) => {
                    console.warn("❌ Không thể lấy vị trí:", err.message);
                    this.userLocation = [10.8231, 106.6297];
                    this.showUserLocation(10.8231, 106.6297);
                    this.showLocationError();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        } else {
            alert("Trình duyệt của bạn không hỗ trợ định vị GPS");
        }
    }

    showLocatingMessage() {
        const locatingDiv = document.createElement('div');
        locatingDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        locatingDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="animate-spin">🔄</span>
                <span>Đang định vị vị trí của bạn...</span>
            </div>
        `;
        locatingDiv.id = 'locating-message';
        document.body.appendChild(locatingDiv);
    }

    showLocationAccuracy(accuracy) {
        // Xóa thông báo đang định vị
        const locatingMsg = document.getElementById('locating-message');
        if (locatingMsg) locatingMsg.remove();

        if (accuracy > 100) {
            const accuracyDiv = document.createElement('div');
            accuracyDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            accuracyDiv.innerHTML = `
                <div class="flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Độ chính xác: ~${Math.round(accuracy)}m</span>
                </div>
            `;
            document.body.appendChild(accuracyDiv);
            
            setTimeout(() => {
                if (document.body.contains(accuracyDiv)) {
                    document.body.removeChild(accuracyDiv);
                }
            }, 5000);
        }
    }

    showLocationError() {
        const locatingMsg = document.getElementById('locating-message');
        if (locatingMsg) locatingMsg.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <span>❌</span>
                <span>Không thể lấy vị trí. Sử dụng vị trí mặc định.</span>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }

    showUserLocation(lat, lng) {
        if (!this.map) return;

        // Xóa marker cũ nếu có
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }

        this.userMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div class="w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }).addTo(this.map);

        // Thêm vòng tròn độ chính xác
        if (this.accuracyCircle) {
            this.map.removeLayer(this.accuracyCircle);
        }

        this.userMarker.bindPopup(`
            <div class="text-center p-2">
                <strong>📍 Vị trí của bạn</strong><br>
                <small>${lat.toFixed(6)}, ${lng.toFixed(6)}</small><br>
                <button onclick="window.hopeMap.recenterMap()" 
                        class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    🔍 Thu phóng về đây
                </button>
            </div>
        `).openPopup();

        this.map.setView([lat, lng], 13);
    }

    recenterMap() {
        if (this.userLocation && this.map) {
            this.map.setView(this.userLocation, 15);
        }
    }

    async geocodeAddress(address) {
        try {
            // Thêm từ khóa TP.HCM để tăng độ chính xác
            const searchQuery = address.includes('Hồ Chí Minh') || address.includes('TP.HCM') 
                ? address 
                : `${address}, Hồ Chí Minh, Việt Nam`;
            
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=vn`
            );
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data && data.length > 0) {
                console.log(`📍 Geocoding thành công: ${address} -> ${data[0].lat}, ${data[0].lon}`);
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
            console.warn(`❌ Không tìm thấy tọa độ cho: ${address}`);
            return null;
        } catch (error) {
            console.error('Lỗi geocoding:', error);
            return null;
        }
    }

    async addMarkerWithAddress(data, type) {
    if (!this.map || !this.markerLayer) return;

    let lat, lng;
    let addressUsed = '';

    // Ưu tiên: 1. Geocoding địa chỉ cụ thể, 2. Tọa độ quận/huyện, 3. Tọa độ ngẫu nhiên
    if (data.address && data.address.trim()) {
        const coords = await this.geocodeAddress(data.address);
        if (coords) {
            [lat, lng] = coords;
            addressUsed = data.address;
        }
    }

    // Nếu geocoding thất bại, sử dụng tọa độ quận/huyện
    if (!lat && data.area && this.districtCoordinates[data.area]) {
        [lat, lng] = this.districtCoordinates[data.area];
        addressUsed = this.getDistrictName(data.area);
    } else if (!lat && data.district && this.districtCoordinates[data.district]) {
        [lat, lng] = this.districtCoordinates[data.district];
        addressUsed = this.getDistrictName(data.district);
    }

    // Fallback: tọa độ ngẫu nhiên trong TP.HCM
    if (!lat) {
        lat = 10.75 + Math.random() * 0.15;
        lng = 106.60 + Math.random() * 0.15;
        addressUsed = 'TP.HCM';
    }

    // 🎨 Chọn màu marker theo loại
    const color = 
        type === 'helper' 
            ? 'green' 
            : (data.urgency === 'emergency' ? 'red' : 'yellow');

    // 🟢 Tạo marker tròn màu
    const marker = L.circleMarker([lat, lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.75,
        radius: 10,
        className: `${type}-marker`
    }).addTo(this.markerLayer);

    // 📍 Nội dung popup
    const popupContent = type === 'helper' 
        ? `
            <div class="text-center p-3 min-w-[200px]">
                <div class="font-bold text-green-700 mb-2">🤝 Tình Nguyện Viên</div>
                <div class="text-sm mb-1"><strong>Khu vực:</strong> ${data.area ? this.getDistrictName(data.area) : 'TP.HCM'}</div>
                <div class="text-sm mb-1"><strong>Hỗ trợ:</strong> ${data.support_type || 'Chưa xác định'}</div>
                ${addressUsed ? `<div class="text-xs text-gray-600 mt-2">📍 ${addressUsed}</div>` : ''}
                <div class="text-xs text-gray-500 mt-2">${new Date(data.timestamp).toLocaleDateString('vi-VN')}</div>
            </div>
        `
        : `
            <div class="text-center p-3 min-w-[200px]">
                <div class="font-bold ${data.urgency === 'emergency' ? 'text-red-700' : 'text-yellow-600'} mb-2">
                    ${data.urgency === 'emergency' ? '🚨 Cần Hỗ Trợ Khẩn Cấp' : '💛 Cần Trò Chuyện'}
                </div>
                <div class="text-sm mb-1"><strong>Khu vực:</strong> ${data.district ? this.getDistrictName(data.district) : 'TP.HCM'}</div>
                ${data.description ? `<div class="text-sm mb-1"><strong>Mô tả:</strong> ${data.description}</div>` : ''}
                ${addressUsed ? `<div class="text-xs text-gray-600 mt-2">📍 ${addressUsed}</div>` : ''}
                <div class="text-xs text-gray-500 mt-2">${new Date(data.timestamp).toLocaleDateString('vi-VN')}</div>
            </div>
        `;

    // 🪄 Gắn popup và hiệu ứng hover
    marker.bindPopup(popupContent);
    marker.on('mouseover', function() {
        this.openPopup();
    });
    marker.on('mouseout', function() {
        this.closePopup();
    });
}

    getDistrictName(value) {
        const districtNames = {
            'quan1': 'Quận 1',
            'quan3': 'Quận 3',
            'quan4': 'Quận 4',
            'quan5': 'Quận 5',
            'quan6': 'Quận 6',
            'quan7': 'Quận 7',
            'quan8': 'Quận 8',
            'quan10': 'Quận 10',
            'quan11': 'Quận 11',
            'quan12': 'Quận 12',
            'binhThanh': 'Quận Bình Thạnh',
            'goVap': 'Quận Gò Vấp',
            'tanBinh': 'Quận Tân Bình',
            'tanPhu': 'Quận Tân Phú',
            'phuNhuan': 'Quận Phú Nhuận',
            'thuDuc': 'Thành phố Thủ Đức',
            'binhTan': 'Quận Bình Tân',
            'nhaBe': 'Huyện Nhà Bè',
            'binhChanh': 'Huyện Bình Chánh',
            'cuChi': 'Huyện Củ Chi',
            'hocMon': 'Huyện Hóc Môn',
            'canGio': 'Huyện Cần Giờ',
            'other': 'Khu vực khác',
            'online': 'Hỗ trợ trực tuyến',
            'allDistricts': 'Tất cả khu vực TP.HCM'
        };
        return districtNames[value] || value;
    }

    addDynamicMarkers() {
        if (!this.map) return;

        if (this.markerLayer) this.map.removeLayer(this.markerLayer);
        this.markerLayer = L.layerGroup().addTo(this.map);

        const helpers = JSON.parse(localStorage.getItem('hopeMapHelpers') || '[]');
        const requests = JSON.parse(localStorage.getItem('hopeMapRequests') || '[]');

        console.log(`📍 Đang thêm ${helpers.length} tình nguyện viên và ${requests.length} yêu cầu hỗ trợ`);

        // Thêm markers với delay để tránh block UI
        helpers.forEach((helper, index) => {
            setTimeout(() => {
                this.addMarkerWithAddress(helper, 'helper');
            }, index * 100);
        });

        requests.forEach((req, index) => {
            setTimeout(() => {
                this.addMarkerWithAddress(req, 'request');
            }, helpers.length * 100 + index * 100);
        });
    }
    resetAllData() {
        localStorage.removeItem('hopeMapHelpers');
        localStorage.removeItem('hopeMapRequests');
        localStorage.removeItem('hopeMapUserLocation');
        alert('🔄 Dữ liệu đã được đặt lại. Bản đồ sẽ làm mới.');
        location.reload();
    }

    loadSampleData() {
        this.sampleChatMessages = {
            general: [
                { user: "Người dùng A", message: "Chào mọi người! Hôm nay thế nào?", time: "10:30", isVolunteer: false },
                { user: "Minh Tâm", message: "Chào bạn! Mình là tình nguyện viên, có gì mình có thể giúp bạn không? 💙", time: "10:31", isVolunteer: true },
            ],
            support: [
                { user: "Lan Anh", message: "Xin chào! Mình ở đây để lắng nghe và hỗ trợ mọi người 🤗", time: "09:15", isVolunteer: true },
                { user: "Người dùng D", message: "Mình đang hơi buồn...", time: "09:20", isVolunteer: false },
                { user: "Quốc Bảo", message: "Mình hiểu cảm giác của bạn. Bạn không đơn độc đâu 💙", time: "09:21", isVolunteer: true },
            ],
            recovery: [
                { user: "Người dùng E", message: "Hôm nay tròn 1 tháng mình không lo âu!", time: "08:45", isVolunteer: false },
                { user: "Hồng Nhung", message: "Chúc mừng bạn! Đây là một thành tích tuyệt vời 🎉", time: "08:46", isVolunteer: true },
            ]
        };
    }
}

window.addEventListener('load', () => {
    localStorage.removeItem('hopeMapHelpers');
    localStorage.removeItem('hopeMapRequests');
});