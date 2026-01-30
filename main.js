// === DOM 元素引用 ===
const table = document.getElementById('table');
const legend = document.getElementById('legend');
const modal = document.getElementById('modal');
const atomContainer = document.getElementById('atomContainer');

// === 状态变量 ===
let currentActiveCategory = null;
let currentLanguage = 'zh'; // 'zh' for Chinese, 'en' for English
let rotX = 0;
let rotY = 0;
let isDragging = false;
let lastMouseX, lastMouseY;

// === 语言相关辅助函数 ===
function getLocalizedText(key, lang = currentLanguage) {
    const translations = {
        zh: {
            'alkali-metal': '碱金属',
            'alkaline-earth-metal': '碱土金属',
            'transition-metal': '过渡金属',
            'post-transition-metal': '后过渡金属',
            'metalloid': '类金属',
            'nonmetal': '非金属',
            'halogen': '卤素',
            'noble-gas': '稀有气体',
            'lanthanide': '镧系',
            'actinide': '锕系',
            'lanthanides': '镧系',
            'actinides': '锕系',
            'search-placeholder': '查找元素...',
            'standard': '标准',
            'radius': '半径',
            'electronegativity': '电负性',
            'ionization-energy': '电离能',
            'melting-point': '熔点',
            'boiling-point': '沸点',
            'electron-configuration': '电子排布',
            'common-oxidation-states': '常见化合价',
            'physical-properties': '物理性质',
            'isotopes': '同位素 (● 稳定)',
            'atomic-number': '原子序数',
            'atomic-mass': '相对原子质量',
            'atomic-radius': '原子半径 (pm)',
            'electronegativity': '电负性',
            'ionization-energy-kj': '电离能 (kJ/mol)',
            'melting-point-k': '熔点 (K)',
            'boiling-point-k': '沸点 (K)',
            'layers': '分层',
            'no-data': '暂无数据',
            'drag-rotate': '拖拽旋转视角',
        'rotate-hint': '💡 横屏查看效果更佳',
        'periodic-table-title': '元素周期表'
        },
        en: {
            'alkali-metal': 'Alkali Metal',
            'alkaline-earth-metal': 'Alkaline Earth Metal',
            'transition-metal': 'Transition Metal',
            'post-transition-metal': 'Post-transition Metal',
            'metalloid': 'Metalloid',
            'nonmetal': 'Nonmetal',
            'halogen': 'Halogen',
            'noble-gas': 'Noble Gas',
            'lanthanide': 'Lanthanide',
            'actinide': 'Actinide',
            'lanthanides': 'Lanthanides',
            'actinides': 'Actinides',
            'search-placeholder': 'Search elements...',
            'standard': 'Standard',
            'radius': 'Radius',
            'electronegativity': 'Electronegativity',
            'ionization-energy': 'Ionization Energy',
            'melting-point': 'Melting Point',
            'boiling-point': 'Boiling Point',
            'electron-configuration': 'Electron Configuration',
            'common-oxidation-states': 'Common Oxidation States',
            'physical-properties': 'Physical Properties',
            'isotopes': 'Isotopes (● Stable)',
            'atomic-number': 'Atomic Number',
            'atomic-mass': 'Atomic Mass',
            'atomic-radius': 'Atomic Radius (pm)',
            'electronegativity': 'Electronegativity',
            'ionization-energy-kj': 'Ionization Energy (kJ/mol)',
            'melting-point-k': 'Melting Point (K)',
            'boiling-point-k': 'Boiling Point (K)',
            'layers': 'Layers',
            'no-data': 'No data',
            'drag-rotate': 'Drag to rotate view',
        'rotate-hint': '💡 Better view in landscape mode',
        'periodic-table-title': 'Periodic Table'
        }
    };
    return translations[lang][key] || key;
}

function getElementName(element, lang = currentLanguage) {
    return lang === 'zh' ? element.name : element.enName;
}

