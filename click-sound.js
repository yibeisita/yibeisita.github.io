/**
 * Soft wooden knock for CTA / nav links.
 * Synthesized via Web Audio — no audio file required.
 */
(function () {
  const SELECTOR = 'a.view-projects, .cv-nav a, a.back-link';
  const NAV_DELAY_MS = 90;

  let ctx = null;

  function getCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    return ctx;
  }

  function playClick() {
    const audio = getCtx();
    if (!audio) return Promise.resolve();

    if (audio.state === 'suspended') {
      audio.resume();
    }

    const now = audio.currentTime;
    const duration = 0.07;
    const frames = Math.floor(audio.sampleRate * duration);
    const buffer = audio.createBuffer(1, frames, audio.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 4);
    }

    // Soft wood grain / contact noise
    const noise = audio.createBufferSource();
    noise.buffer = buffer;
    const woodFilter = audio.createBiquadFilter();
    woodFilter.type = 'bandpass';
    woodFilter.frequency.value = 780;
    woodFilter.Q.value = 1.1;
    const noiseGain = audio.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    noise.connect(woodFilter);
    woodFilter.connect(noiseGain);
    noiseGain.connect(audio.destination);
    noise.start(now);
    noise.stop(now + duration);

    // Warm wooden knock (fundamental)
    const knock = audio.createOscillator();
    knock.type = 'sine';
    knock.frequency.setValueAtTime(220, now);
    knock.frequency.exponentialRampToValueAtTime(95, now + 0.055);
    const knockGain = audio.createGain();
    knockGain.gain.setValueAtTime(0.09, now);
    knockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    knock.connect(knockGain);
    knockGain.connect(audio.destination);
    knock.start(now);
    knock.stop(now + 0.065);

    // Mid wood resonance
    const body = audio.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(360, now);
    body.frequency.exponentialRampToValueAtTime(160, now + 0.04);
    const bodyGain = audio.createGain();
    bodyGain.gain.setValueAtTime(0.04, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    body.connect(bodyGain);
    bodyGain.connect(audio.destination);
    body.start(now);
    body.stop(now + 0.055);

    return new Promise(function (resolve) {
      setTimeout(resolve, NAV_DELAY_MS);
    });
  }

  document.addEventListener(
    'click',
    function (event) {
      const link = event.target.closest(SELECTOR);
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (link.target === '_blank') return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      event.preventDefault();
      playClick().then(function () {
        window.location.href = href;
      });
    },
    true
  );
})();
