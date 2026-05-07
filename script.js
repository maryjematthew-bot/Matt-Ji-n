/* =========================================
   FOOTBALL HUB APPLICATION
   FULL JAVASCRIPT SYSTEM
========================================= */

/* =========================================
   DOM ELEMENTS
========================================= */

const leagueSelect =
    document.getElementById("leagueSelect");

const loadMatchesBtn =
    document.getElementById("loadMatchesBtn");

const matchesGrid =
    document.getElementById("matchesGrid");

const loadingSection =
    document.getElementById("loadingSection");

const errorBox =
    document.getElementById("errorBox");

const teamSearch =
    document.getElementById("teamSearch");

const totalMatches =
    document.getElementById("totalMatches");

const totalGoals =
    document.getElementById("totalGoals");

const liveGames =
    document.getElementById("liveGames");

const themeToggle =
    document.getElementById("themeToggle");

const modal =
    document.getElementById("matchModal");

const modalBody =
    document.getElementById("modalBody");

const closeModal =
    document.getElementById("closeModal");

const showFinished =
    document.getElementById("showFinished");

const showLive =
    document.getElementById("showLive");

/* =========================================
   API CONFIGURATION
========================================= */

/*
===========================================
GET YOUR API KEY:
https://www.api-football.com/
===========================================
*/

const API_KEY =
    "YOUR_API_KEY_HERE";

const API_HOST =
    "v3.football.api-sports.io";

/* =========================================
   GLOBAL STATE
========================================= */

let allMatches = [];

let filteredMatches = [];

let currentLeague = "39";

let darkMode = true;

/* =========================================
   LEAGUE MAP
========================================= */

const leagues = {

    39: "Premier League",
    140: "La Liga",
    135: "Serie A",
    78: "Bundesliga",
    61: "Ligue 1"

};

/* =========================================
   INITIALIZATION
========================================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApp();

    }
);

/* =========================================
   INITIALIZE APP
========================================= */

function initializeApp() {

    loadTheme();

    loadSavedLeague();

    setupEventListeners();

    createParticles();

    loadMatches();

}

/* =========================================
   EVENT LISTENERS
========================================= */

function setupEventListeners() {

    loadMatchesBtn.addEventListener(
        "click",
        loadMatches
    );

    teamSearch.addEventListener(
        "input",
        debounce(handleSearch, 400)
    );

    themeToggle.addEventListener(
        "click",
        toggleTheme
    );

    closeModal.addEventListener(
        "click",
        closeMatchModal
    );

    window.addEventListener(
        "click",
        (e) => {

            if (e.target === modal) {

                closeMatchModal();

            }

        }
    );

    showFinished.addEventListener(
        "change",
        applyFilters
    );

    showLive.addEventListener(
        "change",
        applyFilters
    );

    leagueSelect.addEventListener(
        "change",
        () => {

            currentLeague =
                leagueSelect.value;

            localStorage.setItem(
                "selectedLeague",
                currentLeague
            );

        }
    );

}

/* =========================================
   LOAD MATCHES
========================================= */

async function loadMatches() {

    showLoading();

    clearError();

    matchesGrid.innerHTML = "";

    try {

        const leagueId =
            leagueSelect.value;

        const url =
            `https://${API_HOST}/fixtures?league=${leagueId}&last=10`;

        const response =
            await fetch(url, {

                method: "GET",

                headers: {

                    "x-apisports-key":
                        API_KEY,

                    "x-apisports-host":
                        API_HOST

                }

            });

        if (!response.ok) {

            throw new Error(
                "Failed to fetch matches"
            );

        }

        const data =
            await response.json();

        allMatches =
            data.response;

        filteredMatches =
            [...allMatches];

        renderMatches(
            filteredMatches
        );

        updateStatistics(
            filteredMatches
        );

        hideLoading();

    }

    catch (error) {

        console.error(error);

        hideLoading();

        showError(
            "Could not load matches."
        );

    }

}

/* =========================================
   RENDER MATCHES
========================================= */

function renderMatches(matches) {

    matchesGrid.innerHTML = "";

    if (matches.length === 0) {

        matchesGrid.innerHTML = `
            <div class="empty-state">
                <h2>No matches found</h2>
            </div>
        `;

        return;

    }

    matches.forEach(match => {

        const card =
            createMatchCard(match);

        matchesGrid.appendChild(card);

    });

}

/* =========================================
   CREATE MATCH CARD
========================================= */