function getCategoryName(category, lang = currentLanguage) {
    if (lang === 'zh') return category.name;

    // Map Chinese names to English keys
    const categoryMap = {
        "碱金属": "alkali-metal",
        "碱土金属": "alkaline-earth-metal",
        "过渡金属": "transition-metal",
        "后过渡金属": "post-transition-metal",
        "类金属": "metalloid",
        "非金属": "nonmetal",
        "卤素": "halogen",
        "稀有气体": "noble-gas",
        "镧系": "lanthanide",
        "锕系": "actinide"
    };

    const key = categoryMap[category.name];
    return key ? getLocalizedText(key, lang) : category.name;
}

// === 渲染图例 ===
function renderLegend() {
    legend.innerHTML = '';
    categories.forEach((c, i) => {
        const btn = document.createElement('div');
        btn.className = 'legend-item';
        btn.innerHTML = `<div class="legend-color" style="background:${c.color}"></div>${getCategoryName(c)}`;
        btn.onclick = () => toggleCategory(i, btn);
        legend.appendChild(btn);
    });
}

// === 渲染元素表格 ===
function renderTable() {
    table.innerHTML = '';

    // 创建元素格子
    elements.forEach((e, i) => {
        const [r, c] = getPos(e.idx);
        const el = document.createElement('div');
        el.className = 'element';
        el.style.gridRow = r;
        el.style.gridColumn = c;
        el.dataset.idx = e.idx;

        el.style.borderColor = e.cat.color;

        el.innerHTML = `
            <div class="atomic-number">${e.idx}</div>
            <div class="symbol" style="color:${e.cat.color}">${e.sym}</div>
            <div class="name">${getElementName(e)}</div>
            <div class="detail-val"></div>
        `;
        el.onclick = () => showModal(e);

        setTimeout(() => el.classList.add('visible'), i * 5);
        table.appendChild(el);
    });

    // 创建镧系/锕系占位符
    const placeholders = [
        { row: 6, col: 3, sym: "57-71", name: currentLanguage === 'zh' ? "镧系" : "Lanthanides", catIdx: 8, range: "La - Lu" },
        { row: 7, col: 3, sym: "89-103", name: currentLanguage === 'zh' ? "锕系" : "Actinides", catIdx: 9, range: "Ac - Lr" }
    ];

    placeholders.forEach(p => {
        const el = document.createElement('div');
        el.className = 'element placeholder';
        el.style.gridRow = p.row;
        el.style.gridColumn = p.col;

        const color = categories[p.catIdx].color;
        el.style.borderColor = color;

        el.innerHTML = `
            <div class="range-num" style="color:${color}">${p.sym}</div>
            <div class="name">${p.name}</div>
        `;

        el.onclick = () => {
            const btns = document.querySelectorAll('.legend-item');
            if (btns[p.catIdx]) btns[p.catIdx].click();
        };

        setTimeout(() => el.classList.add('visible'), 600);
        table.appendChild(el);
    });
}

// === 获取元素在周期表中的位置 ===

// === 获取元素在周期表中的位置 ===
function getPos(n) {
    if (n == 1) return [1, 1];
    if (n == 2) return [1, 18];
    if (n >= 3 && n <= 4) return [2, n - 2];
    if (n >= 5 && n <= 10) return [2, n + 8];
    if (n >= 11 && n <= 12) return [3, n - 10];
    if (n >= 13 && n <= 18) return [3, n];
    if (n >= 19 && n <= 36) return [4, n - 18];
    if (n >= 37 && n <= 54) return [5, n - 36];
    if (n >= 55 && n <= 56) return [6, n - 54];
    if (n >= 72 && n <= 86) return [6, n - 68];
    if (n >= 87 && n <= 88) return [7, n - 86];
    if (n >= 104 && n <= 118) return [7, n - 100];
    if (n >= 57 && n <= 71) return [9, n - 53];
    if (n >= 89 && n <= 103) return [10, n - 85];
    return [0, 0];
}

