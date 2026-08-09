// src/lib/programData.ts

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  duration: string;
  sets?: string;
  reps?: string;
  steps: string[];
  tips: string[];
  mistakes: string[];
  safety: string[];
  images: {
    proper: string;
    wrong?: string;
  }[];
  musclesWorked: string[];
  calories: string;
}

export interface Program {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  fullDescription: string;
  accentColor: string;
  glowColor: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  benefits: string[];
  targetAudience: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  weeklySchedule: string;
  caloriesBurn: string;
  aiCoachTip: string;
  demoVideoUrl: string;
  exercises: Exercise[];
}

export const programs: Program[] = [
  {
    slug: 'strength',
    title: 'Strength Training',
    tagline: 'Forge iron will. Build an unbreakable body.',
    description: 'Build muscle, power, and confidence with structured resistance training.',
    fullDescription:
      'Strength training is the cornerstone of any elite fitness regimen. Through progressive overload and compound movements, you systematically build lean muscle mass, increase bone density, and turbocharge your metabolism. Whether you\'re chasing a bigger deadlift or sculpting a powerful physique, our structured program delivers measurable results every week.',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.35)',
    gradientFrom: '#78350f',
    gradientTo: '#1c1917',
    icon: '🏋️',
    benefits: [
      'Increase lean muscle mass',
      'Boost resting metabolism by up to 15%',
      'Strengthen bones and joints',
      'Improve posture and body composition',
      'Enhance functional daily strength',
      'Build mental toughness & resilience',
    ],
    targetAudience: {
      beginner: 'Start with bodyweight movements and light dumbbells to master form before adding load.',
      intermediate: 'Progress into barbell compound lifts with structured periodization and progressive overload.',
      advanced: 'Utilize advanced techniques: drop sets, supersets, and periodized strength cycles.',
    },
    weeklySchedule: '3–5 days/week',
    caloriesBurn: '300–600 kcal/session',
    aiCoachTip:
      'Focus on your weakest compound lift first each session when your CNS is freshest. Prioritize the big 4: Squat, Deadlift, Bench Press, and Overhead Press — everything else is accessory work.',
    demoVideoUrl: 'https://www.youtube.com/embed/U9ENCvpkadY',
    exercises: [
      {
        id: 'bench-press',
        name: 'Bench Press',
        description: 'The king of upper body pushing movements, targeting the chest, shoulders, and triceps.',
        difficulty: 'Intermediate',
        duration: '45–60 min',
        sets: '4',
        reps: '6–10',
        steps: [
          'Lie flat on the bench, feet planted firmly on the floor.',
          'Grip the bar slightly wider than shoulder-width with a thumbs-around grip.',
          'Unrack the bar and lower it slowly to your mid-chest (2–3 seconds).',
          'Touch the bar lightly to your chest without bouncing.',
          'Drive the bar upward in a slight arc back toward the rack.',
          'Lock out at the top and repeat.',
        ],
        tips: [
          'Retract and depress your shoulder blades throughout the lift.',
          'Keep a natural arch in your lower back — feet stay flat.',
          'Control the eccentric (lowering) phase for maximum tension.',
        ],
        mistakes: [
          'Flaring elbows too wide (45–75° angle is safe).',
          'Bouncing the bar off the chest loses tension and risks injury.',
          'Lifting hips off the bench to complete a rep.',
        ],
        safety: [
          'Always use a spotter when lifting near your max.',
          'Do not lift in a power rack without proper safety bar setup.',
          'Warm up with 2–3 progressively heavier sets before working sets.',
        ],
        images: [
          {
            proper: '/exercises/strength/bench-press.png',
          },
        ],
        musclesWorked: ['Pectoralis Major', 'Anterior Deltoid', 'Triceps Brachii'],
        calories: '80–120 kcal',
      },
      {
        id: 'deadlift',
        name: 'Deadlift',
        description: 'The ultimate full-body compound movement. Master this and nothing in the gym will feel hard.',
        difficulty: 'Advanced',
        duration: '60 min',
        sets: '4',
        reps: '3–6',
        steps: [
          'Stand with feet hip-width apart, toes under the bar.',
          'Hinge at the hips and grip the bar just outside your legs (double overhand).',
          'Take a deep breath and brace your core like you\'re about to take a punch.',
          'Push the floor away with your legs — don\'t think of it as pulling.',
          'Keep the bar in contact with your shins as you drive your hips forward.',
          'Stand tall at the top, glutes squeezed, then return under control.',
        ],
        tips: [
          'Create "lat tension" by imagining you\'re trying to put your shoulder blades in your back pockets.',
          'Push through the floor, not pull the bar — mental cue is key.',
          'Film your lifts from the side to check bar path.',
        ],
        mistakes: [
          'Rounding the lower back under load.',
          'Bar drifting away from the body during the lift.',
          'Using your arms to pull — they should be passive hooks.',
        ],
        safety: [
          'Never sacrifice form for weight. Drop the weight before your back rounds.',
          'Use chalk or straps only after your grip becomes the limiting factor.',
          'Warm up progressively: start at 50% and build up.',
        ],
        images: [
          {
            proper: '/exercises/strength/deadlift.png',
          },
        ],
        musclesWorked: ['Erector Spinae', 'Glutes', 'Hamstrings', 'Quadriceps', 'Trapezius', 'Lats'],
        calories: '100–150 kcal',
      },
      {
        id: 'squat',
        name: 'Back Squat',
        description: 'The throne of leg development. Squats build total-body strength and athletic power.',
        difficulty: 'Intermediate',
        duration: '50 min',
        sets: '4',
        reps: '6–8',
        steps: [
          'Position the bar on your upper traps (high bar) or rear delts (low bar).',
          'Unrack and walk back — 2–3 steps max.',
          'Stand with feet shoulder-width, toes pointed out 15–30°.',
          'Initiate the squat by pushing your knees out and sitting back/down.',
          'Break parallel — crease of your hip below top of kneecap.',
          'Drive up through the full foot, keeping chest tall.',
        ],
        tips: [
          '"Spread the floor" with your feet to create hip stability.',
          'Keep your elbows pointed down, not back, for thoracic engagement.',
          'Breathe in at the top, hold and descend, exhale on the way up.',
        ],
        mistakes: [
          'Knees caving inward (valgus collapse) on the way up.',
          'Heels rising off the floor due to ankle mobility issues.',
          'Excessive forward lean turning the squat into a good morning.',
        ],
        safety: [
          'Use squat stands or a cage with properly set safety bars.',
          'Never squat to failure without spotters on free bar squats.',
          'Address ankle mobility if heels rise — goblet squats and stretching help.',
        ],
        images: [
          {
            proper: '/exercises/strength/squat.png',
          },
        ],
        musclesWorked: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core', 'Adductors'],
        calories: '90–130 kcal',
      },
      {
        id: 'overhead-press',
        name: 'Overhead Press',
        description: 'Build cannonball shoulders and full-upper-body stability with this pressing powerhouse.',
        difficulty: 'Intermediate',
        duration: '40 min',
        sets: '4',
        reps: '6–10',
        steps: [
          'Hold the bar at collar-bone height, just outside shoulder-width.',
          'Engage your core and glutes to create a rigid torso pillar.',
          'Press the bar straight up — tuck your chin slightly to allow bar path.',
          'Lock out overhead with ears between biceps and bar over the midfoot.',
          'Lower slowly back to the collarbone position with control.',
        ],
        tips: [
          'Think "big chest" — this cue helps open the ribcage for better pressing angle.',
          'Squeeze your glutes and abs to prevent excessive lumbar extension.',
          'Use leg drive only on "push press" variation, not strict press.',
        ],
        mistakes: [
          'Pressing in front of the body instead of directly overhead.',
          'Hyperextending the lower back to compensate for shoulder mobility.',
          'Not locking out fully at the top — partial reps rob shoulder strength gains.',
        ],
        safety: [
          'Stop if you feel shoulder impingement or pain — check mobility first.',
          'Start with dumbbells if barbell pressing causes shoulder discomfort.',
          'Keep weights manageable — form breaks down fast on OHP.',
        ],
        images: [
          {
            proper: '/exercises/strength/overhead-press.png',
          },
        ],
        musclesWorked: ['Deltoids', 'Trapezius', 'Triceps', 'Core', 'Serratus Anterior'],
        calories: '70–100 kcal',
      },
      {
        id: 'pull-ups',
        name: 'Pull-Ups',
        description: 'The bodyweight benchmark for upper-body pulling strength and lat width.',
        difficulty: 'Intermediate',
        duration: '30 min',
        sets: '4',
        reps: '5–12',
        steps: [
          'Hang from a pull-up bar with a pronated (overhand) grip, slightly wider than shoulder-width.',
          'Depress and retract your shoulder blades before you begin the pull.',
          'Drive your elbows down and back — imagine breaking the bar in half.',
          'Pull until your chin clears the bar or your chest approaches it (full ROM).',
          'Lower yourself under complete control — the negative builds serious strength.',
        ],
        tips: [
          'Use band assistance or inverted rows to build up to your first pull-up.',
          'Hollow body position — don\'t let your hips sag or legs swing.',
          'Add weight once you can do 10+ clean reps with full range.',
        ],
        mistakes: [
          'Half reps — partial ROM → partial gains.',
          'Kipping to compensate for lack of strength (hides the weakness).',
          'Shrugging shoulders up instead of depressing them at the start.',
        ],
        safety: [
          'Warm up your shoulder girdle before heavy pulling work.',
          'Avoid pull-ups if you have active rotator cuff impingement.',
          'Stop if you feel pain in the elbows — may need to deload.',
        ],
        images: [
          {
            proper: '/exercises/strength/pull-ups.png',
          },
        ],
        musclesWorked: ['Latissimus Dorsi', 'Biceps Brachii', 'Rear Deltoids', 'Rhomboids', 'Core'],
        calories: '50–80 kcal',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'cardio',
    title: 'Cardio Training',
    tagline: 'Endurance is the foundation of all fitness.',
    description: 'Improve heart health, burn calories, and build unstoppable aerobic stamina.',
    fullDescription:
      'Cardiovascular training is the engine of your fitness — it improves heart efficiency, boosts lung capacity, and unlocks the fat-burning machinery of your body. Our structured cardio program uses heart-rate zone training to help you build aerobic base, increase VO₂ max, and sustain high performance across all other training modalities.',
    accentColor: '#ef4444',
    glowColor: 'rgba(239,68,68,0.35)',
    gradientFrom: '#7f1d1d',
    gradientTo: '#1c1917',
    icon: '❤️',
    benefits: [
      'Strengthen your heart and lungs',
      'Burn up to 800 kcal per session',
      'Lower resting heart rate and blood pressure',
      'Improve mood via endorphin release',
      'Increase aerobic endurance and VO₂ max',
      'Accelerate recovery between strength sessions',
    ],
    targetAudience: {
      beginner: 'Start with 20–30 min walks or light cycling at Zone 2 heart rate (conversational pace).',
      intermediate: 'Mix steady-state cardio with tempo runs and stairmaster intervals for progression.',
      advanced: 'Lactate threshold training, long-distance runs, and polarized training models.',
    },
    weeklySchedule: '3–6 days/week',
    caloriesBurn: '300–800 kcal/session',
    aiCoachTip:
      'Zone 2 cardio (60–70% max HR) is where elite endurance athletes spend 80% of their training. It builds mitochondrial density, the key to long-term cardiovascular fitness. Don\'t always push hard — slow down to go far.',
    demoVideoUrl: 'https://www.youtube.com/embed/dg08vAn-lU8',
    exercises: [
      {
        id: 'running',
        name: 'Running (Treadmill)',
        description: 'The most accessible and effective cardio exercise. Running builds aerobic capacity and burns serious calories.',
        difficulty: 'Beginner',
        duration: '20–45 min',
        steps: [
          'Warm up with a 5-minute brisk walk.',
          'Set the treadmill to your target pace (start easy — 6–8 km/h).',
          'Land midfoot directly under your center of mass — avoid heel striking.',
          'Keep arms at 90° and drive them forward-backward, not across.',
          'Breathe rhythmically — inhale for 2–3 steps, exhale for 2.',
          'Cool down with 5 minutes of easy walking after your main run.',
        ],
        tips: [
          'Use the "talk test" — if you can\'t hold a conversation, you\'re going too fast for Zone 2.',
          'Increase weekly mileage by no more than 10% per week to avoid injury.',
          'Vary speed and incline to prevent adaptation and boredom.',
        ],
        mistakes: [
          'Holding onto the treadmill handrails — this skews calorie counting and mechanics.',
          'Overstriding — your foot lands too far in front of your body causing braking forces.',
          'Skipping the warm-up and cool-down.',
        ],
        safety: [
          'Invest in proper running shoes with appropriate arch support.',
          'Gradually acclimate to treadmill running — it differs from outdoor running.',
          'Stay hydrated — bring water even for sessions under 30 minutes.',
        ],
        images: [
          { proper: '/exercises/cardio/running.png' },
        ],
        musclesWorked: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Hip Flexors', 'Core'],
        calories: '250–400 kcal',
      },
      {
        id: 'cycling',
        name: 'Stationary Cycling',
        description: 'Zero-impact cardio powerhouse. Cycling develops powerful legs and exceptional aerobic capacity.',
        difficulty: 'Beginner',
        duration: '30–60 min',
        steps: [
          'Adjust seat height so your leg has a slight bend at the bottom of the pedal stroke.',
          'Set resistance to a level where you can maintain 80–100 RPM.',
          'Warm up at low resistance for 5 minutes.',
          'Pedal in smooth circles — think of scraping mud off the bottom of your shoe.',
          'Keep shoulders relaxed — don\'t grip the handlebars too tight.',
          'Cool down with 5 minutes of easy pedaling.',
        ],
        tips: [
          'For fat-burning: maintain Zone 2 (60–70% max HR) for 45–60 min.',
          'For performance: use interval protocol — 3 min hard, 3 min easy × 5 rounds.',
          'Track cadence (RPM) as a key metric alongside heart rate.',
        ],
        mistakes: [
          'Seat too low creating knee strain at the top of the pedal stroke.',
          'Rocking hips side-to-side — indicates seat is too high.',
          'Mashing at low cadence instead of spinning efficiently.',
        ],
        safety: [
          'Clip in or use toe cages properly — poor foot position strains the knee.',
          'Hydrate — cycling is deceptively sweaty.',
          'Check the seat and handlebar bolts are secure before each session.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core (stabilizing)'],
        calories: '200–500 kcal',
      },
      {
        id: 'rowing',
        name: 'Rowing Machine',
        description: 'The most complete cardio machine. Rowing works 86% of your muscle mass while building aerobic capacity.',
        difficulty: 'Intermediate',
        duration: '20–30 min',
        steps: [
          'Sit on the erg, strap your feet in at a comfortable angle.',
          'Start at the "catch" position — knees bent, shins vertical, arms extended.',
          'Drive through your legs first — legs → lean back → pull arms to lower rib.',
          'Return by extending arms → leaning forward → bending knees back to catch.',
          'Maintain a 20–24 strokes per minute (SPM) rate for steady-state.',
          'Focus on power per stroke, not just stroke rate.',
        ],
        tips: [
          'The drive sequence is critical: legs→back→arms. Breaking this order is the #1 novice mistake.',
          'Target a 500m split that you can sustain for your session duration.',
          'Set a damper at 3–5 for cardio, 7–10 only for short power rows.',
        ],
        mistakes: [
          'Pulling with your arms before finishing the leg drive.',
          'Hunching your shoulders and back under fatigue.',
          'Overreaching at the catch — causes lower back strain.',
        ],
        safety: [
          'Keep a neutral spine throughout — protect your lower back.',
          'Ease into rowing if you have lower back issues.',
          'Blister prevention: use fingerless grip gloves for long rows.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1599553236203-c32fbc987679?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Legs', 'Back', 'Core', 'Shoulders', 'Arms — full body'],
        calories: '300–500 kcal',
      },
      {
        id: 'jump-rope',
        name: 'Jump Rope',
        description: 'Pound-for-pound the most efficient cardio tool. Burns 200+ calories in just 20 minutes.',
        difficulty: 'Beginner',
        duration: '10–20 min',
        steps: [
          'Grip the handles lightly at hip height with handles pointing forward.',
          'Keep jumps low — 1–2 cm clearance is all you need.',
          'Use mainly wrists to spin the rope — big arm circles waste energy.',
          'Land softly on the balls of your feet — never flat-footed.',
          'Start with 30-second intervals with 30-second rest.',
          'Progress to double-unders as coordination improves.',
        ],
        tips: [
          '10 minutes of jump rope ≈ 30 minutes of moderate jogging in calorie burn.',
          'Master basic bounce first — then add cross-overs and double-unders.',
          'Best done on a sprung floor or rubber mat for joint absorption.',
        ],
        mistakes: [
          'Jumping too high — wastes energy and tires calves quickly.',
          'Using arm movements instead of wrist rotation to turn the rope.',
          'Starting with double-unders before mastering basic bounce.',
        ],
        safety: [
          'Good footwear is essential — your calves will be on fire at first.',
          'Shin splints can develop from too much too soon — progress gradually.',
          'Avoid jump rope on hard concrete for extended sessions.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Calves', 'Quadriceps', 'Shoulders', 'Core', 'Forearms'],
        calories: '200–300 kcal',
      },
      {
        id: 'stairmaster',
        name: 'StairMaster',
        description: 'Climb your way to elite lower-body conditioning and cardiovascular fitness.',
        difficulty: 'Intermediate',
        duration: '20–30 min',
        steps: [
          'Begin at level 3–5 for the first 3 minutes as warm-up.',
          'Stand tall — don\'t lean on the handrails or hunch over the console.',
          'Drive up through the full foot on each step — engage glutes, not just quads.',
          'Progress to level 8–12 during main work phase.',
          'Alternate between regular stepping, side-step, and crossover patterns for variety.',
          'Cool down at level 2–3 for the final 3 minutes.',
        ],
        tips: [
          'Minimal handhold: fingertip light touch only for balance, not support.',
          'The higher the level, the more glute activation — challenge yourself.',
          'Fast & low beats slow & high — keep steps quick for cardio benefits.',
        ],
        mistakes: [
          'Death-gripping the rails — offloads up to 25% of your body weight.',
          'Slouching over the console — compresses spine and reduces effectiveness.',
          'Short, choppy steps that only activate calves.',
        ],
        safety: [
          'Start slow — StairMaster at max levels is brutally demanding.',
          'Be aware of your elevation — get off safely by holding rails briefly.',
          'Great alternative for runners with knee pain — low impact option.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Glutes', 'Quadriceps', 'Hamstrings', 'Calves', 'Hip Flexors'],
        calories: '180–400 kcal',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'hiit',
    title: 'HIIT Training',
    tagline: 'Maximum results. Minimum time. Zero excuses.',
    description: 'High-intensity interval training that torches fat and builds explosive athletic power.',
    fullDescription:
      'HIIT delivers a metabolic afterburn effect (EPOC) that keeps your body burning calories for 24–48 hours after the session ends. By alternating maximum-effort bursts with short recovery periods, HIIT simultaneously builds aerobic capacity, improves insulin sensitivity, and torches fat at an accelerated rate — all in sessions under 30 minutes.',
    accentColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.35)',
    gradientFrom: '#7c2d12',
    gradientTo: '#1c1917',
    icon: '🔥',
    benefits: [
      'Burn 25–30% more calories than steady-state cardio',
      'EPOC: continue burning calories 24–48h post-workout',
      'Improve VO₂ max significantly in 8 weeks',
      'Preserve muscle while losing fat',
      'Improve insulin sensitivity',
      'Time efficient — maximum results in 20–30 min',
    ],
    targetAudience: {
      beginner: 'Begin with 20-second work, 40-second rest. Prioritize form over speed. Focus on bodyweight only.',
      intermediate: '30-second work, 15-second rest. Add light weights to compound movements.',
      advanced:
        'Tabata protocol (20s max/10s rest × 8) or ladder intervals. Weighted movements and explosive plyometrics.',
    },
    weeklySchedule: '2–4 days/week (allow 48h recovery)',
    caloriesBurn: '400–600 kcal/session + EPOC',
    aiCoachTip:
      'The "work" intervals must be truly maximal effort — 95%+ intensity. If you can hold a conversation during your work phase, you\'re not doing HIIT, you\'re just doing circuits. The magic is in the intensity.',
    demoVideoUrl: 'https://www.youtube.com/embed/ml6cT4AZdqI',
    exercises: [
      {
        id: 'burpees',
        name: 'Burpees',
        description: 'The ultimate full-body conditioning exercise. Equal parts torture and transformation.',
        difficulty: 'Intermediate',
        duration: '30s work / 15s rest',
        steps: [
          'Stand with feet shoulder-width apart.',
          'Drop your hands to the floor, jump or step both feet back to plank.',
          'Perform one push-up (optional for max intensity).',
          'Jump both feet back toward your hands.',
          'Explosively jump straight up, arms overhead.',
          'Land softly and immediately begin the next rep.',
        ],
        tips: [
          'Move as fast as possible during the work interval.',
          'Beginners: step feet back instead of jumping. Build up over time.',
          'Keep a strong plank position — don\'t let hips sag in the push-up.',
        ],
        mistakes: [
          'Slamming into the ground on the landing — absorb with soft knees.',
          'Losing plank position in the bottom phase.',
          'Moving too slow — the high intensity is what drives the EPOC effect.',
        ],
        safety: [
          'Modify by removing the jump (step jacks) if you have joint issues.',
          'Warm up fully before max-intensity burpee intervals.',
          'Listen to your body — burpees are maximum effort. Stop if dizzy.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Full Body: Core, Chest, Quads, Glutes, Shoulders'],
        calories: '10–15 kcal/min',
      },
      {
        id: 'jump-squats',
        name: 'Jump Squats',
        description: 'Plyometric power builder that lights up your legs and skyrockets your heart rate.',
        difficulty: 'Intermediate',
        duration: '30s work / 15s rest',
        steps: [
          'Stand with feet shoulder-width, toes slightly turned out.',
          'Perform a squat — hip crease below parallel.',
          'Explode upward as powerfully as possible.',
          'Reach full extension — feet leave the ground.',
          'Land softly, absorbing with bent knees directly into the next squat.',
          'Zero pause between reps — continuous flow.',
        ],
        tips: [
          'The landing is as important as the jump — focus on soft, controlled landing.',
          'Drive your arms forcefully upward at takeoff to increase height.',
          'For max power, focus on the explosiveness of each rep, not just speed.',
        ],
        mistakes: [
          'Flat-footed landing with locked knees — major injury risk.',
          'Quarter-squat depth instead of full squat before jumping.',
          'Leaning too far forward on the descent.',
        ],
        safety: [
          'Avoid on hard surfaces — sprung floors or rubber mats only.',
          'Reduce to bodyweight squats if knees hurt.',
          'Build explosive strength on regular squats before plyometric version.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves', 'Core'],
        calories: '12–16 kcal/min',
      },
      {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        description: 'High-speed core devastation disguised as a cardio drill. Your abs will not forgive you.',
        difficulty: 'Beginner',
        duration: '40s work / 20s rest',
        steps: [
          'Start in a high plank position, wrists under shoulders.',
          'Brace your core and keep your hips in line with your body.',
          'Drive one knee powerfully toward your chest.',
          'Immediately switch legs in a running motion.',
          'Maintain as fast a cadence as possible while keeping hips level.',
          'Breathe rapidly throughout — don\'t hold your breath.',
        ],
        tips: [
          'Speed is the goal — but not at the expense of hip level.',
          'Drive knees straight forward, not to the side (unless doing cross-body variation).',
          'Cross-body mountain climbers: drive knee to opposite elbow for oblique focus.',
        ],
        mistakes: [
          'Piking the hips upward — reduces core engagement significantly.',
          'Moving so fast that the feet barely leave the ground — ensure full knee drive.',
          'Letting the wrists drift out of alignment with shoulders.',
        ],
        safety: [
          'Protect wrists — use push-up handles if you have wrist discomfort.',
          'Modify on an incline (hands on a box) for shoulder or wrist issues.',
          'Breathe! Holding your breath at HIIT intensity causes dizziness.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Core', 'Shoulders', 'Hip Flexors', 'Quads', 'Chest (stabilizing)'],
        calories: '11–15 kcal/min',
      },
      {
        id: 'box-jumps',
        name: 'Box Jumps',
        description: 'Build explosive leg power and athletic performance with this plyometric pillar.',
        difficulty: 'Advanced',
        duration: '5 reps × 4 sets',
        sets: '4',
        reps: '5–8',
        steps: [
          'Stand 30cm in front of a plyometric box (start at 30–40cm height).',
          'Load into a quarter squat, swinging arms back.',
          'Explosively drive arms upward and jump with maximum effort.',
          'Land on the box with both feet simultaneously, soft landing.',
          'Stand tall to full extension on top of the box.',
          'Step down carefully — do NOT jump down from height.',
        ],
        tips: [
          'Quality over quantity — full rest between sets for true power output.',
          'Focus on landing quality and full hip extension on the box.',
          'Progress box height only when you can perform 8 clean reps at current height.',
        ],
        mistakes: [
          'Jumping down from the box instead of stepping — cumulative joint impact.',
          'Barely making the box and crashing your shins — reduce height and build up.',
          'Landing with a loud thud — indicates poor absorption mechanics.',
        ],
        safety: [
          'Use proper plyo boxes — never improvise with unstable surfaces.',
          'Warm up thoroughly — cold explosive movements risk tears.',
          'Have a bail plan: if you mis-jump, land and step back.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Quadriceps', 'Glutes', 'Calves', 'Hamstrings', 'Core'],
        calories: '8–12 kcal/set',
      },
      {
        id: 'battle-ropes',
        name: 'Battle Ropes',
        description: 'Upper-body HIIT meets cardiovascular warfare. Battle ropes build power, endurance, and grip strength simultaneously.',
        difficulty: 'Intermediate',
        duration: '30s work / 30s rest × 8',
        steps: [
          'Anchor the ropes at ground level. Hold one end in each hand.',
          'Stance: shoulder-width apart, slight knee bend, athletic position.',
          'Alternate arm waves — create continuous motion with maximum amplitude.',
          'Keep your core braced and hips stable throughout.',
          'Progress to double waves, slams, and circle patterns.',
          'Rest completely between work intervals.',
        ],
        tips: [
          'Bigger waves require more power — prioritize amplitude over pure speed.',
          'Double-arm slams are the most powerful variation — use them for peak intervals.',
          'Never fully lock out your arms — keep elbows slightly soft.',
        ],
        mistakes: [
          'Tiny, fast waves that look busy but require no real power.',
          'Standing upright with no hip hinge — reduces power transfer.',
          'Holding the breath throughout the interval.',
        ],
        safety: [
          'Ensure the anchor point is properly secured.',
          'Gradual grip strength build — ropes will destroy soft hands initially.',
          'Lower back caution: maintain neutral spine during slams — brace hard.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Shoulders', 'Arms', 'Core', 'Back', 'Legs (stabilizing)'],
        calories: '10–15 kcal/min',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    slug: 'yoga',
    title: 'Yoga & Mindfulness',
    tagline: 'Find stillness. Discover strength. Move with purpose.',
    description: 'Unite mind and body through ancient wisdom and modern practice for total wellness.',
    fullDescription:
      'Yoga is the missing link in most fitness programs. It builds the flexibility, mobility, and mind-muscle connection that make every other form of training more effective. Our yoga program blends traditional Hatha sequences with modern mobility science to improve range of motion, accelerate recovery, reduce injury risk, and cultivate the mental clarity needed for a truly elite lifestyle.',
    accentColor: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.35)',
    gradientFrom: '#4c1d95',
    gradientTo: '#1c1917',
    icon: '🧘',
    benefits: [
      'Increase flexibility and range of motion',
      'Reduce cortisol (stress hormone) levels',
      'Improve balance and proprioception',
      'Accelerate muscle recovery between sessions',
      'Build mental focus and mindfulness',
      'Reduce injury risk across all sports and training',
    ],
    targetAudience: {
      beginner: 'Foundational poses with props. Focus on breath coordination and basic alignment.',
      intermediate: 'Flowing sequences (Vinyasa), balance poses, and longer hold times.',
      advanced: 'Advanced inversions, arm balances, pranayama, and deep yin stretching.',
    },
    weeklySchedule: '3–7 days/week',
    caloriesBurn: '150–400 kcal/session',
    aiCoachTip:
      'The breath IS the practice. Every movement in yoga is driven by and synchronized with your breath. When you lose the breath, you\'ve left the practice. Always return to the breath — it\'s your anchor and your guide.',
    demoVideoUrl: 'https://www.youtube.com/embed/v7AYKMP6rOE',
    exercises: [
      {
        id: 'surya-namaskar',
        name: 'Surya Namaskar (Sun Salutation)',
        description: 'The foundational yoga sequence that warms the entire body, synchronizes breath with movement, and builds the yoga practice from the ground up.',
        difficulty: 'Beginner',
        duration: '5–10 rounds (15–30 min)',
        steps: [
          'Tadasana (Mountain Pose): Stand tall at the top of your mat, palms together at heart.',
          'Urdhva Hastasana: Inhale, sweep arms overhead, mild backbend.',
          'Uttanasana: Exhale, fold forward, hands to mat.',
          'Ardha Uttanasana: Inhale, lengthen spine, flat back.',
          'Plank / Chaturanga: Exhale, step back to plank, lower with control to Chaturanga.',
          'Urdhva Mukha (Upward Dog): Inhale, press up through hands, chest forward.',
          'Adho Mukha (Down Dog): Exhale, press hips up and back — hold 3–5 breaths.',
          'Step/jump to Ardha Uttanasana, Uttanasana, then return to Tadasana.',
        ],
        tips: [
          'Slow the sequence down to one breath per movement — don\'t rush.',
          'Energy flows down: press firmly through your hands in Down Dog for shoulder stability.',
          'In Chaturanga, keep elbows tracking along the ribs — not flaring wide.',
        ],
        mistakes: [
          'Collapsing the chest in Chaturanga — practice knee Chaturanga first.',
          'Not connecting breath to movement — the sequence becomes meaningless.',
          'Letting the lower back sag in Plank — engage core strongly.',
        ],
        safety: [
          'If you have carpal tunnel: use fists on the mat to reduce wrist pressure.',
          'In Upward Dog, press through hands to prevent lower back compression.',
          'Downward Dog can cause light-headedness initially — rest in Child\'s Pose as needed.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Full Body: Hamstrings, Spine, Shoulders, Hip Flexors, Core'],
        calories: '100–200 kcal',
      },
      {
        id: 'vrikshasana',
        name: 'Vrikshasana (Tree Pose)',
        description: 'The quintessential balance pose that builds single-leg stability, mental focus, and meditative concentration.',
        difficulty: 'Beginner',
        duration: '30–60s each side',
        steps: [
          'Begin in Tadasana (Mountain Pose), feet rooted into the mat.',
          'Shift weight onto the left foot, engaging the standing leg strongly.',
          'Turn the right knee outward and place the right foot on the inner left thigh (above or below knee, never on it).',
          'Fix your gaze (drishti) on a point that doesn\'t move.',
          'Bring hands to heart center or raise overhead like branches.',
          'Hold for 5–10 breaths, then switch sides.',
        ],
        tips: [
          'Drishti (gaze point) is the secret to balance — stare at one fixed point.',
          'Press the standing foot firmly into all four corners.',
          'If falling, smile — losing balance is part of the practice.',
        ],
        mistakes: [
          'Placing the foot directly on the knee — lateral joint stress.',
          'Holding the breath while trying to balance.',
          'Tipping the pelvis — keep both hip bones level and parallel.',
        ],
        safety: [
          'Use a wall for support as you develop single-leg balance.',
          'Keep the foot low (ankle) if hip flexibility is limited — build up gradually.',
          'Avoid if you have ankle instability — work on ankle strength first.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Glutes', 'Hip Abductors', 'Ankles', 'Core', 'Mental Focus'],
        calories: '30–60 kcal',
      },
      {
        id: 'warrior-2',
        name: 'Virabhadrasana II (Warrior II)',
        description: 'A standing power pose that builds hip strength, leg endurance, shoulder stability, and warrior-like mental focus.',
        difficulty: 'Beginner',
        duration: '30–60s each side',
        steps: [
          'From Tadasana, step or jump feet 3.5–4 feet apart.',
          'Turn the right foot 90° out, left foot 15° in.',
          'Bend the right knee to 90° — knee directly over ankles, not beyond toes.',
          'Extend arms parallel to the floor, one over each leg — gaze over front fingers.',
          'Keep the torso directly over the pelvis — don\'t lean forward.',
          'Hold for 5–10 breaths, then switch sides.',
        ],
        tips: [
          'Externally rotate the front thigh to keep the knee in line with the second toe.',
          'Strong back leg: press through the outer edge of the back foot.',
          'Warrior II is active — press through the fingertips, energize the reach.',
        ],
        mistakes: [
          'Front knee collapsing inward instead of tracking over the second toe.',
          'Back heel lifting off the mat.',
          'Sinking the front hip below knee level without enough hip flexibility.',
        ],
        safety: [
          'If thighs are weak, hold shorter duration and build up over weeks.',
          'Knee problems: keep the front knee slightly less bent.',
          'Use a chair for balance support while learning the pose.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1508921310243-261a868f60da?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Quadriceps', 'Glutes', 'Hip Abductors', 'Shoulders', 'Core'],
        calories: '40–80 kcal',
      },
      {
        id: 'downward-dog',
        name: 'Adho Mukha Svanasana (Down Dog)',
        description: 'The iconic rest-and-reset pose of yoga that stretches the entire posterior chain while building shoulder strength.',
        difficulty: 'Beginner',
        duration: '1–3 min hold',
        steps: [
          'Start on hands and knees — wrists under shoulders, knees under hips.',
          'Tuck the toes and on an exhale lift the knees off the floor.',
          'Press hips high and back — body forms an inverted V-shape.',
          'Press through the full palm — especially the index finger base to protect wrists.',
          'Externally rotate the upper arms slightly — creates space in the shoulders.',
          'Pedal the heels alternately if hamstrings are tight — work toward flat feet.',
        ],
        tips: [
          '"Armpits toward ears" — externally rotate shoulders for width across the upper back.',
          'Spread fingers wide and distribute weight evenly across the handprint.',
          'A slight bend in the knees is perfectly fine if hamstrings are tight.',
        ],
        mistakes: [
          'Rounding the thoracic spine instead of lengthening through the spine.',
          'Weight dumped entirely in the hands — engage the legs to share the load.',
          'Flaring the ribs downward — the front body should be engaged, not hanging.',
        ],
        safety: [
          'Wrist pain: use fists, yoga wedges, or forearm Dog as a modification.',
          'Come down to Child\'s Pose immediately if you feel dizziness from inversion.',
          'Shoulder injuries: use Dolphin Pose (forearms on mat) as a safe alternative.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Hamstrings', 'Calves', 'Shoulders', 'Thoracic Spine', 'Core (stabilizing)'],
        calories: '60–100 kcal',
      },
      {
        id: 'pigeon-pose',
        name: 'Eka Pada Rajakapotasana (Pigeon Pose)',
        description: 'The deep hip opener that most tight-hipped athletes desperately need. Unlocks stored tension and emotion alike.',
        difficulty: 'Intermediate',
        duration: '2–5 min each side',
        steps: [
          'From Down Dog, bring the right knee toward the right wrist.',
          'Slide the right foot toward the left wrist — the more parallel to the mat, the deeper the stretch.',
          'Lower the left leg flat behind you, toes pointed.',
          'Square the hips toward the mat — place a block under the right hip if needed.',
          'Option A: Stay upright (King Pigeon prep). Option B: Fold forward over the front leg.',
          'Breathe into the sensation — 2–5 minutes minimum. Switch sides.',
        ],
        tips: [
          'The magic is in the duration — 3-5 minutes per side produces visible hip opening.',
          'Breathe into the hip crease, not against the tension.',
          'Use a blanket or block under the hip religiously until flexibility allows full grounding.',
        ],
        mistakes: [
          'Ignoring lateral hip/knee pain — use a higher prop, don\'t suffer through damage.',
          'Holding for 30 seconds and calling it done — connective tissue needs 2+ minutes.',
          'Rounding the spine in the folded version instead of lengthening forward.',
        ],
        safety: [
          'Knee pain: perform Supine Pigeon (figure-4 stretch on your back) instead.',
          'This pose must be respected — never force a hip open under load.',
          'If you feel shin or knee pain, stop immediately — angle needs adjustment.',
        ],
        images: [
          { proper: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=75&auto=format' },
        ],
        musclesWorked: ['Hip External Rotators', 'Piriformis', 'Psoas', 'Groin', 'IT Band'],
        calories: '40–70 kcal',
      },
    ],
  },
];

export function getProgramBySlug(slug: string): Program | undefined {
  return programs.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return programs.map((p) => p.slug);
}
