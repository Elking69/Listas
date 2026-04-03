// ================= CONFIG =================
const DRIVE = window.current_drive_order || 0;
const BASE = `/${DRIVE}:/`;

// ================= INIT =================
document.body.innerHTML = `
<div class="app">
  <header class="navbar">
    <div class="logo">NETDRIVE</div>
    <input id="search" placeholder="Buscar..." />
  </header>

  <div id="hero"></div>

  <div id="content"></div>
</div>
`;

// ================= STYLES =================
const style = document.createElement("style");
style.innerHTML = `
body {
  margin:0;
  background:#141414;
  color:white;
  font-family:sans-serif;
}

.navbar {
  display:flex;
  justify-content:space-between;
  padding:15px;
  background:linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
  position:fixed;
  width:100%;
  z-index:10;
}

.logo {
  font-size:22px;
  font-weight:bold;
  color:red;
}

#search {
  padding:8px;
  border:none;
  border-radius:4px;
}

#hero {
  height:300px;
  background-size:cover;
  display:flex;
  align-items:end;
  padding:20px;
}

.row {
  margin:20px;
}

.row h2 {
  margin-bottom:10px;
}

.cards {
  display:flex;
  overflow-x:auto;
  gap:10px;
}

.card {
  min-width:160px;
  height:220px;
  background:#222;
  border-radius:8px;
  cursor:pointer;
  position:relative;
  transition:0.3s;
}

.card:hover {
  transform:scale(1.1);
}

.card img {
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:8px;
}

.card span {
  position:absolute;
  bottom:5px;
  left:5px;
  font-size:12px;
}
`;
document.head.appendChild(style);

// ================= FETCH FILES =================
async function getFiles(path = "/") {
  let form = new FormData();
  form.append("page_token", "");
  form.append("page_index", 0);

  let res = await fetch(`${BASE}${path}`, {
    method: "POST",
    body: form
  });

  return await res.json();
}

// ================= RENDER =================
async function init() {

  // 🔥 REDIRECT DIRECTO A TU CARPETA
  if (location.pathname === "/0:/") {
    location.replace("/0:/Series%20y%20Peliculas/");
    return;
  }

  let data = await getFiles(location.pathname.replace(BASE, ""));

  renderHero(data.files);
  renderRows(data.files);
}

function renderHero(files) {
  let random = files[Math.floor(Math.random() * files.length)];
  document.getElementById("hero").style.backgroundImage =
    `url(https://via.placeholder.com/800x300?text=${random.name})`;
}

function renderRows(files) {
  let container = document.getElementById("content");
  container.innerHTML = "";

  createRow("Todo", files);
}

function createRow(title, files) {
  let row = document.createElement("div");
  row.className = "row";

  row.innerHTML = `<h2>${title}</h2><div class="cards"></div>`;
  let cards = row.querySelector(".cards");

  files.forEach(file => {
    if (file.mimeType === "application/vnd.google-apps.folder") return;

    let card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="https://via.placeholder.com/200x300?text=${file.name}">
      <span>${file.name}</span>
    `;

    card.onclick = () => openFile(file);

    cards.appendChild(card);
  });

  document.getElementById("content").appendChild(row);
}

// ================= OPEN FILE =================
function openFile(file) {
  let path = location.pathname + "/" + file.name;
  window.open(path + "?a=view", "_blank");
}

// ================= SEARCH =================
document.getElementById("search").addEventListener("keypress", async (e) => {
  if (e.key !== "Enter") return;

  let q = e.target.value;

  let form = new FormData();
  form.append("q", q);
  form.append("page_token", "");
  form.append("page_index", 0);

  let res = await fetch(`/${DRIVE}:search`, {
    method: "POST",
    body: form
  });

  let data = await res.json();

  renderRows(data.files || []);
});

// ================= START =================
init();