// === 计算电子排布 ===
function getElectronData(Z) {
    let config = {};
    let remaining = Z;

    for (let orb of orbitals) {
        if (remaining <= 0) break;
        let type = orb.charAt(1);
        let cap = capacities[type];
        let fill = Math.min(remaining, cap);
        config[orb] = fill;
        remaining -= fill;
    }

    if (exceptions[Z]) {
        const patch = exceptions[Z];
        for (let orb in patch) {
            config[orb] = patch[orb];
        }
    }

    const sortOrb = (a, b) => {
        let n1 = parseInt(a[0]), n2 = parseInt(b[0]);
        if (n1 !== n2) return n1 - n2;
        const order = "spdf";
        return order.indexOf(a[1]) - order.indexOf(b[1]);
    };

    const configStr = Object.keys(config)
        .filter(k => config[k] > 0)
        .sort(sortOrb)
        .map(k => `${k}<sup>${config[k]}</sup>`)
        .join(' ');

    let shells = [];
    Object.keys(config).forEach(orb => {
        let n = parseInt(orb[0]);
        shells[n - 1] = (shells[n - 1] || 0) + config[orb];
    });

    for (let i = 0; i < shells.length; i++) {
        if (!shells[i]) shells[i] = 0;
    }

    return { str: configStr, shells: shells };
}

// === 初始化 ===
function init() {
    renderLegend();
    renderTable();
    initDragControl();
    initSearch();
    initKeyboard();
}

// === 分类切换 ===
function toggleCategory(catId, btn) {
    if (document.querySelector('.periodic-table.heatmap-active')) {
        setMode('default');
    }

    const allElements = document.querySelectorAll('.element');
    const allBtns = document.querySelectorAll('.legend-item');

    if (currentActiveCategory === catId) {
        currentActiveCategory = null;
        allBtns.forEach(b => b.classList.remove('active'));
        allElements.forEach(el => {
            el.style.opacity = '1';
            el.style.filter = 'none';
        });
    } else {
        currentActiveCategory = catId;
        allBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        allElements.forEach(el => {
            if (el.dataset.idx) {
                const data = elements[el.dataset.idx - 1];
                if (data.catId === catId) {
                    el.style.opacity = '1';
                    el.style.filter = 'none';
                } else {
                    el.style.opacity = '0.1';
                    el.style.filter = 'grayscale(100%)';
                }
            }
            else if (el.classList.contains('placeholder')) {
                const phName = el.querySelector('.name').innerText;
                const isRelated = (catId === 8 && phName === '镧系') || (catId === 9 && phName === '锕系');

                if (isRelated) {
                    el.style.opacity = '1';
                    el.style.background = 'rgba(255,255,255,0.1)';
                } else {
                    el.style.opacity = '0.3';
                    el.style.background = 'transparent';
                }
            }
        });
    }
}

// === 模式切换（热力图等） ===
function setMode(mode) {
    currentActiveCategory = null;
    document.querySelectorAll('.legend-item').forEach(b => b.classList.remove('active'));

    const domElements = document.querySelectorAll('.element');
    const btns = document.querySelectorAll('.mode-btn');

    btns.forEach(b => b.classList.remove('active'));
    document.querySelector(`button[onclick="setMode('${mode}')"]`).classList.add('active');

    if (mode === 'default') {
        table.classList.remove('heatmap-active');
        domElements.forEach(el => {
            if (el.classList.contains('placeholder')) {
                el.style.background = 'rgba(255,255,255,0.01)';
                el.style.opacity = '1';
                return;
            }

            const data = elements[el.dataset.idx - 1];
            el.style.background = 'var(--card-bg)';
            el.style.borderColor = data.cat.color;
            el.querySelector('.symbol').style.color = data.cat.color;
            el.style.opacity = '1';
            el.style.filter = 'none';
        });
        return;
    }

    table.classList.add('heatmap-active');

    let maxVal = -Infinity, minVal = Infinity;
    elements.forEach(e => {
        let val = e[mode];
        if (val > 0) {
            if (val > maxVal) maxVal = val;
            if (val < minVal) minVal = val;
        }
    });

    domElements.forEach(el => {
        if (el.classList.contains('placeholder')) {
            el.style.opacity = '0.1';
            return;
        }

        const data = elements[el.dataset.idx - 1];
        const val = data[mode];
        const displayDiv = el.querySelector('.detail-val');

        el.style.opacity = '1';
        el.style.filter = 'none';

        if (val === 0) {
            el.style.background = '#222';
            el.style.borderColor = '#444';
            displayDiv.innerText = '-';
        } else {
            let ratio = (val - minVal) / (maxVal - minVal);
            let hue = 240 - (ratio * 240);
            el.style.background = `hsla(${hue}, 70%, 40%, 0.8)`;
            el.style.borderColor = `hsla(${hue}, 100%, 70%, 1)`;
            el.querySelector('.symbol').style.color = '#fff';
            displayDiv.innerText = val;
        }
    });
}

