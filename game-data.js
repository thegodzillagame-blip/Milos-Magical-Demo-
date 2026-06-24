// =============================================================================
// MILO'S MAGICAL DEMO — game-data.js
// All static game data: characters, locations, kill lines, night configs
// =============================================================================

const GAME_DATA = {

  // ---------------------------------------------------------------------------
  // LORE
  // ---------------------------------------------------------------------------
  lore: {
    venue: "Milo's Magical Dinner and Show",
    opened: 1988,
    founder: "Antonio Brown",
    founderBorn: 1962,
    grandfatherBorn: 1948,
    incident: "The Incident of '89 — a child entered Milo's disappearing cabinet and never came out. Covered up by the company."
  },

  // ---------------------------------------------------------------------------
  // HOURS
  // ---------------------------------------------------------------------------
  hours: ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM'],

  // ---------------------------------------------------------------------------
  // CHARACTERS
  // ---------------------------------------------------------------------------
  characters: {
    milo: {
      id: 'milo',
      name: 'Milo Macawbre',
      role: 'Star magician',
      emoji: '🎩',
      maxPos: 5,
      locations: ['Stage', 'Wings', 'Hallway', 'Near window', 'AT WINDOW'],
      // Misdirection: advances faster while cameras are open
      mechanic: 'misdirection',
      killLines: [
        "The ART of misdirection!",
        "A magician never reveals his secrets!",
        "Now you see me, now you don't!",
        "That's why they pay ME the big bucks!"
      ]
    },
    riley: {
      id: 'riley',
      name: 'Riley Rabbit',
      role: 'Assistant (unpaid intern energy)',
      emoji: '🐰',
      maxPos: 4,
      locations: ['Backstage', 'Hall far', 'Hall mid', 'AT DOOR'],
      mechanic: 'door', // blocked by holding the door
      killLines: [
        "",  // intentional blank — Riley says nothing
        "All's fair in love and war.",
        "Sorry about that, no hard feelings?"
      ]
    },
    anthony: {
      id: 'anthony',
      name: 'Anthony Antelope',
      role: 'Comedy duo — brawn',
      emoji: '🦌',
      maxPos: 4,
      locations: ['Stage', 'Kitchen', 'Hall mid', 'AT DOOR'],
      mechanic: 'door',
      killLines: [
        "Thems the breaks, kid!",
        "The weakness of your flesh disgusts me.",
        "Who's in the booth? Naturally!"
      ]
    },
    gizelle: {
      id: 'gizelle',
      name: 'Gizelle Gazelle',
      role: 'Comedy duo — brain',
      emoji: '🦌',
      maxPos: 4,
      locations: ['Seating', 'Rafters', 'Rafters close', 'AT WINDOW'],
      mechanic: 'rafters', // repelled by watching rafters cam
      killLines: [
        "Ya win some, ya lose some!",
        "Look out below!",
        "That's show business!"
      ]
    },
    gail: {
      id: 'gail',
      name: 'Gail the Gecko',
      role: 'Fortune teller sideshow',
      emoji: '🦎',
      maxPos: 4,
      locations: ['Alcove', 'Corridor', 'Ladder below', 'AT HATCH'],
      mechanic: 'hatch', // blocked by holding the hatch
      killLines: [
        "I knew this would happen.",
        "You don't live to see tomorrow.",
        "My predictions are never wrong."
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // NIGHTS
  // ---------------------------------------------------------------------------
  nights: {
    1: {
      label: 'Night 1',
      aggro: 1.0,
      description: 'First night. They are still warming up.',
      ticksPerHour: 38,
      moveEveryTicks: 9,
      baseMoveChance: 0.055,
      chancePerHour: 0.025,
      lightBonus: 0.08,
      camMisdirectionBonus: 0.22,
      doorRetreaTicks: 4,
      hatchRetreaTicks: 5,
      gizelleRetreatchance: 0.22
    },
    2: {
      label: 'Night 2',
      aggro: 1.6,
      description: 'They remember you from last night.',
      ticksPerHour: 38,
      moveEveryTicks: 9,
      baseMoveChance: 0.055,
      chancePerHour: 0.025,
      lightBonus: 0.08,
      camMisdirectionBonus: 0.26,
      doorRetreaTicks: 5,
      hatchRetreaTicks: 6,
      gizelleRetreatchance: 0.18
    },
    3: {
      label: 'Night 3',
      aggro: 2.4,
      description: "Corporate says the budget for a proper fix still isn't approved.",
      ticksPerHour: 38,
      moveEveryTicks: 9,
      baseMoveChance: 0.055,
      chancePerHour: 0.025,
      lightBonus: 0.10,
      camMisdirectionBonus: 0.32,
      doorRetreaTicks: 6,
      hatchRetreaTicks: 8,
      gizelleRetreatchance: 0.13
    }
  },

  // ---------------------------------------------------------------------------
  // POWER
  // ---------------------------------------------------------------------------
  power: {
    baseDrainPerTick: 0.04,
    lightDrain: 0.10,
    camDrain: 0.012,
    powerOutDelay: 3200,   // ms before Milo attacks after power out
  },

  // ---------------------------------------------------------------------------
  // CAMERA DEFINITIONS
  // ---------------------------------------------------------------------------
  cameras: [
    { id: 'stage',    label: 'Stage',          key: '1', who: ['milo','anthony'], emptyDesc: 'Main Stage — empty' },
    { id: 'back',     label: 'Backstage',       key: '2', who: ['riley'],         emptyDesc: 'Backstage — Riley has left' },
    { id: 'alcove',   label: 'Fortune Alcove',  key: '3', who: ['gail'],          emptyDesc: 'Alcove — Gail has left her post' },
    { id: 'raft',     label: 'Rafters',         key: '4', who: ['gizelle'],       emptyDesc: 'Rafters — all clear' }
  ],

  // ---------------------------------------------------------------------------
  // BOOTH DIRECTIONS
  // ---------------------------------------------------------------------------
  directions: [
    { id: 'front', label: 'Front',         sublabel: 'Stage window' },
    { id: 'left',  label: 'Left',          sublabel: 'Sloped hallway' },
    { id: 'right', label: 'Right',         sublabel: 'Maintenance panel' },
    { id: 'back',  label: 'Behind you',    sublabel: 'Closet hatch' }
  ],

  // ---------------------------------------------------------------------------
  // KEYBINDS
  // ---------------------------------------------------------------------------
  keybinds: {
    lookLeft:   'ArrowLeft',
    lookRight:  'ArrowRight',
    cameras:    'c',
    light:      'l',
    door:       'd',
    hatch:      'h',
    cam1:       '1',
    cam2:       '2',
    cam3:       '3',
    cam4:       '4'
  }

};
