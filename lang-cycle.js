/**
 * Cycles text through languages with a soft fade.
 * Mark elements with class "lang-cycle" and a data-phrases JSON array.
 * Optional parent .lang-cycle-group fades with the text (e.g. name stays fixed).
 * Optional .intro-subtitle with data-subtitles maps language → text.
 * Reserves a fixed box sized to the largest language so layout doesn't jump.
 */
(function () {
  const INTERVAL_MS = 10000;
  const FADE_MS = 1200;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const nodes = document.querySelectorAll('.lang-cycle');
  if (!nodes.length) return;

  const pickNext = (length, current) => {
    if (length < 2) return 0;
    let next;
    do {
      next = Math.floor(Math.random() * length);
    } while (next === current);
    return next;
  };

  nodes.forEach((el, i) => {
    let phrases;
    try {
      phrases = JSON.parse(el.getAttribute('data-phrases'));
    } catch {
      return;
    }
    if (!Array.isArray(phrases) || phrases.length < 2) return;

    let index = 0;
    const delay = i * 500;
    const target = el.closest('.lang-cycle-group') || el;
    const nameEl = target.querySelector('.display-name');
    const header = el.closest('.intro-header');
    const subtitleEl = header && header.querySelector('.intro-subtitle');

    let subtitles = null;
    let lockedSubW = 0;
    let lockedSubH = 0;
    if (subtitleEl && subtitleEl.hasAttribute('data-subtitles')) {
      try {
        subtitles = JSON.parse(subtitleEl.getAttribute('data-subtitles'));
      } catch {
        subtitles = null;
      }
    }

    const setPhrase = (phrase) => {
      el.textContent = phrase.text;
      el.dataset.lang = phrase.lang;
      if (phrase.lang === 'zh' || phrase.lang === 'braille') {
        el.dataset.script = phrase.lang === 'zh' ? 'cjk' : 'braille';
      } else {
        delete el.dataset.script;
      }

      if (nameEl) {
        if (phrase.lang === 'zh') {
          nameEl.textContent = nameEl.dataset.nameZh || '王怡北';
          nameEl.classList.remove('ballet', 'display-name-braille');
          nameEl.classList.add('display-name-zh');
        } else if (phrase.lang === 'braille') {
          nameEl.textContent =
            nameEl.dataset.nameBraille || '⠽⠊⠃⠑⠊';
          nameEl.classList.remove('ballet', 'display-name-zh');
          nameEl.classList.add('display-name-braille');
        } else {
          const latin = nameEl.dataset.nameEn || 'Yibei Wang Chen';
          const [first, ...rest] = latin.split(' ');
          nameEl.innerHTML =
            '<span class="first-name">' + first + '</span>' +
            (rest.length
              ? '<span class="last-name"> ' + rest.join(' ') + '</span>'
              : '');
          nameEl.classList.add('ballet');
          nameEl.classList.remove('display-name-zh', 'display-name-braille');
        }
      }

      if (subtitleEl && subtitles) {
        if (phrase.lang === 'zh') {
          subtitleEl.textContent = '';
          subtitleEl.hidden = true;
          subtitleEl.style.minWidth = '0';
          subtitleEl.style.minHeight = '0';
          delete subtitleEl.dataset.script;
        } else {
          subtitleEl.hidden = false;
          if (lockedSubW) subtitleEl.style.minWidth = lockedSubW + 'px';
          if (lockedSubH) subtitleEl.style.minHeight = lockedSubH + 'px';
          const nextSub =
            subtitles[phrase.lang] ||
            subtitles.en ||
            '(it means northern happiness)';
          subtitleEl.textContent = nextSub;
          if (phrase.lang === 'braille') {
            subtitleEl.dataset.script = 'braille';
          } else {
            delete subtitleEl.dataset.script;
          }
        }
      }
    };

    const lockSize = () => {
      const wasLeaving = target.classList.contains('is-leaving');
      target.classList.remove('is-leaving');
      if (subtitleEl) subtitleEl.classList.remove('is-leaving');
      target.style.minWidth = '';
      target.style.minHeight = '';
      if (subtitleEl) {
        subtitleEl.style.minWidth = '';
        subtitleEl.style.minHeight = '';
      }

      let maxW = 0;
      let maxH = 0;
      let maxSubW = 0;
      let maxSubH = 0;

      phrases.forEach((phrase) => {
        setPhrase(phrase);
        const rect = target.getBoundingClientRect();
        maxW = Math.max(maxW, rect.width);
        maxH = Math.max(maxH, rect.height);
        if (subtitleEl && phrase.lang !== 'zh') {
          const subRect = subtitleEl.getBoundingClientRect();
          maxSubW = Math.max(maxSubW, subRect.width);
          maxSubH = Math.max(maxSubH, subRect.height);
        }
      });

      lockedSubW = Math.ceil(maxSubW);
      lockedSubH = Math.ceil(maxSubH);

      setPhrase(phrases[index]);
      target.style.minWidth = Math.ceil(maxW) + 'px';
      target.style.minHeight = Math.ceil(maxH) + 'px';
      if (subtitleEl && phrases[index].lang !== 'zh') {
        subtitleEl.style.minWidth = lockedSubW + 'px';
        subtitleEl.style.minHeight = lockedSubH + 'px';
      }

      if (wasLeaving) {
        target.classList.add('is-leaving');
        if (subtitleEl) subtitleEl.classList.add('is-leaving');
      }
    };

    const start = () => {
      setPhrase(phrases[0]);
      lockSize();

      let resizeTimer;
      window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(lockSize, 150);
      });

      const tick = () => {
        target.classList.add('is-leaving');
        if (subtitleEl) subtitleEl.classList.add('is-leaving');
        window.setTimeout(() => {
          index = pickNext(phrases.length, index);
          setPhrase(phrases[index]);
          target.classList.remove('is-leaving');
          if (subtitleEl) subtitleEl.classList.remove('is-leaving');
        }, FADE_MS);
      };

      window.setTimeout(() => {
        tick();
        window.setInterval(tick, INTERVAL_MS);
      }, delay + 2200);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }
  });
})();
