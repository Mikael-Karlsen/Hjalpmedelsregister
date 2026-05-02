let currentActiveRoom = null;

const boendeData = {
    "Boende A": {
        description: "Hjälpmedel för Boende A.",
        plan: {
            "Plan 1": [
                { 
                    rum: "101", 
                    status: "OK", 
                    hjalpmedel: [
                        { typ: "Rullstol", hmcId: "HMC-111", interntId: "A-01", nastaBesiktning: "2026-01-10" },
                        { typ: "Arbetsstol", hmcId: "HMC-112", interntId: "A-02", nastaBesiktning: "2026-05-12" }
                    ]
                },
                { 
                    rum: "102", 
                    status: "Warning", 
                    hjalpmedel: [
                        { typ: "Säng", hmcId: "HMC-222", interntId: "B-09", nastaBesiktning: "2025-11-15" }
                    ]
                }
            ],
            "Plan 2": [],
            "Plan 3": []
        }
    },
    "Boende B": {
        description: "Hjälpmedel för Boende B.",
        plan: { "Plan 1": [], "Plan 2": [] }
    },
    "Boende C": {
        description: "Hjälpmedel för Boende C.",
        plan: { "Plan 1": [], "Plan 2": [], "Plan 3": [], "Plan 4": [] }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const boendeLankar = document.querySelectorAll('.list-item');

    boendeLankar.forEach(lank => {
        lank.addEventListener('click', (e) => {
            e.preventDefault();
            const namn = lank.innerText;
            const data = boendeData[namn];

            boendeLankar.forEach(item => item.classList.remove('active'));
            lank.classList.add('active');

            renderPropertyView(namn, data);
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('floor-btn') && e.target.closest('.floor-nav')) {
            document.querySelectorAll('.floor-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            const selectedProperty = document.querySelector('.list-item.active').innerText;
            const selectedFloor = e.target.innerText;
            
            renderRooms(selectedProperty, selectedFloor);
        }
    });
});

function renderPropertyView(name, data) {
    const mainContent = document.querySelector('#main-content');
    mainContent.innerHTML = `
        <header class="content-header">
            <h1>${name}</h1>
            <p>${data.description}</p>
            <nav class="floor-nav">
                ${Object.keys(data.plan).map(p => `<button class="floor-btn">${p}</button>`).join('')}
            </nav>
        </header>
        <div class="dashboard-grid" id="room-grid">
            <p style="color: var(--text-light-color);">Välj en våning ovan för att se rum...</p>
        </div>
    `;
}

function renderRooms(propertyName, floorName) {
    const grid = document.querySelector('#room-grid');
    const rooms = boendeData[propertyName].plan[floorName];

    if (!rooms || rooms.length === 0) {
        grid.innerHTML = `<p style="color: var(--text-light-color);">Inga rum registrerade på denna våning.</p>`;
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    grid.innerHTML = rooms.map(r => {
        const isOverdue = r.hjalpmedel.some(h => h.nastaBesiktning <= today);
        const displayStatus = isOverdue ? 'Besiktning krävs' : 'OK';
        const cardClass = isOverdue ? 'urgent' : '';
        const badgeClass = isOverdue ? 'warning' : '';

        return `
            <div class="stat-card ${cardClass}" 
                 onclick="showDetails('${propertyName}', '${floorName}', '${r.rum}')" 
                 style="cursor:pointer">
                <div class="card-header">
                    <h3>Rum ${r.rum}</h3>
                    <span class="badge ${badgeClass}">${displayStatus}</span>
                </div>
                <div class="card-body">
                    <p><strong>Hjälpmedel:</strong> ${r.hjalpmedel.length} st</p>
                    <p style="font-size: 0.85rem; color: var(--text-light-color); margin-top: 10px;">Klicka för detaljer &rarr;</p>
                </div>
            </div>
        `;
    }).join('');
}

function showDetails(property, floor, roomNumber) {
    const panel = document.querySelector('#details-panel');
    const overlay = document.querySelector('#panel-overlay');
    const title = document.querySelector('#panel-title');
    
    currentActiveRoom = { property, floor, roomNumber };
    const roomObj = boendeData[property].plan[floor].find(r => r.rum === roomNumber);
    
    title.innerText = `Rum ${roomNumber}`;
    panel.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderDetailsContent(roomObj);
}

function renderDetailsContent(roomObj) {
    const content = document.querySelector('#panel-content');
    
    const itemsHtml = roomObj.hjalpmedel.map((h, index) => `
        <div class="hjalpmedel-item" id="item-${index}">
            <h4 style="margin-top:0; color:var(--accent-color); border-bottom:1px solid var(--border-color); padding-bottom:5px;">
                ${h.typ}
            </h4>
            <div class="info-grid">
                <p><strong>HMC-ID:</strong> <span>${h.hmcId || 'Ej angivet'}</span></p>
                <p><strong>Internt ID:</strong> <span>${h.interntId || 'Ej angivet'}</span></p>
                <p><strong>Nästa besiktning:</strong> <span>${h.nastaBesiktning}</span></p>
            </div>
            <button class="floor-btn" onclick="enableEditing(${index})" style="width:100%; margin-top:10px;">Redigera info</button>
        </div>
    `).join('');

    content.innerHTML = `
        ${itemsHtml}
        <div style="margin-top: 20px; padding: 10px; border: 2px dashed var(--border-color); border-radius: var(--radius-md); text-align: center;">
            <button class="floor-btn active" onclick="addNewEquipment()" style="width: 100%;">+ Lägg till hjälpmedel</button>
        </div>
    `;
}

function enableEditing(index) {
    const itemDiv = document.querySelector(`#item-${index}`);
    const { property, floor, roomNumber } = currentActiveRoom;
    const room = boendeData[property].plan[floor].find(r => r.rum === roomNumber);
    const h = room.hjalpmedel[index];

    const isExisting = h.hmcId !== "" || h.typ !== "Nytt hjälpmedel";

    itemDiv.innerHTML = `
        <div class="edit-form">
            <label>Typ av hjälpmedel:</label>
            <input type="text" id="edit-typ-${index}" value="${h.typ}">
            <label>HMC-ID:</label>
            <input type="text" id="edit-hmc-${index}" value="${h.hmcId}">
            <label>Internt ID:</label>
            <input type="text" id="edit-internt-${index}" value="${h.interntId}">
            <label>Nästa besiktning:</label>
            <input type="date" id="edit-date-${index}" value="${h.nastaBesiktning}">
            
            <div style="display:flex; gap:10px; margin-top:15px;">
                <button class="floor-btn active" onclick="saveEdit(${index})" style="flex:1">Spara</button>
                <button class="floor-btn" onclick="cancelEdit(${index})" style="flex:1; background:#ccc;">Avbryt</button>
            </div>
            
            ${isExisting ? `
                <button class="floor-btn" onclick="deleteEquipment(${index})" 
                        style="width:100%; margin-top:10px; background:#fee2e2; color:#ef4444; border-color:#fecaca;">
                    Ta bort hjälpmedel
                </button>
            ` : ''}
        </div>
    `;
}

function saveEdit(index) {
    const { property, floor, roomNumber } = currentActiveRoom;
    const room = boendeData[property].plan[floor].find(r => r.rum === roomNumber);
    const h = room.hjalpmedel[index];

    h.typ = document.querySelector(`#edit-typ-${index}`).value;
    h.hmcId = document.querySelector(`#edit-hmc-${index}`).value;
    h.interntId = document.querySelector(`#edit-internt-${index}`).value;
    h.nastaBesiktning = document.querySelector(`#edit-date-${index}`).value;

    renderDetailsContent(room);
    renderRooms(property, floor);

    const floorButtons = document.querySelectorAll('.floor-nav .floor-btn');
    floorButtons.forEach(btn => {
        if (btn.innerText.trim() === floor.trim()) {
            btn.classList.add('active');
        }
    });
}

function cancelEdit(index) {
    const { property, floor, roomNumber } = currentActiveRoom;
    const room = boendeData[property].plan[floor].find(r => r.rum === roomNumber);
    
    const h = room.hjalpmedel[index];
    if (h.hmcId === "" && h.typ === "Nytt hjälpmedel") {
        room.hjalpmedel.splice(index, 1);
    }

    renderDetailsContent(room);
    renderRooms(property, floor);
}

function deleteEquipment(index) {
    if (confirm("Är du säker på att du vill ta bort detta hjälpmedel?")) {
        const { property, floor, roomNumber } = currentActiveRoom;
        const room = boendeData[property].plan[floor].find(r => r.rum === roomNumber);
        
        room.hjalpmedel.splice(index, 1);

        renderDetailsContent(room);
        renderRooms(property, floor);
    }
}

function addNewEquipment() {
    const { property, floor, roomNumber } = currentActiveRoom;
    const room = boendeData[property].plan[floor].find(r => r.rum === roomNumber);

    const newItem = {
        typ: "Nytt hjälpmedel",
        hmcId: "",
        interntId: "",
        nastaBesiktning: new Date().toISOString().split('T')[0]
    };

    room.hjalpmedel.push(newItem);

    const newIndex = room.hjalpmedel.length - 1;

    renderDetailsContent(room);
    enableEditing(newIndex);
}

function closePanel() {
    document.querySelector('#details-panel').classList.remove('open');
    document.querySelector('#panel-overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}