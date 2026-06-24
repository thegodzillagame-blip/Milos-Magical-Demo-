// =============================================================================
// MILO'S MAGICAL DEMO — engine.js
// Game state, AI logic, game loop — completely decoupled from rendering
// =============================================================================

const Engine = (() => {

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  let state = {};
  let loopId = null;
  let onTickCallback = null;
  let onEventCallback = null;

  function getState() { return state; }

  function init(nightNum) {
    const cfg = GAME_DATA.nights[nightNum];
    state = {
      night: nightNum,
      cfg,
      tick: 0,
      hour: 0,
      power: 100,
      alive: true,
      won: false,

      // View
      dir: 0,  // 0=front 1=left 2=right 3=back

      // Actions (held/toggled)
      camOpen: false,
      activeCam: 'stage',
      lightOn: false,
      doorHeld: false,
      hatchHeld: false,

      // Animatronic positions (index into their locations array)
      milo: 0,
      riley: 0,
      gail: 0,
      gizelle: 0,
      anthony: 0,

      // Retreat counters (separate per character)
      rileyDoorTicks: 0,
      anthonyDoorTicks: 0,
      hatchHoldTicks: 0,

      // Footstep scheduling
      lastFootstepTick: 0,

      // Track who killed the player
      killer: null
    };
  }

  // ---------------------------------------------------------------------------
  // EVENTS — emit named events to UI layer
  // ---------------------------------------------------------------------------
  function emit(name, data = {}) {
    if (onEventCallback) onEventCallback(name, data);
  }

  // ---------------------------------------------------------------------------
  // ACTIONS — called by UI
  // ---------------------------------------------------------------------------
  function setDir(d) {
    if (!state.alive || state.won) return;
    state.dir = ((d % 4) + 4) % 4;
    emit('dirChange', { dir: state.dir });
  }

  function turnLeft()  { setDir(state.dir - 1); }
  function turnRight() { setDir(state.dir + 1); }

  function toggleCam() {
    if (!state.alive || state.won) return;
    state.camOpen = !state.camOpen;
    emit('camToggle', { open: state.camOpen });
  }

  function setActiveCam(id) {
    state.activeCam = id;
    emit('camChange', { cam: id });
  }

  function toggleLight() {
    if (!state.alive || state.won) return;
    state.lightOn = !state.lightOn;
    emit('lightToggle', { on: state.lightOn });
  }

  function setDoorHeld(v) {
    if (!state.alive || state.won) return;
    const wasHeld = state.doorHeld;
    state.doorHeld = v;
    if (!v) {
      state.rileyDoorTicks = 0;
      state.anthonyDoorTicks = 0;
    }
    emit('doorChange', { held: v, wasHeld });
  }

  function setHatchHeld(v) {
    if (!state.alive || state.won) return;
    state.hatchHeld = v;
    if (!v) state.hatchHoldTicks = 0;
    emit('hatchChange', { held: v });
  }

  // ---------------------------------------------------------------------------
  // AI MOVEMENT
  // ---------------------------------------------------------------------------
  function tryMove(who, maxPos, chance) {
    if (state[who] >= maxPos - 1 || state[who] >= 99) return false;
    if (Math.random() < chance) {
      state[who]++;
      emit('animMove', { who, pos: state[who] });
      return true;
    }
    return false;
  }

  function moveChance(cfg) {
    return (cfg.baseMoveChance + state.hour * cfg.chancePerHour) * cfg.aggro
      + (state.lightOn ? cfg.lightBonus : 0);
  }

  function tickAI() {
    const cfg = state.cfg;
    const base = moveChance(cfg);

    // --- MILO (misdirection) ---
    if (state.milo < 4) {
      const miloChance = state.camOpen
        ? base + cfg.camMisdirectionBonus
        : base * 0.45;
      if (tryMove('milo', 5, miloChance) && state.camOpen) {
        emit('log', { msg: "Milo advanced while cameras were open!", cls: 'warn' });
      }
    }

    // --- RILEY (hall door) ---
    if (state.riley < 3) {
      tryMove('riley', 4, base);
    } else if (state.riley === 3) {
      if (state.doorHeld) {
        state.rileyDoorTicks++;
        emit('log', { msg: "Riley is at the door — KEEP HOLDING!", cls: 'warn' });
        if (state.rileyDoorTicks >= cfg.doorRetreaTicks) {
          state.riley = 1;
          state.rileyDoorTicks = 0;
          emit('animRetreat', { who: 'riley' });
          emit('log', { msg: "Riley retreated — door held!", cls: '' });
          AudioEngine.playDoorThud();
        }
      } else {
        state.rileyDoorTicks = 0;
      }
    }

    // --- ANTHONY (hall door, separate counter) ---
    if (state.anthony < 3) {
      tryMove('anthony', 4, base * 0.85);
    } else if (state.anthony === 3) {
      if (state.doorHeld) {
        state.anthonyDoorTicks++;
        emit('log', { msg: "Anthony is at the door — KEEP HOLDING!", cls: 'warn' });
        if (state.anthonyDoorTicks >= cfg.doorRetreaTicks) {
          state.anthony = 1;
          state.anthonyDoorTicks = 0;
          emit('animRetreat', { who: 'anthony' });
          emit('log', { msg: "Anthony retreated — door held!", cls: '' });
          AudioEngine.playDoorThud();
        }
      } else {
        state.anthonyDoorTicks = 0;
      }
    }

    // --- GAIL (hatch) ---
    if (state.gail < 3) {
      tryMove('gail', 4, base * 0.7);
    } else if (state.gail === 3) {
      if (state.hatchHeld) {
        state.hatchHoldTicks++;
        emit('log', { msg: "Gail is forcing the hatch — DON'T LET GO!", cls: 'warn' });
        if (state.hatchHoldTicks >= cfg.hatchRetreaTicks) {
          state.gail = 1;
          state.hatchHoldTicks = 0;
          emit('animRetreat', { who: 'gail' });
          emit('log', { msg: "Gail retreated down the ladder!", cls: '' });
        }
      } else {
        state.hatchHoldTicks = 0;
        if (Math.random() < 0.4) AudioEngine.playHatchRattle();
      }
    }

    // --- GIZELLE (rafters camera) ---
    if (state.gizelle < 3) {
      tryMove('gizelle', 4, base * 0.72);
    } else if (state.gizelle === 3) {
      // Watching rafters cam sends her back
      if (state.camOpen && state.activeCam === 'raft') {
        if (Math.random() < cfg.gizelleRetreatchance) {
          state.gizelle = 1;
          emit('animRetreat', { who: 'gizelle' });
          emit('log', { msg: "Gizelle retreated — you spotted her on the rafters cam!", cls: '' });
        }
      }
    }

    // Footstep sounds for hall threats
    const hallMoving = (state.riley >= 1 && state.riley < 3) || (state.anthony >= 1 && state.anthony < 3);
    if (hallMoving && state.tick - state.lastFootstepTick > 4) {
      state.lastFootstepTick = state.tick;
      AudioEngine.playFootstep();
    }
  }

  // ---------------------------------------------------------------------------
  // THREAT CHECKS — called after AI tick
  // Returns true if player died
  // ---------------------------------------------------------------------------
  function checkThreats() {
    // Milo at window
    if (state.milo >= 4 && state.milo < 99) {
      state.milo = 99;
      kill('milo', 1200);
      emit('log', { msg: "Milo is at the window!", cls: 'danger' });
      return true;
    }

    // Riley at door
    if (state.riley === 3 && !state.doorHeld) {
      state.riley = 99;
      kill('riley', 280);
      return true;
    }

    // Anthony at door
    if (state.anthony === 3 && !state.doorHeld) {
      state.anthony = 99;
      kill('anthony', 280);
      return true;
    }

    // Gail through hatch
    if (state.gail === 3 && !state.hatchHeld) {
      state.gail = 99;
      emit('log', { msg: "Gail forced the hatch!", cls: 'danger' });
      kill('gail', 520);
      return true;
    }

    // Gizelle at window
    if (state.gizelle === 3 && !(state.camOpen && state.activeCam === 'raft')) {
      state.gizelle = 99;
      emit('log', { msg: "Gizelle dropped from the rafters!", cls: 'danger' });
      kill('gizelle', 420);
      return true;
    }

    return false;
  }

  function kill(who, delay) {
    state.alive = false;
    state.killer = who;
    clearInterval(loopId);
    loopId = null;
    AudioEngine.stopAmbience();
    setTimeout(() => emit('jumpscare', { who }), delay);
  }

  // ---------------------------------------------------------------------------
  // GAME LOOP
  // ---------------------------------------------------------------------------
  function start(nightNum, tickCallback, eventCallback) {
    onTickCallback = tickCallback;
    onEventCallback = eventCallback;
    init(nightNum);
    loopId = setInterval(tick, 500);
  }

  function stop() {
    if (loopId) { clearInterval(loopId); loopId = null; }
  }

  function tick() {
    if (!state.alive || state.won) return;
    state.tick++;

    // Power drain
    let drain = GAME_DATA.power.baseDrainPerTick;
    if (state.lightOn) drain += GAME_DATA.power.lightDrain;
    if (state.camOpen) drain += GAME_DATA.power.camDrain;
    state.power = Math.max(0, state.power - drain);

    // Hour advancement
    const cfg = state.cfg;
    if (state.tick % cfg.ticksPerHour === 0) {
      const newHour = Math.min(6, Math.floor(state.tick / cfg.ticksPerHour));
      if (newHour !== state.hour) {
        state.hour = newHour;
        if (state.hour >= 6) {
          state.won = true;
          clearInterval(loopId);
          loopId = null;
          AudioEngine.stopAmbience();
          emit('victory');
          return;
        }
        AudioEngine.playHourChime();
        emit('hourChange', { hour: state.hour });
        emit('log', { msg: GAME_DATA.hours[state.hour] + " — they're getting restless...", cls: 'warn' });
      }
    }

    // Power out
    if (state.power <= 0) {
      state.power = 0;
      state.lightOn = false;
      AudioEngine.playPowerOut();
      emit('log', { msg: "Power out — all systems offline!", cls: 'danger' });
      emit('powerOut');
      state.alive = false;
      clearInterval(loopId);
      loopId = null;
      AudioEngine.stopAmbience();
      setTimeout(() => emit('jumpscare', { who: 'milo' }), GAME_DATA.power.powerOutDelay);
      return;
    }

    // AI moves every N ticks
    if (state.tick % cfg.moveEveryTicks === 0) {
      tickAI();
      if (checkThreats()) return;
    }

    if (onTickCallback) onTickCallback(state);
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------
  return {
    start,
    stop,
    getState,
    turnLeft,
    turnRight,
    toggleCam,
    setActiveCam,
    toggleLight,
    setDoorHeld,
    setHatchHeld
  };

})();
