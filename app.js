/**
 * LOTTO DREAM CREATOR - Main Javascript logic
 * Includes:
 * 1. Dream dictionary and fuzzy search mapping
 * 2. Horoscope seed hashing and daily lucky number generator
 * 3. Dynamic DOM grids for 포함수/제외수 filtering
 * 4. Canvas-based 2D physics lotto chamber simulation
 * 5. Web Audio API soft pop sound synthesizer
 * 6. History logging, local storage sync, and TXT exporter
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. DATA DICTIONARIES
    // -------------------------------------------------------------
    const DREAM_DATABASE = {
        "돼지": { numbers: [12, 17, 34, 45], desc: "🐷 재물과 집안의 풍요를 상징하는 강력한 길몽입니다." },
        "똥": { numbers: [7, 15, 27, 44], desc: "💩 횡재수와 아주 강력한 돈복을 불러오는 최고의 길몽입니다." },
        "불": { numbers: [4, 14, 24, 38], desc: "🔥 사업의 대박 번창이나 엄청난 기운의 상승을 상징하는 불 꿈입니다." },
        "대통령": { numbers: [1, 3, 11, 40], desc: "👑 권위와 명예, 귀인의 큰 조력과 합격을 예견하는 대길몽입니다." },
        "조상": { numbers: [6, 16, 26, 36], desc: "👵 귀인의 도움과 새로운 기회를 열어주는 신비로운 계시의 꿈입니다." },
        "물": { numbers: [8, 18, 28, 39], desc: "💧 생명력과 융통성, 막혔던 일이 원활히 풀려나갈 맑은 기운의 꿈입니다." },
        "뱀": { numbers: [19, 29, 39, 41], desc: "🐍 지혜, 태몽 혹은 큰 성취나 예상치 못한 기회를 암시하는 꿈입니다." },
        "보석": { numbers: [22, 25, 33, 42], desc: "💎 진귀한 인연을 맺거나 인생의 값진 보물을 획득함을 상징합니다." },
        "금": { numbers: [22, 25, 33, 42], desc: "✨ 재물의 번영과 부귀영화를 상징하는 황금빛 길몽입니다." },
        "황금": { numbers: [22, 25, 33, 42], desc: "✨ 재물의 번영과 부귀영화를 상징하는 황금빛 길몽입니다." },
        "죽음": { numbers: [4, 13, 23, 44], desc: "💀 기존의 묵은 액운이 소멸하고 완전한 새 출발을 의미하는 전환의 꿈입니다." },
        "피": { numbers: [2, 12, 22, 32], desc: "🩸 열정적인 생명력의 분출, 횡재, 혹은 귀한 진전을 암시하는 강렬한 꿈입니다." },
        "집": { numbers: [10, 20, 30, 40], desc: "🏠 생활의 안정과 사업적 기반, 안락함을 상징하는 대형 구조물의 꿈입니다." },
        "눈물": { numbers: [3, 13, 23, 33], desc: "😭 묵었던 감정의 응어리와 스트레스가 해소되는 심적 평화를 나타냅니다." },
        "싸움": { numbers: [5, 15, 25, 35], desc: "⚔️ 장애물을 적극적으로 정면 돌파하여 극복해낼 투지와 에너지를 상징합니다." },
        "호랑이": { numbers: [3, 23, 33, 43], desc: "🐯 큰 권력이나 든든한 조력자, 용맹한 사업 추진력을 얻을 길몽입니다." },
        "용": { numbers: [5, 15, 25, 35], desc: "🐉 승천과 대운, 신분의 수직 상승을 의미하는 황실급 대길몽입니다." },
        "개": { numbers: [11, 21, 31, 41], desc: "🐕 신뢰받는 조력자나 의리 있는 지인과의 인간관계를 반영합니다." },
        "돈": { numbers: [15, 30, 45], desc: "💵 기회와 현실적 가치, 노력에 상응하는 든든한 결실을 상징합니다." }
    };

    // -------------------------------------------------------------
    // 2. STATE MANAGEMENT
    // -------------------------------------------------------------
    let includeNumbers = new Set();
    let excludeNumbers = new Set();
    let history = [];
    let isDrawing = false;
    let soundEnabled = false;
    let currentDrawnSet = [];
    
    // Load initial history from localStorage
    try {
        const savedHistory = localStorage.getItem('lotto_dream_history');
        if (savedHistory) {
            history = JSON.parse(savedHistory);
        }
    } catch (e) {
        console.error("Local storage read error", e);
    }

    // -------------------------------------------------------------
    // 3. UI ELEMENT SELECTORS
    // -------------------------------------------------------------
    const tabAuto = document.getElementById('tab-auto');
    const tabFilter = document.getElementById('tab-filter');
    const tabDream = document.getElementById('tab-dream');
    const tabHoroscope = document.getElementById('tab-horoscope');

    const panelAuto = document.getElementById('panel-auto');
    const panelFilter = document.getElementById('panel-filter');
    const panelDream = document.getElementById('panel-dream');
    const panelHoroscope = document.getElementById('panel-horoscope');

    const btnGenerateAuto = document.getElementById('btn-generate-auto');
    const btnGenerateFilter = document.getElementById('btn-generate-filter');
    const btnGenerateDream = document.getElementById('btn-generate-dream');
    const btnGenerateHoro = document.getElementById('btn-generate-horo');

    const includeGrid = document.getElementById('include-numbers-grid');
    const excludeGrid = document.getElementById('exclude-numbers-grid');

    const dreamInput = document.getElementById('dream-input');
    const btnDreamSearch = document.getElementById('btn-dream-search');
    const dreamTagsContainer = document.getElementById('dream-tags-container');
    const dreamResultMsg = document.getElementById('dream-result-msg');

    const horoName = document.getElementById('horo-name');
    const horoBirth = document.getElementById('horo-birth');
    const horoTime = document.getElementById('horo-time');

    const ballsRowContainer = document.getElementById('balls-row-container');
    const quickStatsPanel = document.getElementById('quick-stats-panel');
    const oddEvenRatioSpan = document.getElementById('odd-even-ratio');
    const sumValueSpan = document.getElementById('sum-value');
    const avgValueSpan = document.getElementById('avg-value');

    const soundToggle = document.getElementById('sound-toggle');
    const soundOnIcon = soundToggle.querySelector('.sound-on-icon');
    const soundOffIcon = soundToggle.querySelector('.sound-off-icon');

    const historyListBody = document.getElementById('history-list-body');
    const btnClearHistory = document.getElementById('btn-clear-history');
    const btnDownloadHistory = document.getElementById('btn-download-history');
    const toast = document.getElementById('toast');

    // Set today's date default in birthdate field for convenience
    const todayStr = new Date().toISOString().split('T')[0];
    horoBirth.value = "1995-01-01"; // Generic default

    // -------------------------------------------------------------
    // 4. WEB AUDIO SOUND ENGINE (Synthesizer)
    // -------------------------------------------------------------
    let audioCtx = null;

    function playPopSound() {
        if (!soundEnabled) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc.type = 'sine';
            const now = audioCtx.currentTime;

            // Pitch drops quickly (bubble pop effect)
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

            // Volume envelope
            gainNode.gain.setValueAtTime(0.01, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            osc.start(now);
            osc.stop(now + 0.13);
        } catch (err) {
            console.warn("Audio Context error ignored:", err);
        }
    }

    // Toggle Sound Button handler
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundOnIcon.classList.remove('hidden');
            soundOffIcon.classList.add('hidden');
            showToast("🔊 효과음이 켜졌습니다.");
            playPopSound(); // Immediate feedback
        } else {
            soundOnIcon.classList.add('hidden');
            soundOffIcon.classList.remove('hidden');
            showToast("🔇 효과음이 꺼졌습니다.");
        }
    });

    // Toast Utility
    let toastTimeout = null;
    function showToast(message) {
        clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.remove('hidden', 'hide');
        
        toastTimeout = setTimeout(() => {
            toast.classList.add('hide');
            toastTimeout = setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 2500);
    }

    // -------------------------------------------------------------
    // 5. TABS NAVIGATION CONTROL
    // -------------------------------------------------------------
    const tabs = [
        { btn: tabAuto, panel: panelAuto },
        { btn: tabFilter, panel: panelFilter },
        { btn: tabDream, panel: panelDream },
        { btn: tabHoroscope, panel: panelHoroscope }
    ];

    tabs.forEach(tab => {
        tab.btn.addEventListener('click', () => {
            if (isDrawing) return; // Prevent tab switching during drawing simulation
            
            tabs.forEach(t => {
                t.btn.classList.remove('active');
                t.btn.setAttribute('aria-selected', 'false');
                t.panel.classList.remove('active');
            });
            tab.btn.classList.add('active');
            tab.btn.setAttribute('aria-selected', 'true');
            tab.panel.classList.add('active');
        });
    });

    // -------------------------------------------------------------
    // 6. FILTER MODES GRID SETUP
    // -------------------------------------------------------------
    function renderFilterGrid() {
        includeGrid.innerHTML = '';
        excludeGrid.innerHTML = '';

        for (let i = 1; i <= 45; i++) {
            // Inclusion grid button
            const incBtn = document.createElement('button');
            incBtn.className = 'num-btn';
            incBtn.type = 'button';
            incBtn.textContent = i;
            incBtn.addEventListener('click', () => toggleInclusion(i, incBtn));
            includeGrid.appendChild(incBtn);

            // Exclusion grid button
            const excBtn = document.createElement('button');
            excBtn.className = 'num-btn';
            excBtn.type = 'button';
            excBtn.textContent = i;
            excBtn.addEventListener('click', () => toggleExclusion(i, excBtn));
            excludeGrid.appendChild(excBtn);
        }
    }

    function toggleInclusion(num, element) {
        if (isDrawing) return;
        
        if (includeNumbers.has(num)) {
            includeNumbers.delete(num);
            element.classList.remove('included');
        } else {
            if (includeNumbers.size >= 5) {
                showToast("포함할 번호는 최대 5개까지만 선택 가능합니다.");
                return;
            }
            if (excludeNumbers.has(num)) {
                // Remove from excluded list first
                excludeNumbers.delete(num);
                const excElement = excludeGrid.children[num - 1];
                excElement.classList.remove('excluded');
            }
            includeNumbers.add(num);
            element.classList.add('included');
        }
    }

    function toggleExclusion(num, element) {
        if (isDrawing) return;

        if (excludeNumbers.has(num)) {
            excludeNumbers.delete(num);
            element.classList.remove('excluded');
        } else {
            if (excludeNumbers.size >= 39) {
                showToast("너무 많은 번호를 제외하면 로또 생성이 불가능합니다.");
                return;
            }
            if (includeNumbers.has(num)) {
                // Remove from included list first
                includeNumbers.delete(num);
                const incElement = includeGrid.children[num - 1];
                incElement.classList.remove('included');
            }
            excludeNumbers.add(num);
            element.classList.add('excluded');
        }
    }

    renderFilterGrid();

    // -------------------------------------------------------------
    // 7. DREAM KEYWORD MATCHING ENGINE
    // -------------------------------------------------------------
    let dreamSelectedKeywords = [];

    // Trigger tags in tag-cloud click
    dreamTagsContainer.addEventListener('click', (e) => {
        if (isDrawing) return;
        const targetBtn = e.target.closest('.tag-btn');
        if (!targetBtn) return;
        
        const word = targetBtn.getAttribute('data-word');
        selectDreamKeyword(word, targetBtn);
    });

    // Custom dream text input search
    btnDreamSearch.addEventListener('click', () => {
        if (isDrawing) return;
        const text = dreamInput.value.trim();
        if (!text) {
            showToast("꿈 키워드를 입력해 주세요.");
            return;
        }

        // Fuzzy match dictionary keys
        let matchedKey = null;
        for (let key in DREAM_DATABASE) {
            if (text.includes(key) || key.includes(text)) {
                matchedKey = key;
                break;
            }
        }

        if (matchedKey) {
            // Find tag if it exists and highlight it
            const tagBtn = Array.from(dreamTagsContainer.querySelectorAll('.tag-btn'))
                                .find(btn => btn.getAttribute('data-word') === matchedKey);
            selectDreamKeyword(matchedKey, tagBtn);
            dreamInput.value = '';
        } else {
            // Fallback: If no exact key, hash the keyword to generate a personalized set of numbers
            const generatedHashNumbers = hashTextToNumbers(text, 6);
            dreamResultMsg.innerHTML = `🔮 <strong>"${text}"</strong> 꿈 해몽 결과: <br>
            꿈 사전 데이터에는 없는 신비한 꿈이군요! 우주의 파동 분석을 통해 이 꿈의 고유 해몽 번호 <strong>(${generatedHashNumbers.join(', ')})</strong>를 산출해 냈습니다.`;
            dreamResultMsg.classList.remove('hidden');
            
            // Allow generation button using these custom numbers
            dreamSelectedKeywords = [{
                word: text,
                numbers: generatedHashNumbers,
                custom: true
            }];
            
            // Enable generate button
            btnGenerateDream.disabled = false;
            btnGenerateDream.classList.remove('disabled');
        }
    });

    function selectDreamKeyword(word, element) {
        // Toggle behavior
        const existingIdx = dreamSelectedKeywords.findIndex(k => k.word === word);
        
        if (existingIdx !== -1) {
            dreamSelectedKeywords.splice(existingIdx, 1);
            if (element) element.classList.remove('selected');
        } else {
            // Clean other tags if we only want 1 or 2 keywords at a time
            if (dreamSelectedKeywords.length >= 2) {
                const oldest = dreamSelectedKeywords.shift();
                const oldestTag = Array.from(dreamTagsContainer.querySelectorAll('.tag-btn'))
                                     .find(btn => btn.getAttribute('data-word') === oldest.word);
                if (oldestTag) oldestTag.classList.remove('selected');
            }
            
            const dbData = DREAM_DATABASE[word];
            dreamSelectedKeywords.push({
                word: word,
                numbers: dbData.numbers,
                desc: dbData.desc
            });
            if (element) element.classList.add('selected');
        }

        // Render result description box
        if (dreamSelectedKeywords.length > 0) {
            let fullDescription = dreamSelectedKeywords.map(k => k.desc || `꿈 분석 단어: ${k.word}`).join('<br><br>');
            dreamResultMsg.innerHTML = `✨ <strong>선택된 꿈 조합 해몽:</strong><br>${fullDescription}`;
            dreamResultMsg.classList.remove('hidden');
            btnGenerateDream.disabled = false;
            btnGenerateDream.classList.remove('disabled');
        } else {
            dreamResultMsg.innerHTML = '';
            dreamResultMsg.classList.add('hidden');
            btnGenerateDream.disabled = true;
            btnGenerateDream.classList.add('disabled');
        }
    }

    // Helper: String hash generator for non-existing keywords
    function hashTextToNumbers(text, count) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = (hash << 5) - hash + text.charCodeAt(i);
            hash |= 0;
        }
        
        // Seeded random sequence
        function random() {
            let x = Math.sin(hash++) * 10000;
            return x - Math.floor(x);
        }

        const pool = Array.from({ length: 45 }, (_, i) => i + 1);
        const results = [];
        for (let i = 0; i < count; i++) {
            const index = Math.floor(random() * pool.length);
            results.push(pool.splice(index, 1)[0]);
        }
        return results.sort((a, b) => a - b);
    }

    // -------------------------------------------------------------
    // 8. CANVAS PHYSICS ENGINE - LOTTO CHAMBER DRAW
    // -------------------------------------------------------------
    const canvas = document.getElementById('chamber-canvas');
    const ctx = canvas.getContext('2d');
    
    // Scale canvas properly for High-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = 200;
    const centerY = 200;
    const chamberRadius = 165;
    
    let spinIntensity = 0.5;
    let balls = [];

    // Particle Ball definition
    class PhysicsBall {
        constructor(number, x, y) {
            this.number = number;
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 5;
            this.vy = (Math.random() - 0.5) * 5;
            // Radius scales dynamically based on canvas container bounds
            this.radius = 11.5; 
        }

        update() {
            // Apply pneumatic blower force from the bottom half of circle
            if (this.y > centerY + chamberRadius * 0.2) {
                this.vy -= (0.28 * spinIntensity + Math.random() * 0.15);
                this.vx += (Math.random() - 0.5) * 2.2 * spinIntensity;
            } else {
                // Slowly pull downwards (gravity)
                this.vy += 0.16;
            }

            // Wind turbulence in the middle
            this.vx += (Math.random() - 0.5) * 0.3 * spinIntensity;
            this.vy += (Math.random() - 0.5) * 0.3 * spinIntensity;

            // Apply friction
            this.vx *= 0.985;
            this.vy *= 0.985;

            // Update coords
            this.x += this.vx;
            this.y += this.vy;

            // Boundary collision inside the chamber
            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist + this.radius > chamberRadius) {
                const nx = dx / dist;
                const ny = dy / dist;

                // Push ball back inside
                this.x = centerX + nx * (chamberRadius - this.radius);
                this.y = centerY + ny * (chamberRadius - this.radius);

                // Reflect velocities
                const dotProduct = this.vx * nx + this.vy * ny;
                this.vx = (this.vx - 2 * dotProduct * nx) * 0.85;
                this.vy = (this.vy - 2 * dotProduct * ny) * 0.85;

                // Minor bounce jitter
                this.vx += (Math.random() - 0.5) * 0.4;
                this.vy += (Math.random() - 0.5) * 0.4;
            }
        }

        draw(c) {
            c.save();
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

            let colorHex = '#7f8c8d';
            if (this.number <= 10) colorHex = '#ffca28'; // Golden Yellow
            else if (this.number <= 20) colorHex = '#42a5f5'; // Vibrant Blue
            else if (this.number <= 30) colorHex = '#ef5350'; // Hot Coral Red
            else if (this.number <= 40) colorHex = '#ab47bc'; // Purple Gray
            else colorHex = '#66bb6a'; // Emerald Green

            // Draw radial color gradient (glossy 3D circle)
            const gradient = c.createRadialGradient(
                this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.05,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, colorHex);
            gradient.addColorStop(1, '#05030f');

            c.fillStyle = gradient;
            c.fill();
            
            // Border
            c.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            c.lineWidth = 1;
            c.stroke();

            // Text
            c.fillStyle = this.number <= 10 ? '#111' : '#fff';
            c.font = `bold ${Math.floor(this.radius * 0.95)}px 'Outfit', sans-serif`;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(this.number, this.x, this.y + 0.5);
            c.restore();
        }
    }

    // Initialize all 45 balls inside the chamber
    function initPhysicsBalls() {
        balls = [];
        for (let i = 1; i <= 45; i++) {
            // Spread out starting positions in the center area to prevent clipping errors
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * (chamberRadius - 25);
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;
            balls.push(new PhysicsBall(i, x, y));
        }
    }

    // Loop renderer
    function animateChamber() {
        ctx.clearRect(0, 0, 400, 400);

        // Draw inner mechanical rotating fan (Visual decoration)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(Date.now() * 0.003 * spinIntensity);
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fill();
        // Inner fan spokes
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.fillRect(-3, -chamberRadius, 6, 40);
        }
        ctx.restore();

        // Draw and update balls
        balls.forEach(ball => {
            ball.update();
            ball.draw(ctx);
        });

        requestAnimationFrame(animateChamber);
    }

    // Initialize
    initPhysicsBalls();
    animateChamber();

    // -------------------------------------------------------------
    // 9. LOTTO GENERATOR ALGORITHMS & SIMULATOR DRAW
    // -------------------------------------------------------------

    // Tab 1: Complete Auto random generator
    function generateAutoRandom() {
        const pool = Array.from({ length: 45 }, (_, i) => i + 1);
        const draw = [];
        for (let i = 0; i < 6; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            draw.push(pool.splice(idx, 1)[0]);
        }
        return draw.sort((a, b) => a - b);
    }

    // Tab 2: Filters-based generator
    function generateFilteredNumbers() {
        // Collect available pool (1 to 45 minus Exclude list)
        const pool = [];
        for (let i = 1; i <= 45; i++) {
            if (!excludeNumbers.has(i)) {
                pool.push(i);
            }
        }

        // Validate pool size
        const neededRandomCount = 6 - includeNumbers.size;
        if (pool.length < neededRandomCount) {
            showToast("제외수를 너무 많이 지정하여 6개의 번호를 선택할 수 없습니다.");
            return null;
        }

        // Pre-fill include numbers
        const draw = Array.from(includeNumbers);

        // Remove include numbers from selection pool to avoid duplicates
        const filteredPool = pool.filter(n => !includeNumbers.has(n));

        // Draw remaining numbers randomly
        for (let i = 0; i < neededRandomCount; i++) {
            const idx = Math.floor(Math.random() * filteredPool.length);
            draw.push(filteredPool.splice(idx, 1)[0]);
        }

        return draw.sort((a, b) => a - b);
    }

    // Tab 3: Dream based generator
    function generateDreamNumbers() {
        if (dreamSelectedKeywords.length === 0) return null;
        
        // Accumulate dream seed numbers
        let seedPool = [];
        dreamSelectedKeywords.forEach(keyword => {
            seedPool.push(...keyword.numbers);
        });

        // Unique values
        seedPool = [...new Set(seedPool)];

        // Generate full 6 lotto set
        const draw = [];
        // 1. Add dream numbers (up to 4 to leave room for random magic)
        const dreamToInclude = seedPool.slice(0, 4);
        draw.push(...dreamToInclude);

        // 2. Pad remaining with random numbers
        const remainingCount = 6 - draw.length;
        const randomPool = Array.from({ length: 45 }, (_, i) => i + 1).filter(n => !draw.includes(n));
        
        for (let i = 0; i < remainingCount; i++) {
            const idx = Math.floor(Math.random() * randomPool.length);
            draw.push(randomPool.splice(idx, 1)[0]);
        }

        return draw.sort((a, b) => a - b);
    }

    // Tab 4: Horoscope based seeded generator
    function generateHoroscopeNumbers() {
        const name = horoName.value.trim();
        const birth = horoBirth.value;
        const time = horoTime.value;

        if (!name) {
            showToast("이름을 입력해 주세요.");
            return null;
        }
        if (!birth) {
            showToast("생년월일을 선택해 주세요.");
            return null;
        }

        // Add today's date string into seed to ensure it changes every day
        const dateStr = new Date().toDateString();
        const seedStr = `${name}-${birth}-${time}-${dateStr}`;

        // Hash code calculation
        let seed = 0;
        for (let i = 0; i < seedStr.length; i++) {
            seed = (seed << 5) - seed + seedStr.charCodeAt(i);
            seed |= 0; // force to 32bit integer
        }

        // Custom LCG seeded generator
        function seededRandom() {
            let x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        const pool = Array.from({ length: 45 }, (_, i) => i + 1);
        const draw = [];
        for (let i = 0; i < 6; i++) {
            const idx = Math.floor(seededRandom() * pool.length);
            draw.push(pool.splice(idx, 1)[0]);
        }

        return draw.sort((a, b) => a - b);
    }

    // MAIN INITIATOR: Drawing animation sequence wrapper
    function runDrawSequence(modeName, drawFunc) {
        if (isDrawing) return;

        const drawnNumbers = drawFunc();
        if (!drawnNumbers) return; // Terminate if logic checks failed

        isDrawing = true;
        currentDrawnSet = drawnNumbers;
        
        // 1. Reset visual display and stats
        ballsRowContainer.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const placeHolder = document.createElement('div');
            placeHolder.className = 'ball-placeholder';
            placeHolder.textContent = '?';
            ballsRowContainer.appendChild(placeHolder);
        }
        quickStatsPanel.classList.add('hidden');

        // 2. Increase physics animation intensity
        spinIntensity = 4.0;
        
        // 3. Sequential ball popping sequence
        let drawnIndex = 0;
        const popInterval = setInterval(() => {
            if (drawnIndex < 6) {
                const targetNumber = drawnNumbers[drawnIndex];
                
                // Audio synthesis
                playPopSound();

                // Create visual ball
                const ballEl = document.createElement('div');
                
                let rangeClass = 'num-1-10';
                if (targetNumber <= 10) rangeClass = 'num-1-10';
                else if (targetNumber <= 20) rangeClass = 'num-11-20';
                else if (targetNumber <= 30) rangeClass = 'num-21-30';
                else if (targetNumber <= 40) rangeClass = 'num-31-40';
                else rangeClass = 'num-41-45';

                ballEl.className = `lotto-ball ${rangeClass}`;
                ballEl.textContent = targetNumber;

                // Replace placeholder in row
                ballsRowContainer.replaceChild(ballEl, ballsRowContainer.children[drawnIndex]);

                // Physics feedback (apply impact to canvas balls)
                balls.forEach(b => {
                    if (b.number === targetNumber) {
                        // Launch it downward as if escaping out of chamber tube
                        b.y = centerY + chamberRadius;
                        b.vy = 5; 
                    }
                });

                drawnIndex++;
            } else {
                // Done drawing all balls
                clearInterval(popInterval);
                finishDraw(modeName, drawnNumbers);
            }
        }, 600);
    }

    function finishDraw(modeName, numbers) {
        isDrawing = false;
        spinIntensity = 0.5; // restore normal spin speed

        // 1. Calculate and display statistics
        let oddCount = 0;
        let evenCount = 0;
        let sum = 0;

        numbers.forEach(n => {
            sum += n;
            if (n % 2 === 0) evenCount++;
            else oddCount++;
        });

        const avg = (sum / 6).toFixed(1);

        oddEvenRatioSpan.textContent = `${oddCount} : ${evenCount}`;
        sumValueSpan.textContent = sum;
        avgValueSpan.textContent = avg;

        quickStatsPanel.classList.remove('hidden');

        // 2. Log to history list
        addHistoryItem(modeName, numbers, oddCount, evenCount, sum);

        showToast("✨ 새로운 행운의 번호가 추출되었습니다!");
    }

    // Button Bindings
    btnGenerateAuto.addEventListener('click', () => {
        runDrawSequence("자동 무작위", generateAutoRandom);
    });

    btnGenerateFilter.addEventListener('click', () => {
        runDrawSequence("필터 조건", generateFilteredNumbers);
    });

    btnGenerateDream.addEventListener('click', () => {
        runDrawSequence("꿈 해몽", generateDreamNumbers);
    });

    btnGenerateHoro.addEventListener('click', () => {
        runDrawSequence("사주 운세", generateHoroscopeNumbers);
    });

    // -------------------------------------------------------------
    // 10. HISTORY MANAGEMENT & LOCALSTORAGE STORAGE
    // -------------------------------------------------------------
    function renderHistory() {
        // Clean current rows
        const rows = historyListBody.querySelectorAll('tr:not(#history-empty-row)');
        rows.forEach(r => r.remove());

        if (history.length === 0) {
            document.getElementById('history-empty-row').style.display = 'table-row';
            return;
        }

        document.getElementById('history-empty-row').style.display = 'none';

        history.forEach((item, index) => {
            const tr = document.createElement('tr');
            
            // Time formatting
            const timeTd = document.createElement('td');
            timeTd.textContent = item.time;
            tr.appendChild(timeTd);

            // Mode Badge
            const typeTd = document.createElement('td');
            let badgeClass = 'auto';
            if (item.mode === "필터 조건") badgeClass = 'filter';
            else if (item.mode === "꿈 해몽") badgeClass = 'dream';
            else if (item.mode === "사주 운세") badgeClass = 'horoscope';
            
            typeTd.innerHTML = `<span class="history-type-badge ${badgeClass}">${item.mode}</span>`;
            tr.appendChild(typeTd);

            // Numbers Ball row
            const ballsTd = document.createElement('td');
            const ballsRow = document.createElement('div');
            ballsRow.className = 'history-balls-row';

            item.numbers.forEach(num => {
                const ball = document.createElement('div');
                let colorClass = 'num-1-10';
                if (num <= 10) colorClass = 'num-1-10';
                else if (num <= 20) colorClass = 'num-11-20';
                else if (num <= 30) colorClass = 'num-21-30';
                else if (num <= 40) colorClass = 'num-31-40';
                else colorClass = 'num-41-45';
                
                ball.className = `history-ball ${colorClass}`;
                ball.textContent = num;
                ballsRow.appendChild(ball);
            });
            ballsTd.appendChild(ballsRow);
            tr.appendChild(ballsTd);

            // Stats (Ratio / Sum)
            const statsTd = document.createElement('td');
            statsTd.className = 'history-stats-col';
            statsTd.textContent = `홀짝 ${item.odd}:${item.even} (합: ${item.sum})`;
            tr.appendChild(statsTd);

            // Actions (Delete individual button)
            const actionTd = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete';
            deleteBtn.setAttribute('aria-label', `${item.time} 추천 번호 삭제`);
            deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            `;
            deleteBtn.addEventListener('click', () => deleteHistoryItem(index));
            actionTd.appendChild(deleteBtn);
            tr.appendChild(actionTd);

            historyListBody.appendChild(tr);
        });
    }

    function addHistoryItem(mode, numbers, odd, even, sum) {
        const now = new Date();
        const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const newItem = {
            time: timeStr,
            mode: mode,
            numbers: numbers,
            odd: odd,
            even: even,
            sum: sum
        };

        // Add to front of history list
        history.unshift(newItem);

        // Keep maximum history size of 50
        if (history.length > 50) {
            history.pop();
        }

        saveHistoryToStorage();
        renderHistory();
    }

    function deleteHistoryItem(index) {
        history.splice(index, 1);
        saveHistoryToStorage();
        renderHistory();
        showToast("추천 번호 이력이 삭제되었습니다.");
    }

    function saveHistoryToStorage() {
        try {
            localStorage.setItem('lotto_dream_history', JSON.stringify(history));
        } catch (e) {
            console.error("Local storage save error", e);
        }
    }

    // Clear All history items
    btnClearHistory.addEventListener('click', () => {
        if (history.length === 0) return;
        if (confirm("모든 로또 번호 추천 기록을 지우시겠습니까?")) {
            history = [];
            saveHistoryToStorage();
            renderHistory();
            showToast("이력 보관함이 완전히 비워졌습니다.");
        }
    });

    // Exporter: Text file generator for history list
    btnDownloadHistory.addEventListener('click', () => {
        if (history.length === 0) {
            showToast("다운로드할 이력이 없습니다.");
            return;
        }

        let txtContent = "=========================================\r\n";
        txtContent += "       LOTTO DREAM CREATOR 추천 이력      \r\n";
        txtContent += "=========================================\r\n\r\n";

        history.forEach(item => {
            txtContent += `[${item.time}] 유형: ${item.mode}\r\n`;
            txtContent += `추천번호: ${item.numbers.join(', ')}\r\n`;
            txtContent += `분석결과: 홀짝 비율 ${item.odd}:${item.even} / 총합 ${item.sum}\r\n`;
            txtContent += "-----------------------------------------\r\n";
        });

        // Trigger file download
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lotto_dream_creator_history.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast("💾 텍스트 파일이 저장되었습니다.");
    });

    // Render history initially
    renderHistory();
});