function createMatchCard(match) {

    const card =
        document.createElement("div");

    card.classList.add("match-card");

    const homeTeam =
        match.teams.home.name;

    const awayTeam =
        match.teams.away.name;

    const homeLogo =
        match.teams.home.logo;

    const awayLogo =
        match.teams.away.logo;

    const homeGoals =
        match.goals.home;

    const awayGoals =
        match.goals.away;

    const status =
        match.fixture.status.short;

    const date =
        formatDate(
            match.fixture.date
        );

    card.innerHTML = `

        <div class="teams">

            <div class="team">

                <img
                    src="${homeLogo}"
                    alt="${homeTeam}"
                >

                <h3>${homeTeam}</h3>

            </div>

            <div class="score">

                ${homeGoals}
                -
                ${awayGoals}

            </div>

            <div class="team">

                <img
                    src="${awayLogo}"
                    alt="${awayTeam}"
                >

                <h3>${awayTeam}</h3>

            </div>

        </div>

        <div class="match-info">

            <div class="match-status">

                ${status}

            </div>

            <div class="match-date">

                ${date}

            </div>

        </div>

    `;

    card.addEventListener(
        "click",
        () => {

            openMatchModal(match);

        }
    );

    return card;

}

/* =========================================
   MATCH MODAL
========================================= */

function openMatchModal(match) {

    modal.classList.remove("hidden");

    const league =
        match.league.name;

    const stadium =
        match.fixture.venue.name;

    const referee =
        match.fixture.referee;

    const elapsed =
        match.fixture.status.elapsed;

    modalBody.innerHTML = `

        <h2>
            ${match.teams.home.name}
            vs
            ${match.teams.away.name}
        </h2>

        <br>

        <p>
            <strong>League:</strong>
            ${league}
        </p>

        <br>

        <p>
            <strong>Venue:</strong>
            ${stadium}
        </p>

        <br>

        <p>
            <strong>Referee:</strong>
            ${referee || "Unknown"}
        </p>

        <br>

        <p>
            <strong>Elapsed:</strong>
            ${elapsed || 0} mins
        </p>

    `;

}

/* =========================================
   CLOSE MODAL
========================================= */

function closeMatchModal() {

    modal.classList.add("hidden");

}

/* =========================================
   SEARCH
========================================= */

function handleSearch() {

    const query =
        teamSearch.value
        .toLowerCase()
        .trim();

    filteredMatches =
        allMatches.filter(match => {

            const home =
                match.teams.home.name
                .toLowerCase();

            const away =
                match.teams.away.name
                .toLowerCase();

            return (
                home.includes(query) ||
                away.includes(query)
            );

        });

    applyFilters();

}

/* =========================================
   FILTERS
========================================= */

function applyFilters() {

    let matches =
        [...filteredMatches];

    if (!showFinished.checked) {

        matches =
            matches.filter(match => {

                return (
                    match.fixture.status.short
                    !== "FT"
                );

            });

    }

    if (!showLive.checked) {

        matches =
            matches.filter(match => {

                return (
                    match.fixture.status.short
                    !== "LIVE"
                );

            });

    }

    renderMatches(matches);

    updateStatistics(matches);

}

/* =========================================
   STATISTICS
========================================= */

function updateStatistics(matches) {

    totalMatches.textContent =
        matches.length;

    let goals = 0;

    let live = 0;

    matches.forEach(match => {

        goals +=
            (match.goals.home || 0);

        goals +=
            (match.goals.away || 0);

        if (
            match.fixture.status.short
            === "LIVE"
        ) {

            live++;

        }

    });

    totalGoals.textContent =
        goals;

    liveGames.textContent =
        live;

}

/* =========================================
   THEME TOGGLE
========================================= */

function toggleTheme() {

    darkMode = !darkMode;

    if (darkMode) {

        document.body
            .classList.remove("light");

        localStorage.setItem(
            "theme",
            "dark"
        );

    }

    else {

        document.body
            .classList.add("light");

        localStorage.setItem(
            "theme",
            "light"
        );

    }

}

/* =========================================
   LOAD THEME
========================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "light") {

        darkMode = false;

        document.body
            .classList.add("light");

    }

}

/* =========================================
   SAVE LEAGUE
========================================= */

function loadSavedLeague() {

    const savedLeague =
        localStorage.getItem(
            "selectedLeague"
        );

    if (savedLeague) {

        leagueSelect.value =
            savedLeague;

        currentLeague =
            savedLeague;

    }

}

/* =========================================
   LOADING
========================================= */

function showLoading() {

    loadingSection
        .classList.remove("hidden");

}

function hideLoading() {

    loadingSection
        .classList.add("hidden");

}

/* =========================================
   ERROR
========================================= */

function showError(message) {

    errorBox.classList.remove(
        "hidden"
    );

    errorBox.innerHTML = `
        <p>${message}</p>
    `;

}

function clearError() {

    errorBox.classList.add(
        "hidden"
    );

}

/* =========================================
   DATE FORMATTER
========================================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleString();

}

/* =========================================
   DEBOUNCE
========================================= */

function debounce(func, delay) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            func.apply(this, args);

        }, delay);

    };

}

/* =========================================
   PARTICLES
========================================= */