// === 设置语言 ===
function setLanguage(lang) {
    currentLanguage = lang;

    // 更新按钮状态
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');

    // 更新HTML语言属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // 更新界面文本
    document.getElementById('mode-standard').innerText = getLocalizedText('standard');
    document.getElementById('mode-radius').innerText = getLocalizedText('radius');
    document.getElementById('mode-electronegativity').innerText = getLocalizedText('electronegativity');
    document.getElementById('mode-ionization').innerText = getLocalizedText('ionization-energy');
    document.getElementById('mode-melting').innerText = getLocalizedText('melting-point');
    document.getElementById('mode-boiling').innerText = getLocalizedText('boiling-point');
    document.getElementById('searchInput').placeholder = getLocalizedText('search-placeholder');
    document.getElementById('rotate-hint').innerText = getLocalizedText('rotate-hint');
    document.getElementById('main-title').innerText = getLocalizedText('periodic-table-title');

    // 重新渲染整个表格和图例
    renderTable();
    renderLegend();

    // 如果模态框打开，更新其内容
    if (modal.classList.contains('open')) {
        const currentElement = elements.find(e => e.sym === document.getElementById('m-symbol').innerText);
        if (currentElement) {
            showModal(currentElement);
        }
    }
}

// === 渲染3D原子模型 ===
function render3DAtom(Z) {
    atomContainer.innerHTML = '';

    const nucleus = document.createElement('div');
    nucleus.className = 'nucleus';
    atomContainer.appendChild(nucleus);

    const { shells } = getElectronData(Z);

    shells.forEach((count, idx) => {
        if (count === 0) return;
        const isValence = (idx === shells.length - 1);
        const size = 40 + (idx * 25);

        const orbit = document.createElement('div');
        orbit.className = 'orbit-ring';
        orbit.style.width = `${size}px`;
        orbit.style.height = `${size}px`;
        orbit.style.top = `calc(50% - ${size / 2}px)`;
        orbit.style.left = `calc(50% - ${size / 2}px)`;

        const rx = Math.random() * 360, ry = Math.random() * 360;
        orbit.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

        const animDuration = 5 + idx * 2;
        orbit.animate([
            { transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(0deg)` },
            { transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(360deg)` }
        ], {
            duration: animDuration * 1000,
            iterations: Infinity,
            easing: 'linear'
        });

        for (let i = 0; i < count; i++) {
            const electron = document.createElement('div');
            electron.className = `electron ${isValence ? 'valence' : 'inner'}`;
            const angle = (360 / count) * i;
            electron.style.transform = `rotate(${angle}deg) translateX(${size / 2}px)`;
            orbit.appendChild(electron);
        }
        atomContainer.appendChild(orbit);
    });
    return shells;
}

// === 拖拽控制 ===
function initDragControl() {
    const wrapper = document.getElementById('atomWrapper');

    wrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;

        rotY += dx * 0.5;
        rotX -= dy * 0.5;

        atomContainer.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => isDragging = false);

    wrapper.addEventListener('touchstart', (e) => {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - lastMouseX;
        const dy = e.touches[0].clientY - lastMouseY;

        rotY += dx * 0.8;
        rotX -= dy * 0.8;

        atomContainer.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => isDragging = false);
}

