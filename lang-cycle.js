/**
 * Cycles text through languages with a soft fade.
 * Mark elements with class "lang-cycle" and a data-phrases JSON array.
 * Optional parent .lang-cycle-group fades with the text (e.g. name stays fixed).
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
          nameEl.classList.remove('ballet');
          nameEl.classList.add('display-name-zh');
        } else {
          const latin = nameEl.dataset.nameEn || 'Yibei Wang Chen';
          const [first, ...rest] = latin.split(' ');
          nameEl.innerHTML =
            '<span class="first-name">' + first + '</span>' +
            (rest.length
              ? '<span class="last-name"> ' + rest.join(' ') + '</span>'
              : '');
          nameEl.classList.add('ballet');
          nameEl.classList.remove('display-name-zh');
        }
      }
    };

    setPhrase(phrases[0]);

    const tick = () => {
      target.classList.add('is-leaving');
      window.setTimeout(() => {
        index = pickNext(phrases.length, index);
        setPhrase(phrases[index]);
        target.classList.remove('is-leaving');
      }, FADE_MS);
    };

    window.setTimeout(() => {
      tick();
      window.setInterval(tick, INTERVAL_MS);
    }, delay + 2200);
  });
})();