function createParticles() {

    const particleContainer =
        document.createElement("div");

    particleContainer.style.position =
        "fixed";

    particleContainer.style.inset =
        "0";

    particleContainer.style.zIndex =
        "-1";

    particleContainer.style.overflow =
        "hidden";

    document.body.appendChild(
        particleContainer
    );

    for (let i = 0; i < 40; i++) {

        const particle =
            document.createElement("div");

        particle.style.position =
            "absolute";

        particle.style.width =
            "4px";

        particle.style.height =
            "4px";

        particle.style.background =
            "rgba(255,255,255,0.08)";

        particle.style.borderRadius =
            "50%";

        particle.style.left =
            Math.random() * 100 + "%";

        particle.style.top =
            Math.random() * 100 + "%";

        particle.style.animation =
            `floatParticle ${
                10 + Math.random() * 20
            }s linear infinite`;

        particleContainer.appendChild(
            particle
        );

    }

}

/* =========================================
   FLOAT PARTICLE STYLE
========================================= */

const particleStyle =
    document.createElement("style");

particleStyle.innerHTML = `

@keyframes floatParticle {

    0% {

        transform:
            translateY(0px);

        opacity: 0;

    }

    10% {

        opacity: 1;

    }

    90% {

        opacity: 1;

    }

    100% {

        transform:
            translateY(-100vh);

        opacity: 0;

    }

}

`;

document.head.appendChild(
    particleStyle
);

/* =========================================
   SKELETON LOADING
========================================= */

function renderSkeletons() {

    matchesGrid.innerHTML = "";

    for (let i = 0; i < 6; i++) {

        const skeleton =
            document.createElement("div");

        skeleton.classList.add(
            "match-card"
        );

        skeleton.innerHTML = `

            <div
                style="
                    height: 180px;
                    border-radius: 20px;
                    background:
                    linear-gradient(
                        90deg,
                        rgba(255,255,255,0.03),
                        rgba(255,255,255,0.08),
                        rgba(255,255,255,0.03)
                    );
                    background-size: 400% 400%;
                    animation:
                        shimmer 1.5s infinite;
                "
            ></div>

        `;

        matchesGrid.appendChild(
            skeleton
        );

    }

}

/* =========================================
   SHIMMER STYLE
========================================= */

const shimmerStyle =
    document.createElement("style");

shimmerStyle.innerHTML = `

@keyframes shimmer {

    0% {

        background-position:
            0% 50%;

    }

    100% {

        background-position:
            100% 50%;

    }

}

`;

document.head.appendChild(
    shimmerStyle
);

/* =========================================
   FAVORITES SYSTEM
========================================= */

function saveFavoriteLeague(id) {

    localStorage.setItem(
        "favoriteLeague",
        id
    );

}

function loadFavoriteLeague() {

    return localStorage.getItem(
        "favoriteLeague"
    );

}

/* =========================================
   AUTO REFRESH
========================================= */

setInterval(() => {

    loadMatches();

}, 300000);

/* =========================================
   KEYBOARD SHORTCUTS
========================================= */

window.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key === "Escape"
        ) {

            closeMatchModal();

        }

        if (
            e.key === "r"
        ) {

            loadMatches();

        }

    }
);

/* =========================================
   MATCH ANIMATION
========================================= */

function animateCards() {

    const cards =
        document.querySelectorAll(
            ".match-card"
        );

    cards.forEach((card, index) => {

        card.style.opacity = 0;

        card.style.transform =
            "translateY(30px)";

        setTimeout(() => {

            card.style.transition =
                "0.5s ease";

            card.style.opacity = 1;

            card.style.transform =
                "translateY(0px)";

        }, index * 100);

    });

}

/* =========================================
   OBSERVER
========================================= */

const observer =
    new MutationObserver(() => {

        animateCards();

    });

observer.observe(
    matchesGrid,
    { childList: true }
);

/* =========================================
   ONLINE / OFFLINE STATUS
========================================= */

window.addEventListener(
    "offline",
    () => {

        showError(
            "You are offline."
        );

    }
);

window.addEventListener(
    "online",
    () => {

        clearError();

        loadMatches();

    }
);

/* =========================================
   PERFORMANCE LOGGER
========================================= */

function logPerformance() {

    const timing =
        performance.now();

    console.log(
        `Performance:
        ${timing.toFixed(2)}ms`
    );

}

logPerformance();

/* =========================================
   WELCOME CONSOLE MESSAGE
========================================= */

console.log(`

========================================
⚽ FOOTBALL HUB
========================================

Professional Football Application

Features:
- Live Data
- Search
- Filters
- Animations
- Dark Mode
- Responsive Design
- Match Modal
- Statistics
- Auto Refresh
- Local Storage

========================================

`);

/* =========================================
   END OF FILE
========================================= */
