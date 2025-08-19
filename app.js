function renderPage(page) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  queue = [];
  activeCount = 0;

  currentPage = page;
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
    
    // ⬇️ 改成滑鼠滑過時才載入影片
    iframe.onmouseenter = () => {
      if (!iframe.dataset.loaded && activeCount < MAX_ACTIVE_IFRAMES) {
        iframe.src = iframe.dataset.src;
        iframe.dataset.loaded = "true";
        activeCount++;
        iframe.onload = () => {
          activeCount--;
        }
      }
    };

    grid.appendChild(div);
  });
}
