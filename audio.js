// =============================================================================
// MILO'S MAGICAL DEMO — audio.js
// Procedural Web Audio engine — no external files needed
// =============================================================================

const AudioEngine = (() => {

  let ctx = null;
  let masterGain = null;
  let ambienceNodes = null;
  let creakInterval = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.85;
      masterGain.connect(ctx.destination);
    }
    return ctx;
  }

  // White noise buffer
  function makeNoiseBuffer(seconds, sampleRate) {
    const buf = ctx.createBuffer(1, sampleRate * seconds, sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ---------------------------------------------------------------------------
  // AMBIENCE — deep drone + low hum + distant rattles
  // ---------------------------------------------------------------------------
  function startAmbience() {
    if (ambienceNodes) return;
    const c = getCtx();

    // Low-pass filtered noise drone
    const noiseBuf = makeNoiseBuffer(4, c.sampleRate);
    const noiseSrc = c.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    noiseSrc.loop = true;
    const noiseLPF = c.createBiquadFilter();
    noiseLPF.type = 'lowpass';
    noiseLPF.frequency.value = 160;
    noiseLPF.Q.value = 2;
    const noiseGain = c.createGain();
    noiseGain.gain.value = 0.12;
    noiseSrc.connect(noiseLPF);
    noiseLPF.connect(noiseGain);
    noiseGain.connect(masterGain);

    // Fundamental hum — 55 Hz (electrical)
    const hum = c.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 55;
    const humGain = c.createGain();
    humGain.gain.value = 0.045;
    hum.connect(humGain);
    humGain.connect(masterGain);

    // Harmonic hum — 110 Hz
    const hum2 = c.createOscillator();
    hum2.type = 'sine';
    hum2.frequency.value = 110;
    const hum2Gain = c.createGain();
    hum2Gain.gain.value = 0.018;
    hum2.connect(hum2Gain);
    hum2Gain.connect(masterGain);

    // Distant mechanical rattle — 6 Hz LFO on noise
    const rattle = c.createOscillator();
    rattle.type = 'sine';
    rattle.frequency.value = 0.4;
    const rattleGain = c.createGain();
    rattleGain.gain.value = 0.04;
    rattle.connect(rattleGain);
    rattleGain.connect(noiseGain.gain);

    noiseSrc.start();
    hum.start();
    hum2.start();
    rattle.start();

    ambienceNodes = { noiseSrc, hum, hum2, rattle };

    // Schedule random distant creaks
    creakInterval = setInterval(() => {
      if (Math.random() < 0.4) playCreak(0.055 + Math.random() * 0.04);
    }, 5500 + Math.random() * 3000);
  }

  function stopAmbience() {
    if (!ambienceNodes) return;
    clearInterval(creakInterval);
    creakInterval = null;
    try {
      ambienceNodes.noiseSrc.stop();
      ambienceNodes.hum.stop();
      ambienceNodes.hum2.stop();
      ambienceNodes.rattle.stop();
    } catch (e) {}
    ambienceNodes = null;
  }

  // ---------------------------------------------------------------------------
  // CREAK — wooden structural creak
  // ---------------------------------------------------------------------------
  function playCreak(vol = 0.10) {
    const c = getCtx();
    const len = c.sampleRate * (0.3 + Math.random() * 0.4);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.sin(Math.PI * i / len);
      d[i] = (Math.random() * 2 - 1) * env * 0.9;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const lpf = c.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 280 + Math.random() * 120;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(lpf);
    lpf.connect(g);
    g.connect(masterGain);
    src.start();
  }

  // ---------------------------------------------------------------------------
  // FOOTSTEP — heavy animatronic foot on old wood floor
  // ---------------------------------------------------------------------------
  function playFootstep() {
    const c = getCtx();
    const len = Math.floor(c.sampleRate * 0.14);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.exp(-i / (len * 0.12));
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const lpf = c.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 220;
    const g = c.createGain();
    g.gain.value = 0.08;
    src.connect(lpf);
    lpf.connect(g);
    g.connect(masterGain);
    src.start();
  }

  // ---------------------------------------------------------------------------
  // DOOR THUD — heavy door being forced / held
  // ---------------------------------------------------------------------------
  function playDoorThud() {
    const c = getCtx();
    const len = Math.floor(c.sampleRate * 0.28);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.exp(-i / (len * 0.08));
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const lpf = c.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 110;
    const g = c.createGain();
    g.gain.value = 0.26;
    src.connect(lpf);
    lpf.connect(g);
    g.connect(masterGain);
    src.start();
  }

  // ---------------------------------------------------------------------------
  // HATCH RATTLE — metal hatch being forced from below
  // ---------------------------------------------------------------------------
  function playHatchRattle() {
    const c = getCtx();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const len = Math.floor(c.sampleRate * 0.08);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const d = buf.getChannelData(0);
        for (let j = 0; j < len; j++) {
          d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (len * 0.25));
        }
        const src = c.createBufferSource();
        src.buffer = buf;
        const hpf = c.createBiquadFilter();
        hpf.type = 'bandpass';
        hpf.frequency.value = 900;
        hpf.Q.value = 0.5;
        const g = c.createGain();
        g.gain.value = 0.14;
        src.connect(hpf);
        hpf.connect(g);
        g.connect(masterGain);
        src.start();
      }, i * 90);
    }
  }

  // ---------------------------------------------------------------------------
  // CAMERA CLICK — old VHS-era security camera tab switch
  // ---------------------------------------------------------------------------
  function playCamClick() {
    const c = getCtx();
    const len = Math.floor(c.sampleRate * 0.07);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.18)) * 0.5;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const hpf = c.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 1400;
    const g = c.createGain();
    g.gain.value = 0.18;
    src.connect(hpf);
    hpf.connect(g);
    g.connect(masterGain);
    src.start();
  }

  // ---------------------------------------------------------------------------
  // POWER FLICKER — lights cutting out
  // ---------------------------------------------------------------------------
  function playPowerOut() {
    const c = getCtx();
    // Descending electrical buzz
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, c.currentTime + 1.5);
    const g = c.createGain();
    g.gain.setValueAtTime(0.15, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5);
    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    osc.stop(c.currentTime + 1.6);
  }

  // ---------------------------------------------------------------------------
  // JUMPSCARE — loud burst + high screech
  // ---------------------------------------------------------------------------
  function playJumpscare() {
    const c = getCtx();

    // Noise burst
    const len = Math.floor(c.sampleRate * 0.9);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / (c.sampleRate * 0.5));
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = 1.0;
    src.connect(g);
    g.connect(masterGain);
    src.start();

    // Shriek tone
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.8);
    const og = c.createGain();
    og.gain.setValueAtTime(0.3, c.currentTime);
    og.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8);
    osc.connect(og);
    og.connect(masterGain);
    osc.start();
    osc.stop(c.currentTime + 0.9);
  }

  // ---------------------------------------------------------------------------
  // HOUR CHIME — clock tower distant bell
  // ---------------------------------------------------------------------------
  function playHourChime() {
    const c = getCtx();
    const freqs = [523.25, 659.25, 392, 261.63]; // C5 E5 G4 C4
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const g = c.createGain();
        g.gain.setValueAtTime(0.07, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
        osc.stop(c.currentTime + 1.3);
      }, i * 300);
    });
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  return {
    init() { getCtx(); },
    startAmbience,
    stopAmbience,
    playCreak,
    playFootstep,
    playDoorThud,
    playHatchRattle,
    playCamClick,
    playPowerOut,
    playJumpscare,
    playHourChime
  };

})();
