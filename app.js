// ============================
// 初始化：載入 JSON、建立 observer、渲染第一頁
// ============================
function init(){
  fetch('cctv.json')
    .then(r => r.json())
    .then(data => {
      cctvData = data;
      initObserver();
      renderPage(currentPage);
      renderPagination();
    });
}

const ITEMS_PER_PAGE = 32;
let cctvData = [];
let currentPage = 1;

const MAX_ACTIVE_IFRAMES = 6;
let activeCount = 0;
let queue = [];
let observer;

function initObserver(){
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const frame = entry.target;
        if (!frame.dataset.loaded) {
          queue.push(frame);
          processQueue();
        }
        observer.unobserve(frame);
      }
    });
  }, {
    rootMargin: '200px'
  });
}

function processQueue(){
  while (activeCount < MAX_ACTIVE_IFRAMES && queue.length > 0) {
    const frame = queue.shift();
    frame.src = frame.dataset.src;
    frame.dataset.loaded = "true";
    activeCount++;
    frame.onload = () => { activeCount--; processQueue(); };
  }
}

function renderPage(page) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  queue = [];
  activeCount = 0;

  currentPage = page;
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = page * ITEMS_PER_PAGE;
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
    observer.observe(iframe);
    grid.appendChild(div);
  });
}

function renderPagination() {
  const totalPages = Math.ceil(cctvData.length / ITEMS_PER_PAGE);
  const container = document.getElementById('pagination');
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

function refreshAll(){
  document.querySelectorAll('iframe[data-loaded="true"]').forEach(f => {
    const src = f.src;
    f.src = '';
    setTimeout(() => { f.src = src }, 50);
  });
}
setInterval(refreshAll, 30000);
