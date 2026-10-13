/* Pop-up Stories · shared book frame behaviour.
   Works with each story's own page script, which fires a "pagechange" event from show(). */
(function () {
  const book = document.querySelector('.book');
  if (!book) return;
  const pages = [...document.querySelectorAll('.page')];
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* 1. paper grain filter, defined once */
  const defs = document.createElementNS(SVGNS, 'svg');
  defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
  defs.setAttribute('aria-hidden', 'true');
  defs.style.position = 'absolute';
  defs.innerHTML =
    '<filter id="paper-grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7" result="n"/>' +
    '<feDiffuseLighting in="n" lighting-color="#ffffff" surfaceScale="0.7" result="lit"><feDistantLight azimuth="235" elevation="68"/></feDiffuseLighting>' +
    '<feComposite in="lit" in2="SourceGraphic" operator="in" result="tex"/>' +
    '<feBlend in="SourceGraphic" in2="tex" mode="multiply" result="m"/>' +
    '<feComposite in="m" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0.5" k3="0.5" k4="0"/></filter>';
  document.body.prepend(defs);

  /* 2. dress every pop-up layer: grain on static paper, deeper shadows nearer the front, hinge tabs on the back card */
  const MOVING = '.drift,.bob,.sway,#icarus,#canoeA,#canoeB,#haze8,#meetKite';
  const moving = n => n.nodeType === 1 && (n.matches(MOVING) || n.querySelector(MOVING));
  document.querySelectorAll('.stage').forEach(stage => {
    const layers = [...stage.querySelectorAll(':scope > .layer')];
    layers.forEach((layer, i) => {
      if (!layer.classList.contains('flat')) {
        layer.style.setProperty('--depth',
          `drop-shadow(0 ${3 + i * 3}px ${2 + i * 2.5}px rgba(42,29,16,${(0.16 + i * 0.05).toFixed(2)}))`);
        let run = null;
        [...layer.childNodes].forEach(node => {
          if (node.nodeType !== 1 || moving(node)) { run = null; return; }
          if (!run) {
            run = document.createElementNS(SVGNS, 'g');
            run.setAttribute('filter', 'url(#paper-grain)');
            layer.insertBefore(run, node);
          }
          run.appendChild(node);
        });
      } else {
        layer.style.setProperty('--depth', 'none');
      }
      if (i === 0) {
        const hinge = document.createElementNS(SVGNS, 'g');
        hinge.innerHTML =
          '<path d="M10 276 H390" stroke="#b9a983" stroke-width="1.2" stroke-dasharray="5 4" fill="none"/>' +
          '<path d="M64 276 l9 11 h42 l9-11z M276 276 l9 11 h42 l9-11z" fill="#e6dcc4" stroke="#c7b894" stroke-width="1"/>';
        layer.appendChild(hinge);
      }
    });
  });

  /* 3. ribbon and curled page corners */
  const ribbon = document.createElement('div');
  ribbon.className = 'ribbon'; ribbon.setAttribute('aria-hidden', 'true');
  book.appendChild(ribbon);
  const curl = left =>
    `<svg viewBox="0 0 34 34" aria-hidden="true"><path d="${left ? 'M0 0 V26 Q0 34 8 34 H34 Q12 26 0 0z' : 'M34 0 V26 Q34 34 26 34 H0 Q22 26 34 0z'}" fill="#e4d9c0" stroke="#b9a983"/><path d="${left ? 'M0 0 Q12 26 34 34' : 'M34 0 Q22 26 0 34'}" fill="none" stroke="rgba(42,29,16,.25)" stroke-width="2"/></svg>`;
  const cNext = document.createElement('button');
  cNext.type = 'button'; cNext.className = 'corner next'; cNext.setAttribute('aria-label', 'Turn the page');
  cNext.innerHTML = curl(false);
  cNext.addEventListener('click', () => next.click());
  const cPrev = document.createElement('button');
  cPrev.type = 'button'; cPrev.className = 'corner prev'; cPrev.setAttribute('aria-label', 'Turn back');
  cPrev.innerHTML = curl(true);
  cPrev.addEventListener('click', () => prev.click());
  book.append(cPrev, cNext);

  /* 4. page stacks, chapter progress, and closing the book from the first page */
  const closed = document.querySelector('.closed');
  let cur = Math.max(0, pages.findIndex(p => !p.hidden));
  function stacks(c, total) {
    const n = 9, left = Math.max(1, Math.round((c / Math.max(1, total - 1)) * (n - 2)) + 1), right = n - left;
    const sh = [];
    for (let k = 1; k <= left; k++) sh.push(`-${k}px ${(k * 0.6).toFixed(1)}px 0 ${k % 2 ? '#e6dcc4' : '#cdbf9f'}`);
    for (let k = 1; k <= right; k++) sh.push(`${k}px ${(k * 0.6).toFixed(1)}px 0 ${k % 2 ? '#e6dcc4' : '#cdbf9f'}`);
    book.style.setProperty('--stacks', sh.join(','));
  }
  /* short labels on small screens, where the controls sit in a bar fixed to the bottom */
  const small = matchMedia('(max-width:1024px)');
  const openTag = closed && closed.querySelector('.open-tag');
  function labels() {
    const s = small.matches;
    next.textContent = s ? 'Next' : (cur === 0 ? 'Open the book ›' : 'Turn the page ›');
    prev.textContent = s ? 'Back' : (closed && cur === 0 ? '‹ Close the book' : '‹ Back');
    if (openTag) openTag.textContent = s ? 'Open' : 'Open the cover ›';
    prev.setAttribute('aria-label', closed && cur === 0 ? 'Close the book' : 'Previous page');
    next.setAttribute('aria-label', 'Next page');
  }
  function update(c, total) {
    cur = c;
    stacks(cur, total);
    document.querySelectorAll('.dots button').forEach((d, j) => d.classList.toggle('read', j < cur));
    cPrev.disabled = cur === 0 && !closed; cNext.disabled = cur === total - 1;
    if (closed && cur === 0) prev.disabled = false;
    labels();
  }
  document.addEventListener('pagechange', e => update(e.detail.cur, e.detail.total));
  small.addEventListener('change', labels);
  update(cur, pages.length);

  /* 5. the closed cover */
  if (!closed) return;
  const restart = () => {
    const p = pages.find(pg => !pg.hidden);
    p && p.getAnimations({ subtree: true }).forEach(a => {
      if (window.CSSAnimation && a instanceof CSSAnimation) { a.cancel(); a.play(); }
    });
  };
  function open() {
    if (!document.body.classList.contains('is-closed') || document.body.classList.contains('is-opening')) return;
    const done = () => {
      document.body.classList.remove('is-closed', 'is-opening');
      restart();
      (next && next.focus({ preventScroll: true }));
    };
    if (reduce.matches) return done();
    document.body.classList.add('is-opening');
    setTimeout(done, 800);
  }
  function close() {
    document.body.classList.add('is-closed');
    window.scrollTo({ top: 0 });
    const board = closed.querySelector('.cover-board');
    board && board.focus({ preventScroll: true });
  }
  document.body.classList.add('is-closed');
  closed.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', open));
  prev.addEventListener('click', () => { if (cur === 0) close(); });
  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('is-closed')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.stopImmediatePropagation();
      if (e.key === 'ArrowRight') open();
    }
  }, true);
})();
