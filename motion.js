/* Adapted from library practices 11 and 22. No scroll interception or idle carousel loop. */
(() => {
  'use strict';
  const query = new URLSearchParams(location.search).get('motion');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = window.PortfolioMotion = { reduced: query === 'reduced' || (query !== 'full' && preference.matches) };
  const setPreference = () => {
    motion.reduced = query === 'reduced' || (query !== 'full' && preference.matches);
    document.documentElement.dataset.motion = motion.reduced ? 'reduced' : 'full';
    document.dispatchEvent(new Event('motionchange'));
  };
  preference.addEventListener('change', setPreference);
  setPreference();
  document.documentElement.classList.add('motion-ready');

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  function makeIndicator(container, buttons, className, selected) {
    const indicator = document.createElement('span');
    indicator.className = className;
    indicator.setAttribute('aria-hidden', 'true');
    container.prepend(indicator);
    function update() {
      const button = selected();
      if (!button || !button.offsetWidth) return;
      indicator.style.width = button.offsetWidth + 'px';
      indicator.style.height = button.offsetHeight + 'px';
      indicator.style.transform = `translate3d(${button.offsetLeft}px,${button.offsetTop}px,0)`;
    }
    new ResizeObserver(update).observe(container);
    document.fonts.ready.then(update);
    buttons.forEach(button => button.addEventListener('click', update));
    update();
    return update;
  }

  const nav = document.querySelector('.nav__links');
  const navLinks = [...nav.querySelectorAll('a')];
  const updateNav = makeIndicator(nav, navLinks, 'nav__indicator', () => nav.querySelector('.is-current'));
  const sections = ['top', 'proyectos', 'about', 'contacto'].map(id => document.getElementById(id));
  let scrollQueued = false;
  function trackSection() {
    scrollQueued = false;
    let active = 'top';
    sections.slice(1).forEach(section => { if (section.getBoundingClientRect().top <= innerHeight * .4) active = section.id; });
    // About is intentionally omitted from the compact phone navigation.
    if (active === 'about' && !navLinks[2].offsetWidth) active = 'proyectos';
    navLinks.forEach(link => {
      const current = link.hash === '#' + active;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    updateNav();
  }
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(trackSection); } }, { passive: true });
  addEventListener('resize', trackSection, { passive: true });
  trackSection();

  const subtabs = document.querySelector('.subtabs');
  const updateFilter = makeIndicator(subtabs, [...subtabs.querySelectorAll('.subtab')], 'filter-indicator', () => subtabs.querySelector('.is-active'));
  document.addEventListener('collectionchange', event => {
    updateFilter();
    const panel = document.getElementById(event.detail.panel);
    if (panel && !motion.reduced) {
      panel.getAnimations().forEach(animation => animation.cancel());
      panel.animate([{ opacity: .35, transform: 'translateY(7px)' }, { opacity: 1, transform: 'none' }], { duration: 230, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
  });

  const stage = document.getElementById('arcStage');
  const cards = [...stage.querySelectorAll('.arc-card')];
  const shades = cards.map(card => {
    const shade = document.createElement('span');
    shade.className = 'arc-card__shade'; shade.setAttribute('aria-hidden', 'true'); card.append(shade); return shade;
  });
  const count = cards.length;
  const dots = document.getElementById('arcDots');
  const explore = document.getElementById('arcExplore');
  let value = 0, target = 0, velocity = 0, frame = 0, lastFrame = 0, selectedIndex = -1;
  let gap = 225, dragging = false, dragged = false, pointer = null, startX = 0, startValue = 0, lastX = 0, lastMove = 0, dragVelocity = 0, downCard = null;
  let visible = true;
  const wrap = v => ((v % count) + count) % count;
  const distance = v => ((v + count * 1.5) % count) - count / 2;
  const dotButtons = cards.map((card, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Select ' + card.dataset.title);
    button.addEventListener('click', () => choose(i));
    dots.append(button);
    card.addEventListener('click', event => {
      // Pointer clicks are handled at release; keyboard-generated clicks remain available.
      if (event.detail === 0) { if (i === selectedIndex) explore.click(); else choose(i); }
    });
    return button;
  });

  function render() {
    const selected = wrap(Math.round(value));
    cards.forEach((card, i) => {
      const d = distance(i - wrap(value)), absolute = Math.abs(d);
      const x = motion.reduced ? d * gap : Math.sin(d * .3) * gap * 3.35;
      const y = motion.reduced ? 0 : (1 - Math.cos(d * .3)) * 115;
      card.style.transform = `translate3d(${x}px,${y}px,${motion.reduced ? 0 : -d * d * 40}px) rotateZ(${motion.reduced ? 0 : d * 9}deg) rotateY(${motion.reduced ? 0 : -d * 5}deg)`;
      card.style.opacity = String(Math.max(0, Math.min(1, (2.5 - absolute) / .35)));
      card.style.pointerEvents = absolute < 2.5 ? 'auto' : 'none';
      shades[i].style.opacity = String(Math.min(.48, absolute * .23));
      card.style.zIndex = String(20 - Math.round(absolute * 5));
    });
    if (selected === selectedIndex) return;
    selectedIndex = selected;
    const current = cards[selected].dataset;
    document.getElementById('arcTitle').textContent = current.title;
    document.getElementById('arcCategory').textContent = current.category;
    document.getElementById('arcDescription').textContent = current.description;
    document.getElementById('arcCount').textContent = String(selected + 1).padStart(2, '0') + ' / ' + String(count).padStart(2, '0');
    explore.dataset.goTab = current.tab;
    if (current.subtab) explore.dataset.goSubtab = current.subtab; else delete explore.dataset.goSubtab;
    cards.forEach((card, i) => {
      card.classList.toggle('is-selected', i === selected);
      card.setAttribute('aria-pressed', String(i === selected));
      card.tabIndex = i === selected ? 0 : -1;
      dotButtons[i].setAttribute('aria-pressed', String(i === selected));
    });
  }

  function tick(time) {
    frame = 0;
    const dt = Math.min((time - lastFrame) / 1000 || .016, .032);
    lastFrame = time;
    if (!dragging) {
      if (motion.reduced) { value = target; velocity = 0; }
      else {
        // Exact critically damped spring: stable after dropped frames; preserves release momentum.
        const omega = 16, offset = value - target, c = velocity + omega * offset, decay = Math.exp(-omega * dt);
        value = target + (offset + c * dt) * decay;
        velocity = (velocity - omega * c * dt) * decay;
      }
    }
    render();
    if (!dragging && Math.abs(value - target) < .0003 && Math.abs(velocity) < .003) { value = target; velocity = 0; render(); return; }
    if (!dragging) wake();
  }
  function wake() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick); }
  function choose(index) { target = Math.round(value) + distance(index - wrap(Math.round(value))); lastFrame = performance.now(); wake(); }
  const step = direction => { target = Math.round(target) + direction; lastFrame = performance.now(); wake(); };
  document.getElementById('arcPrev').addEventListener('click', () => step(-1));
  document.getElementById('arcNext').addEventListener('click', () => step(1));
  stage.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') choose(0); else if (event.key === 'End') choose(count - 1); else step(event.key === 'ArrowRight' ? 1 : -1);
  });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    pointer = event.pointerId; dragging = true; dragged = false;
    startX = lastX = event.clientX; startValue = value; target = value; velocity = dragVelocity = 0;
    lastMove = performance.now(); downCard = event.target.closest('.arc-card');
    stage.setPointerCapture(pointer); stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove', event => {
    if (!dragging || pointer !== event.pointerId) return;
    const now = performance.now(), dt = Math.max(.008, (now - lastMove) / 1000), dx = event.clientX - startX;
    if (Math.abs(dx) > 6) dragged = true;
    const instant = -(event.clientX - lastX) / gap / dt;
    dragVelocity += (instant - dragVelocity) * (1 - Math.exp(-dt * 24));
    value = startValue - dx / gap; target = value;
    lastX = event.clientX; lastMove = now;
    wake();
  });
  function release(event) {
    if (!dragging || pointer !== event.pointerId) return;
    dragging = false; stage.classList.remove('dragging');
    if (event.type === 'pointercancel') { target = Math.round(value); velocity = 0; }
    else if (!dragged && downCard) {
      const i = cards.indexOf(downCard);
      if (i === selectedIndex) explore.click();
      else choose(i);
      target = Math.round(target);
    } else {
      velocity = performance.now() - lastMove < 120 ? dragVelocity : 0;
      target = Math.round(value + Math.max(-1.8, Math.min(1.8, velocity * .16)));
    }
    if (stage.hasPointerCapture(pointer)) stage.releasePointerCapture(pointer);
    pointer = null; lastFrame = performance.now(); wake();
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', event => { if (dragging) release({ pointerId: event.pointerId, type: 'pointercancel' }); });
  new ResizeObserver(() => { gap = stage.clientWidth < 600 ? 164 : 225; render(); }).observe(stage);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { lastFrame = performance.now(); wake(); }
    else { cancelAnimationFrame(frame); frame = 0; }
  }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { lastFrame = performance.now(); wake(); }
  });
  document.addEventListener('motionchange', () => { value = target = Math.round(value); velocity = 0; render(); });
  render();

  // The social links float via CSS; only direct pointer interaction uses rAF.
  const socialOrbit = document.getElementById('socialOrbit');
  const socialLinks = [...socialOrbit.querySelectorAll('.social-bubble')];
  let socialVisible = false;
  const socialPlayback = () => {
    socialOrbit.classList.toggle('is-floating', socialVisible && !document.hidden && !motion.reduced);
  };
  new IntersectionObserver(entries => {
    socialVisible = entries[0].isIntersecting;
    socialPlayback();
  }, { threshold: .1 }).observe(socialOrbit);
  document.addEventListener('visibilitychange', socialPlayback);
  document.addEventListener('motionchange', socialPlayback);
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  socialLinks.forEach(link => {
    let x = 0, y = 0, tx = 0, ty = 0, interactionFrame = 0, lastTime = 0, bounds;
    function move(time) {
      interactionFrame = 0;
      const dt = Math.min(.04, (time - lastTime) / 1000 || .016); lastTime = time;
      const decay = 1 - Math.exp(-dt * 18);
      x += (tx - x) * decay; y += (ty - y) * decay;
      if (Math.abs(tx - x) < .02 && Math.abs(ty - y) < .02) {
        x = tx; y = ty;
        link.style.transform = tx || ty ? `translate3d(${x}px,${y}px,0)` : '';
        return;
      }
      link.style.transform = `translate3d(${x}px,${y}px,0)`;
      interactionFrame = requestAnimationFrame(move);
    }
    function wake() { if (!interactionFrame) { lastTime = performance.now(); interactionFrame = requestAnimationFrame(move); } }
    function reset() { tx = ty = 0; bounds = null; wake(); }
    link.addEventListener('pointerenter', () => { bounds = link.getBoundingClientRect(); });
    link.addEventListener('pointermove', event => {
      if (!finePointer.matches || motion.reduced || event.pointerType === 'touch' || !bounds) return;
      tx = Math.max(-9, Math.min(9, (event.clientX - bounds.left - bounds.width / 2) * .16));
      ty = Math.max(-9, Math.min(9, (event.clientY - bounds.top - bounds.height / 2) * .16));
      wake();
    });
    link.addEventListener('pointerleave', reset);
    link.addEventListener('pointercancel', reset);
    link.addEventListener('focus', reset);
    function stopInteraction() {
      cancelAnimationFrame(interactionFrame); interactionFrame = 0;
      x = y = tx = ty = 0; bounds = null; link.style.transform = '';
    }
    document.addEventListener('motionchange', stopInteraction);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopInteraction(); });
  });

  const copy = document.getElementById('copyEmail');
  let copyTimer;
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.SITE_DATA.profile.email);
      copy.textContent = 'Email copied ✓';
      document.getElementById('copyStatus').textContent = 'Email address copied to clipboard.';
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { copy.textContent = 'Copy email ⧉'; }, 2500);
    } catch {
      copy.textContent = window.SITE_DATA.profile.email;
      document.getElementById('copyStatus').textContent = 'Copy this address: ' + window.SITE_DATA.profile.email;
    }
  });
})();
