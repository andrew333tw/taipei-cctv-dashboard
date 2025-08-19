// ============================
// 初始化
// ============================
function init(){
  fetch('cctv.json')
    .then(r => r.json())
    .then(data => {
      cctvData = data;
      renderPage(currentPage);
      renderPagination();
    });
}

const ITEMS_PER_PAGE = 32;
let cctvData = [];
let currentPage = 1;

const MAX_ACTIVE_IFRAMES = 6;
let activeCount = 0;

// ============================
// 產生畫面 (grid)
// ============================
function renderPage(page) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  activeCount = 0;
  currentPage  = page;

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end   = page * ITEMS_PER_PAGE;
  const pageItems = cctvData.slice(start, end);

  pageItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cctv-item';
    div.id = `item-${item.id}`;
    div.innerHTML = `
      <h3>${item.id} ${item.name}</h3>
      <iframe data-src="https://hls.bote.gov.taipei/live/index.html?id=${item.id}" allowfullscreen></iframe>
    `;
    const iframe = div.querySelector('iframe');
    iframe.onmouseenter = () => {
      if (!iframe.dataset.loaded && activeCount < MAX_ACTIVE_IFRAMES) {
        iframe.src = iframe.dataset.src;
        iframe.dataset.loaded = "true";
        activeCount++;
        iframe.onload = () => { activeCount--; };
      }
    };
    grid.appendChild(div);
  });
}

// ============================
// 分頁
// ============================
function renderPagination() {
  const totalPages = Math.ceil(cctvData.length / ITEMS_PER_PAGE);
  const container  = document.getElementById('pagination');
  container.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = i;
    if(i === currentPage) a.className = 'active';

    a.onclick = (e) => {
      e.preventDefault();
      renderPage(i);
      renderPagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    container.appendChild(a);
    if(i < totalPages) container.appendChild(document.createTextNode(' | '));
  }
}

// ============================
// 搜尋
// ============================
function searchCCTV() {
  const keyword = document.getElementById('search').value.trim();
  if (!keyword) return;

  const index = cctvData.findIndex(d =>
    d.id === keyword || d.name.includes(keyword)
  );
  if (index === -1) {
    alert('找不到符合的攝影機');
    return;
  }

  const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;
  renderPage(targetPage);
  renderPagination();

  setTimeout(() => {
    const el = document.getElementById(`item-${cctvData[index].id}`);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
  }, 50);
}

// ============================
// 每 3 分鐘 refresh
// ============================
function refreshAll(){
  document.querySelectorAll('iframe[data-loaded="true"]').forEach(f => {
    const src = f.src;
    f.src = '';
    setTimeout(() => { f.src = src }, 50);
  });
}
setInterval(refreshAll, 180000);

// ============================
// 編號一覽表（表格）
// ============================
function renderCCTVList(){
  const listDiv = document.getElementById('cctvList');
  let html = '<table id="cctvTable"><tr>';
  cctvData.forEach((d, index) => {
    html += `<td>${d.id} ${d.name}</td>`;
    if ((index+1) % 8 === 0) html += '</tr><tr>';
  });
  html += '</tr></table>';
  listDiv.innerHTML = html;
}

// ============================
// 自選清單：加入 / 開始監看 / 刪除
// ============================
const selectedCodes = [];

document.getElementById('addToListBtn').onclick = () => {
  const v = document.getElementById('inputCode').value.trim();
  if(!v) return;
  if(!selectedCodes.includes(v)){
    selectedCodes.push(v);
    updateSelectedList();
    document.getElementById('startCustomBtn').disabled = false;
  }
  document.getElementById('inputCode').value = '';
};

document.getElementById('startCustomBtn').onclick = () => {
  window.location.href = 'custom.html?codes=' + selectedCodes.join(',');
};

function updateSelectedList(){
  const container = document.getElementById('selectedList');

  if(selectedCodes.length === 0){
    container.innerHTML = '';
    document.getElementById('startCustomBtn').disabled = true;
    return;
  }

  // 顯示＋刪除
  const html = selectedCodes.map(code => {
    return `<span>${code} <a href="#" onclick="removeCode('${code}')">❌</a></span>`;
  }).join('　');
  container.innerHTML = '已加入： ' + html;
}

function removeCode(code){
  const idx = selectedCodes.indexOf(code);
  if(idx !== -1){
    selectedCodes.splice(idx,1);
    updateSelectedList();
  }
}