// === 显示弹窗 ===
function showModal(data) {
    rotX = 0;
    rotY = 0;
    atomContainer.style.transform = `rotateX(0deg) rotateY(0deg)`;

    // 更新标签文本
    document.getElementById('electron-config-label').innerText = getLocalizedText('electron-configuration');
    document.getElementById('valence-label').innerText = getLocalizedText('common-oxidation-states');
    document.getElementById('properties-label').innerText = getLocalizedText('physical-properties');
    document.getElementById('isotopes-label').innerText = getLocalizedText('isotopes');
    document.getElementById('atomic-num-label').innerText = getLocalizedText('atomic-number');
    document.getElementById('atomic-mass-label').innerText = getLocalizedText('atomic-mass');
    document.getElementById('atomic-radius-label').innerText = getLocalizedText('atomic-radius');
    document.getElementById('electronegativity-label').innerText = getLocalizedText('electronegativity');
    document.getElementById('ionization-energy-label').innerText = getLocalizedText('ionization-energy-kj');
    document.getElementById('melting-point-label').innerText = getLocalizedText('melting-point-k');
    document.getElementById('boiling-point-label').innerText = getLocalizedText('boiling-point-k');
    document.getElementById('visualizer-hint').innerText = getLocalizedText('drag-rotate');

    document.getElementById('m-symbol').innerText = data.sym;
    document.getElementById('m-symbol').style.color = data.cat.color;
    document.getElementById('m-name').innerText = getElementName(data);
    document.getElementById('m-en-name').innerText = currentLanguage === 'zh' ? data.enName : data.name;
    document.getElementById('m-cat').innerText = getCategoryName(data.cat);
    document.getElementById('m-cat').style.borderColor = data.cat.color;
    document.getElementById('m-cat').style.color = data.cat.color;

    document.getElementById('m-num').innerText = data.idx;
    document.getElementById('m-mass').innerText = data.mass;
    document.getElementById('m-melt').innerText = data.melt || "—";
    document.getElementById('m-boil').innerText = data.boil || "—";
    document.getElementById('m-radius').innerText = data.radius || "—";
    document.getElementById('m-en').innerText = data.en || "—";
    document.getElementById('m-ip').innerText = data.ip || "—";

    const valenceContainer = document.getElementById('m-valence');
    valenceContainer.innerHTML = '';
    if (data.valence && data.valence.length > 0) {
        data.valence.forEach(v => {
            const tag = document.createElement('span');
            tag.className = 'valence-tag';
            tag.textContent = v;
            valenceContainer.appendChild(tag);
        });
    } else {
        valenceContainer.innerHTML = `<span style="color:#666">${getLocalizedText('no-data')}</span>`;
    }

    const isotopeContainer = document.getElementById('m-isotopes');
    isotopeContainer.innerHTML = '';
    if (data.isotopes && data.isotopes.length > 0) {
        data.isotopes.forEach(iso => {
            const tag = document.createElement('span');
            tag.className = `isotope-tag ${iso.s ? 'isotope-stable' : ''}`;
            tag.innerHTML = `<span class="mass-num">${iso.m}</span>${data.sym}${iso.s ? ' ●' : ''}`;
            isotopeContainer.appendChild(tag);
        });
    } else {
        isotopeContainer.innerHTML = `<span style="color:#666">${getLocalizedText('no-data')}</span>`;
    }

    const eData = getElectronData(data.idx);
    document.getElementById('m-config-sub').innerHTML = eData.str;
    document.getElementById('m-config-shell').innerText = `${getLocalizedText('layers')}: ${eData.shells.join(' - ')}`;

    render3DAtom(data.idx);
    modal.classList.add('open');

    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
}

// === 关闭弹窗 ===
function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => atomContainer.innerHTML = '', 300);
}

// === 搜索功能 ===
function initSearch() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();

        document.querySelectorAll('.element').forEach(el => {
            let match = false;

            if (el.classList.contains('placeholder')) {
                const textContent = el.innerText.toLowerCase();
                match = textContent.includes(val);
            }
            else if (el.dataset.idx) {
                const d = elements[el.dataset.idx - 1];
                match = d.name.includes(val) ||
                    d.sym.toLowerCase().includes(val) ||
                    String(d.idx) === val ||
                    d.enName.toLowerCase().includes(val);
            }

            if (val === '') {
                el.style.opacity = '1';
                el.style.filter = 'none';
            } else {
                el.style.opacity = match ? '1' : '0.1';
                el.style.filter = match ? 'none' : 'grayscale(100%)';
            }
        });
    });
}

// === 键盘事件 ===
function initKeyboard() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// === 弹窗点击背景关闭 ===
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// === 启动应用 ===
init();
