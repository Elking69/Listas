// ================== CONFIG ==================
const DRIVE = window.current_drive_order || 0;

// ================== INIT ==================
document.body.style.background = "#141414";
document.body.style.color = "white";
document.body.style.fontFamily = "Arial, sans-serif";

// contenedor principal
document.body.innerHTML = `
<div style="padding:15px;">
  <h2 style="color:red;">NETDRIVE</h2>
  <input id="search" placeholder="Buscar..." 
    style="padding:8px;width:300px;margin-bottom:20px;border-radius:5px;border:none;">
  <div id="list"></div>
</div>
`;

// ================== FETCH ==================
async function getFiles(path) {
  let form = new FormData();
  form.append("page_token", "");
  form.append("page_index", 0);

  let res = await fetch(path, {
    method: "POST",
    body: form
  });

  return await res.json();
}

// ================== RENDER ==================
async function render() {

  let path = location.pathname;

  // 🔥 REDIRECT AUTOMÁTICO A TU CARPETA
  if (path === `/${DRIVE}:/`) {
    location.replace(`/${DRIVE}:/Series%20y%20Peliculas/`);
    return;
  }

  let data = await getFiles(path);

  if (!data || !data.files) {
    document.getElementById("list").innerHTML = "No hay archivos";
    return;
  }

  renderFiles(data.files);
}

// ================== NETFLIX STYLE ==================
function renderFiles(files) {

  let list = document.getElementById("list");
  list.innerHTML = "";

  let container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.gap = "15px";

  files.forEach(file => {

    // ignorar carpetas (opcional)
    if (file.mimeType === "application/vnd.google-apps.folder") return;

    let card = document.createElement("div");
    card.style.width = "150px";
    card.style.cursor = "pointer";
    card.style.transition = "0.3s";

    card.onmouseenter = () => card.style.transform = "scale(1.1)";
    card.onmouseleave = () => card.style.transform = "scale(1)";

    card.innerHTML = `
      <div style="
        height:220px;
        background:#222;
        border-radius:10px;
        overflow:hidden;
      ">
        <img 
          src="https://via.placeholder.com/200x300?text=${encodeURIComponent(file.name)}" 
          style="width:100%;height:100%;object-fit:cover;"
        >
      </div>
      <div style="font-size:12px;margin-top:5px;">
        ${file.name}
      </div>
    `;

    card.onclick = () => openFile(file);

    container.appendChild(card);
  });

  list.appendChild(container);
}

// ================== OPEN FILE ==================
function openFile(file) {
  let path = location.pathname;

  if (!path.endsWith("/")) path += "/";

  window.open(path + file.name + "?a=view", "_blank");
}

// ================== SEARCH ==================
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

  renderFiles(data.files || []);
});

// ================== START ==================
render();
