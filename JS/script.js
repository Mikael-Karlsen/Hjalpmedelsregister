const boendeData = {
    "Boende A": {
        beskrivning: "Hjälpmedel för Boende A.",
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
        beskrivning: "Hjälpmedel för Boende B.",
        plan: { "Plan 1": [], "Plan 2": [] }
    },
    "Boende C": {
        beskrivning: "Hjälpmedel för Boende C.",
        plan: { "Plan 1": [], "Plan 2": [], "Plan 3": [], "Plan 4": [] }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const boendeLankar = document.querySelectorAll('.list-item');
    const mainContent = document.getElementById('main-content');

    boendeLankar.forEach(lank => {
        lank.addEventListener('click', (e) => {
            e.preventDefault();
            
            const namn = lank.innerText;
            const data = boendeData[namn];

            boendeLankar.forEach(item => item.classList.remove('active'));
            lank.classList.add('active');

            mainContent.innerHTML = `
                <header class="content-header">
                    <h1>${namn}</h1>
                    <p>${data.beskrivning}</p>
                    <nav class="floor-nav">
                        ${Object.keys(data.plan).map(p => `<button class="floor-btn">${p}</button>`).join('')}
                    </nav>
                </header>
                <div class="dashboard-grid" id="room-grid">
                    <p style="color: var(--text-light-color);">Välj en våning ovan för att se rum...</p>
                </div>
            `;
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('floor-btn')) {
            // Hantera aktiv stil på knapparna
            document.querySelectorAll('.floor-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Hämta vilket boende och vilken våning som är vald
            const valtBoendeNamn = document.querySelector('.list-item.active').innerText;
            const valdVaningNamn = e.target.innerText;
            
            renderRum(valtBoendeNamn, valdVaningNamn);
        }
    });
});

function renderRum(boendeNamn, vaningNamn) {
    const grid = document.getElementById('room-grid');
    const rumData = boendeData[boendeNamn].plan[vaningNamn];

    if (!rumData || rumData.length === 0) {
        grid.innerHTML = `<p>Inga rum registrerade.</p>`;
        return;
    }

    grid.innerHTML = rumData.map(r => `
        <div class="stat-card ${r.status === 'Warning' ? 'urgent' : ''}" 
             onclick="visaDetaljer('${boendeNamn}', '${vaningNamn}', '${r.rum}')" 
             style="cursor:pointer">
            <div class="card-header">
                <h3>Rum ${r.rum}</h3>
                <span class="badge ${r.status === 'Warning' ? 'warning' : ''}">${r.status}</span>
            </div>
            <div class="card-body">
                <p><strong>Hjälpmedel:</strong> ${r.hjalpmedel.length} st</p>
            </div>
        </div>
    `).join('');
}

function visaDetaljer(boende, vaning, rumNr) {
    const panel = document.getElementById('details-panel');
    const overlay = document.getElementById('panel-overlay');
    const content = document.getElementById('panel-content');
    const title = document.getElementById('panel-title');
    
    const rumObj = boendeData[boende].plan[vaning].find(r => r.rum === rumNr);
    
    title.innerText = `Rum ${rumNr}`;
    panel.classList.add('open');

    content.innerHTML = rumObj.hjalpmedel.map(h => `
        <div class="hjalpmedel-item">
            <h4 style="margin-top:0; color:var(--accent-color);">${h.typ}</h4>
            <p><strong>Status:</strong> ${rumObj.status}</p>
            <p><strong>HMC-ID:</strong> ${h.hmcId}</p>
            <p><strong>Internt ID:</strong> ${h.interntId}</p>
            <p><strong>Nästa besiktning:</strong> ${h.nastaBesiktning}</p>
            <button class="floor-btn" style="width:100%; margin-top:10px;">Redigera info</button>
        </div>
    `).join('');

    panel.classList.add('open');
    overlay.classList.add('active'); // Tänder dimman
    document.body.style.overflow = 'hidden';
}

function closePanel() {
    document.getElementById('details-panel').classList.remove('open');
    document.getElementById('panel-overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}