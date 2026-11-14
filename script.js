// ==========================================
// 0. TAILWIND THEME CONFIGURATION
// ==========================================
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      colors: {
        cream: '#FAF7F2',
        linen: '#F3EDE3',
        ink: '#1E2723',
        stonewarm: '#5D5A54',
        sage: {
          50: '#F1F8F5',
          100: '#DCEFE7',
          200: '#BBE0D1',
          400: '#499F84',
          500: '#267D64',
          600: '#1D6550',
          700: '#175040',
        },
        terracotta: {
          50: '#FDF5EF',
          100: '#F9E6D6',
          200: '#F2C9A8',
          500: '#C96A32',
          600: '#B05723',
        }
      }
    }
  }
}

// ==========================================
// 0B. GOOGLE SHEETS DATABASE CONFIGURATION
// ==========================================
const GOOGLE_SHEETS_SPREADSHEET_ID = '10eZNThH_XgvGglH67HU90uPT7pHbhv-yZ6N2ql5hIm8';
// Optional: Paste your deployed Google Apps Script Web App URL (/exec) for static hosting.
// When left blank locally, the survey uses the local bridge at /api/submit (server.py).
const GOOGLE_SHEETS_WEBAPP_URL = '';
const LOCAL_BRIDGE_URL = 'http://localhost:8080/api/submit';

// ==========================================
// 1. COMMUNITY SURVEY QUESTIONS & LOGIC
// ==========================================
const rawQuestions = [
  {
    id: 'welcome',
    type: 'welcome',
    section: 'Welcome',
    title: "Community Needs & Interests Survey",
    subtitle: 'Help us shape upcoming youth, family, and community programming.<span class="hidden sm:inline"> Navigate entirely with your keyboard—press Enter to advance or Left Arrow to go back anytime.</span>',
    buttonText: "Start Survey"
  },

  // SECTION 1 — About You (Demographics)
  {
    id: 'age_range',
    type: 'choice',
    section: 'Section 1 • About You',
    required: true,
    title: "What is your age range?",
    subtitle: "Helps us understand who is responding so programming can be tailored.",
    options: [
      'Under 15', '15–17', '18–24', '25–34',
      '35–44', '45–54', '55–64', '65+'
    ]
  },
  {
    id: 'gender',
    type: 'choice',
    section: 'Section 1 • About You',
    required: true,
    title: "What is your gender?",
    subtitle: "Press A, B, or C on your keyboard.",
    options: ['Male', 'Female', 'Prefer not to say']
  },
  {
    id: 'ethnicity',
    type: 'text',
    section: 'Section 1 • About You',
    required: false,
    title: "What is your ethnicity or cultural background?",
    subtitle: 'Optional — helpful for understanding our community\'s diversity.<span class="hidden sm:inline"> Press Enter ↵ to skip or continue.</span>',
    placeholder: "e.g., Arab, South Asian, African American, Convert..."
  },
  {
    id: 'city',
    type: 'text',
    section: 'Section 1 • About You',
    required: true,
    title: "What city do you live in?",
    subtitle: "Type your city or click a quick-fill tag below.",
    placeholder: "Type your city of residence...",
    quickChips: ['Warren', 'Troy', 'Sterling Heights', 'Rochester Hills', 'Madison Heights', 'Detroit', 'Dearborn']
  },
  {
    id: 'household_type',
    type: 'choice',
    section: 'Section 1 • About You',
    required: true,
    title: "Which best describes your household type?",
    subtitle: "Select one option.",
    options: [
      'Single',
      'Married, no children',
      'Married with children',
      'Single parent',
      'Living with extended family',
      'Other'
    ]
  },
  {
    id: 'has_children',
    type: 'choice',
    section: 'Section 1 • About You',
    required: true,
    title: "Do you have children?",
    subtitle: "Press A for Yes or B for No.",
    options: ['Yes', 'No']
  },
  {
    id: 'children_ages',
    type: 'multiselect',
    section: 'Section 1 • About You',
    required: true,
    // Conditional: Only show if user answered "Yes" to has_children OR chose Married with children / Single parent
    condition: (ans) => ans.has_children === 'Yes' || ans.household_type === 'Married with children' || ans.household_type === 'Single parent',
    title: "What are the ages of your children?",
    subtitle: 'Select all age groups that apply<span class="hidden sm:inline">, then press Enter ↵</span>.',
    options: ['0–4', '5–9', '10–13', '14–17', '18+']
  },

  // SECTION 2 — Your Current Engagement With Our Programming
  {
    id: 'attended_past_year',
    type: 'choice',
    section: 'Section 2 • Current Engagement',
    required: true,
    title: "Have you attended any of our programs in the past 12 months?",
    subtitle: "Press A for Yes or B for No.",
    options: ['Yes', 'No']
  },
  {
    id: 'attended_program_types',
    type: 'multiselect',
    section: 'Section 2 • Current Engagement',
    required: true,
    // Conditional: Only show if attended_past_year === 'Yes'
    condition: (ans) => ans.attended_past_year === 'Yes',
    title: "Which types of programs have you attended?",
    subtitle: 'Select all that apply<span class="hidden sm:inline"> using letter keys, then press Enter ↵</span>.',
    options: [
      'Sports / Recreation',
      'Social gatherings',
      'Youth programs',
      'Sisters’ programs',
      'Brothers’ programs',
      'Family programs',
      'Islamic education / halaqas',
      'Professional development',
      'Community service / volunteering',
      'Other'
    ]
  },
  {
    id: 'satisfaction_rating',
    type: 'scale',
    section: 'Section 2 • Current Engagement',
    required: true,
    title: "How satisfied are you with the current programming?",
    subtitle: "Press a number key from 1 to 5.",
    minLabel: "1 = Not satisfied",
    maxLabel: "5 = Very satisfied",
    scale: [1, 2, 3, 4, 5]
  },
  {
    id: 'stopped_attending_reasons',
    type: 'multiselect',
    section: 'Section 2 • Current Engagement',
    required: false,
    title: "If you stopped attending certain programs (or haven't attended recently), why?",
    subtitle: 'Optional — select any barriers that apply<span class="hidden sm:inline">, then press Enter ↵</span>.',
    options: [
      'Timing doesn’t work',
      'Not interested anymore',
      'Program doesn’t meet my needs',
      'Too far / transportation issues',
      'Didn’t feel welcomed',
      'Didn’t know about programs',
      'Other'
    ]
  },

  // SECTION 3 — Community Needs & Challenges
  {
    id: 'biggest_challenges',
    type: 'multiselect',
    section: 'Section 3 • Community Needs & Challenges',
    required: true,
    title: "What are the biggest challenges you or your family are facing right now?",
    subtitle: 'Select all that apply<span class="hidden sm:inline">, then press Enter ↵</span>.',
    options: [
      'Mental health / stress',
      'Parenting challenges',
      'Marriage / relationship support',
      'Youth guidance / mentorship',
      'Islamic education',
      'Financial stress',
      'Career development',
      'Social isolation / lack of community',
      'Health & wellness',
      'Elder support',
      'Navigating identity / culture',
      'Other'
    ]
  },
  {
    id: 'unspoken_issues',
    type: 'textarea',
    section: 'Section 3 • Community Needs & Challenges',
    required: false,
    title: "Are there issues you feel the community struggles with but rarely talks about?",
    subtitle: 'Optional — helps uncover hidden needs like burnout, loneliness, or mental health.<span class="hidden sm:inline"> Press Enter ↵ to continue.</span>',
    placeholder: "Share your thoughts openly (your response helps guide support initiatives)..."
  },
  {
    id: 'support_comfort',
    type: 'scale',
    section: 'Section 3 • Community Needs & Challenges',
    required: true,
    title: "How comfortable do you feel seeking support from community organizations?",
    subtitle: "Press a number key from 1 to 5.",
    minLabel: "1 = Not comfortable at all",
    maxLabel: "5 = Very comfortable",
    scale: [1, 2, 3, 4, 5]
  },

  // SECTION 4 — Program Interests
  {
    id: 'desired_programs',
    type: 'multiselect',
    section: 'Section 4 • Program Interests',
    required: true,
    title: "Which types of programs would you like to see more of?",
    subtitle: 'Select all that interest you<span class="hidden sm:inline"> (A–P), then press Enter ↵</span>.',
    options: [
      'Youth mentorship',
      'Parenting workshops',
      'Marriage workshops',
      'Mental health awareness',
      'Islamic education',
      'Qur’an memorization circles',
      'Professional development',
      'Networking for young professionals',
      'Sports / recreation',
      'Sisters-only programs',
      'Brothers-only programs',
      'Family events',
      'Elder support programs',
      'Volunteer opportunities',
      'Cultural events',
      'Other'
    ]
  },
  {
    id: 'youth_topics',
    type: 'multiselect',
    section: 'Section 4 • Program Interests',
    required: true,
    title: "For youth programs, what topics are most needed?",
    subtitle: 'Select all that apply<span class="hidden sm:inline">, then press Enter ↵</span>.',
    options: [
      'Identity & confidence',
      'Islamic knowledge',
      'Social skills',
      'Mental health',
      'Academic support',
      'Career guidance',
      'Healthy friendships',
      'Avoiding harmful influences',
      'Other'
    ]
  },
  {
    id: 'adult_topics',
    type: 'multiselect',
    section: 'Section 4 • Program Interests',
    required: true,
    title: "For adult programs, what topics are most needed?",
    subtitle: 'Select all that apply<span class="hidden sm:inline">, then press Enter ↵</span>.',
    options: [
      'Parenting',
      'Marriage',
      'Mental health',
      'Islamic education',
      'Career development',
      'Financial literacy',
      'Health & fitness',
      'Community building',
      'Other'
    ]
  },

  // SECTION 5 — Logistics & Accessibility
  {
    id: 'best_times',
    type: 'multiselect',
    section: 'Section 5 • Logistics & Accessibility',
    required: true,
    title: "What days and times work best for you?",
    subtitle: 'Select all that apply<span class="hidden sm:inline">, then press Enter ↵</span>.',
    options: [
      'Weekday evenings',
      'Weekend mornings',
      'Weekend afternoons',
      'Weekend evenings'
    ]
  },
  {
    id: 'preferred_format',
    type: 'choice',
    section: 'Section 5 • Logistics & Accessibility',
    required: true,
    title: "What is your preferred program format?",
    subtitle: "Press A, B, or C.",
    options: ['In-person', 'Online', 'Hybrid']
  },
  {
    id: 'travel_distance',
    type: 'choice',
    section: 'Section 5 • Logistics & Accessibility',
    required: true,
    title: "How far are you willing to travel for a program?",
    subtitle: "Press A, B, C, or D.",
    options: [
      'Under 10 minutes',
      '10–20 minutes',
      '20–30 minutes',
      '30+ minutes'
    ]
  },

  // SECTION 6 — Final Thoughts
  {
    id: 'one_wish',
    type: 'textarea',
    section: 'Section 6 • Final Thoughts',
    required: false,
    title: "What is one thing you wish our community offered?",
    subtitle: '<span class="hidden sm:inline">Shift ⇧ + Enter ↵ for a line break, or press Enter ↵ to continue.</span><span class="sm:hidden">Optional — share your idea or wish below.</span>',
    placeholder: "Type your idea or wish here..."
  },
  {
    id: 'volunteer_interest',
    type: 'choice',
    section: 'Section 6 • Final Thoughts',
    required: true,
    title: "Would you like to volunteer or contribute to community programming?",
    subtitle: "Press A, B, or C.",
    options: ['Yes', 'No', 'Maybe']
  },
  {
    id: 'volunteer_areas',
    type: 'multiselect',
    section: 'Section 6 • Final Thoughts',
    required: true,
    // Conditional: Show if volunteer_interest is Yes or Maybe
    condition: (ans) => ans.volunteer_interest === 'Yes' || ans.volunteer_interest === 'Maybe',
    title: "What areas would you like to help with?",
    subtitle: 'Select all that apply<span class="hidden sm:inline">, then press Enter ↵</span>.',
    options: [
      'Youth mentorship',
      'Event planning',
      'Teaching / leading sessions',
      'Logistics',
      'Marketing / communications',
      'Fundraising',
      'Other'
    ]
  },
  {
    id: 'email',
    type: 'text',
    section: 'Section 6 • Final Thoughts',
    required: false,
    title: "Lastly, what is your email address if you'd like program updates or volunteer follow-up?",
    subtitle: 'Optional<span class="hidden sm:inline"> — press Enter ↵ to submit your survey</span>.',
    placeholder: "name@example.com"
  },
  {
    id: 'summary',
    type: 'summary',
    section: 'Completed'
  }
];

// Map letter keys (A, B, C...) automatically onto options
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
rawQuestions.forEach(q => {
  if (q.options) {
    q.options = q.options.map((label, idx) => ({
      key: alphabet[idx],
      label
    }));
  }
});

// ==========================================
// 2. STATE & DYNAMIC VISIBLE PATH
// ==========================================
let currentStepIndex = 0;
let direction = 'next';
let isTransitioning = false;
let submissionStatus = 'idle'; // 'idle' | 'submitting' | 'saved' | 'unconfigured' | 'error'
const answers = {};
const otherText = {}; // Stores custom text when "Other" is selected

const container = document.getElementById('question-container');
const progressBar = document.getElementById('progress-bar');
const stepCounter = document.getElementById('step-counter');
const sectionBadge = document.getElementById('section-badge');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
btnPrev.addEventListener('click', prevStep);
btnNext.addEventListener('click', nextStep);

function getActiveQuestions() {
  return rawQuestions.filter(q => !q.condition || q.condition(answers));
}

const PRESS_ENTER_HINT = '<span class="hidden sm:inline text-xs text-stonewarm">press <strong class="text-ink font-semibold">Enter ↵</strong></span>';
const CHOICE_CHECK_SVG = '<svg class="w-5 h-5 text-sage-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>';
const MULTI_CHECK_SVG = '<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>';

function choiceOptionClass(selected) {
  return `w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between group ${
    selected
      ? 'bg-sage-50 border-sage-500 text-ink shadow-sm ring-1 ring-sage-500/30'
      : 'bg-cream/60 hover:bg-sage-50/50 border-[#E2D9CC] hover:border-sage-300 text-ink'
  }`;
}

function choiceBadgeClass(selected) {
  return `w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 transition ${
    selected
      ? 'bg-sage-600 border-sage-600 text-white'
      : 'bg-white border-[#D6CEC2] text-stonewarm group-hover:border-sage-400 group-hover:text-sage-700'
  }`;
}

function multiOptionClass(selected) {
  return `w-full text-left p-2.5 sm:p-3 rounded-2xl border transition flex items-center justify-between group ${
    selected
      ? 'bg-sage-50 border-sage-500 text-ink shadow-sm'
      : 'bg-cream/60 hover:bg-sage-50/50 border-[#E2D9CC] hover:border-sage-300 text-ink'
  }`;
}

function multiBadgeClass(selected) {
  return `w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 transition ${
    selected
      ? 'bg-sage-600 border-sage-600 text-white'
      : 'bg-white border-[#D6CEC2] text-stonewarm group-hover:border-sage-400 group-hover:text-sage-700'
  }`;
}

function multiBoxClass(selected) {
  return `w-5 h-5 rounded-md border shrink-0 flex items-center justify-center transition ${
    selected ? 'bg-sage-600 border-sage-600' : 'bg-white border-[#C8BFB2]'
  }`;
}

function scaleOptionClass(selected) {
  return `h-16 rounded-2xl border text-xl font-bold transition flex items-center justify-center ${
    selected
      ? 'bg-sage-600 border-sage-600 text-white shadow-md shadow-sage-600/25'
      : 'bg-cream/70 hover:bg-sage-50 border-[#E2D9CC] hover:border-sage-400 text-ink'
  }`;
}

function focusAtEnd(el) {
  if (!el) return;
  el.focus();
  const len = el.value.length;
  el.setSelectionRange(len, len);
}

// ==========================================
// 3. RENDER ENGINE
// ==========================================
function renderQuestion() {
  const activeQuestions = getActiveQuestions();
  if (currentStepIndex >= activeQuestions.length) {
    currentStepIndex = activeQuestions.length - 1;
  }

  const q = activeQuestions[currentStepIndex];
  const animClass = direction === 'next' ? 'slide-enter-next' : 'slide-enter-prev';

  // Progress & Header updates
  const totalRealQuestions = activeQuestions.length - 2; // Exclude welcome & summary
  const progress = currentStepIndex === 0
    ? 0
    : Math.min(100, Math.round((currentStepIndex / (activeQuestions.length - 1)) * 100));

  progressBar.style.width = `${progress}%`;
  sectionBadge.textContent = q.section || 'Community Survey';

  if (q.type !== 'welcome' && q.type !== 'summary') {
    stepCounter.textContent = `${currentStepIndex} / ${totalRealQuestions}`;
  } else {
    stepCounter.textContent = '';
  }

  btnPrev.disabled = currentStepIndex === 0;
  btnNext.disabled = currentStepIndex === activeQuestions.length - 1;

  let html = `<div id="card-wrapper" class="${animClass}">`;

  // Question Number Header
  if (q.type !== 'welcome' && q.type !== 'summary') {
    html += `
      <div class="flex flex-wrap items-center gap-2 text-sage-600 font-semibold text-xs uppercase tracking-wider mb-3">
        <span class="px-2.5 py-1 rounded-full bg-sage-100/90 text-sage-700 border border-sage-200/80">Question ${currentStepIndex}</span>
        <span class="text-stonewarm font-medium normal-case tracking-normal">${q.section}</span>
        ${!q.required ? `<span class="px-2 py-0.5 rounded-full bg-terracotta-50 text-terracotta-600 border border-terracotta-200/70 font-medium normal-case tracking-normal">Optional</span>` : ''}
      </div>
    `;
  }

  // 1. WELCOME SCREEN
  if (q.type === 'welcome') {
    html += `
      <div class="bg-white/90 backdrop-blur-sm border border-[#E6DDD0] rounded-3xl p-7 sm:p-11 shadow-[0_18px_48px_-16px_rgba(30,39,35,0.10)] space-y-6">
        <div class="flex items-center justify-between gap-4">
          <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-terracotta-50 text-terracotta-600 border border-terracotta-200">
            <span class="w-2 h-2 rounded-full bg-terracotta-500"></span>
            Community Voices Matter
          </span>
          <span class="text-xs font-medium text-stonewarm hidden sm:inline">Takes ~3–4 minutes</span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
          <div class="shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-[#E6DDD0] p-2.5 shadow-sm">
            <img src="youth-of-ummah-logo.png" alt="Youth of Ummah" class="w-full h-full object-contain" />
          </div>
          <div class="space-y-2.5">
            <h1 class="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-[1.15]">${q.title}</h1>
            <p class="text-base sm:text-lg text-stonewarm leading-relaxed max-w-2xl">${q.subtitle}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-sage-50/80 border border-sage-200/70 text-xs text-sage-700 font-medium">
            <svg class="w-4 h-4 shrink-0 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span>Youth &amp; Family Focus</span>
          </div>
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-terracotta-50/80 border border-terracotta-200/70 text-xs text-terracotta-600 font-medium">
            <svg class="w-4 h-4 shrink-0 text-terracotta-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>Respectful &amp; Private</span>
          </div>
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-linen/80 border border-[#E2D8C8] text-xs text-ink font-medium">
            <svg class="w-4 h-4 shrink-0 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>Keyboard-Friendly</span>
          </div>
        </div>

        <div class="pt-3 flex flex-wrap items-center gap-4">
          <button onclick="nextStep()" class="px-7 py-3.5 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-2xl shadow-md shadow-sage-600/20 transition flex items-center gap-2.5">
            <span>${q.buttonText}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </button>
          ${PRESS_ENTER_HINT}
        </div>
      </div>
    `;
  }

  // 2. SHORT TEXT INPUT
  else if (q.type === 'text') {
    const val = answers[q.id] || '';
    html += `
      <div class="bg-white/90 backdrop-blur-sm border border-[#E6DDD0] rounded-3xl p-6 sm:p-9 shadow-[0_14px_40px_-14px_rgba(30,39,35,0.08)] space-y-5">
        <div class="space-y-1.5">
          <h2 class="text-2xl sm:text-3xl font-bold text-ink leading-snug tracking-tight">${q.title}</h2>
          <p class="text-stonewarm text-sm sm:text-base">${q.subtitle}</p>
        </div>
        <div class="pt-2">
          <input id="active-input" type="text" value="${val.replace(/"/g, '&quot;')}" placeholder="${q.placeholder}"
            oninput="answers['${q.id}'] = this.value; clearError();"
            class="w-full bg-cream/60 border-b-2 border-[#D6CEC2] focus:border-sage-500 rounded-t-xl px-3 text-xl sm:text-2xl py-3 text-sage-700 font-medium placeholder-[#A69E92] focus:outline-none focus:bg-sage-50/40 transition" />
          <p id="error-msg" class="text-rose-600 text-sm font-medium mt-2.5 hidden">Please fill this in before continuing.</p>
        </div>
        ${q.quickChips ? `
          <div class="pt-1 flex flex-wrap gap-2">
            ${q.quickChips.map(city => `
              <button onclick="fillQuickChip('${q.id}', '${city}')"
                class="px-3.5 py-1.5 rounded-full text-xs font-medium bg-cream hover:bg-sage-50 border border-[#DFD6C9] hover:border-sage-400 text-ink transition">
                + ${city}
              </button>
            `).join('')}
          </div>
        ` : ''}
        <div class="pt-2 flex items-center gap-3">
          <button onclick="nextStep()" class="px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center gap-2">
            Continue
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </button>
          ${PRESS_ENTER_HINT}
        </div>
      </div>
    `;
  }

  // 3. SINGLE CHOICE
  else if (q.type === 'choice') {
    const currentVal = answers[q.id];
    const useTwoCols = q.options.length > 5;
    const showOtherInput = currentVal === 'Other';

    html += `
      <div class="bg-white/90 backdrop-blur-sm border border-[#E6DDD0] rounded-3xl p-6 sm:p-9 shadow-[0_14px_40px_-14px_rgba(30,39,35,0.08)] space-y-4">
        <div class="space-y-1.5">
          <h2 class="text-2xl sm:text-3xl font-bold text-ink leading-snug tracking-tight">${q.title}</h2>
          <p class="text-stonewarm text-sm sm:text-base">${q.subtitle}</p>
        </div>
        <div class="pt-2 grid ${useTwoCols ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2.5">
          ${q.options.map(opt => {
            const isSelected = currentVal === opt.label;
            return `
              <button id="opt-${opt.key}" aria-pressed="${isSelected}" onclick="selectSingleChoice('${q.id}', '${opt.label.replace(/'/g, "\\'")}', '${opt.key}')"
                class="${choiceOptionClass(isSelected)}">
                <div class="flex items-center gap-3">
                  <span data-role="badge" class="${choiceBadgeClass(isSelected)}">
                    ${opt.key}
                  </span>
                  <span class="font-medium text-sm sm:text-base">${opt.label}</span>
                </div>
                <span data-role="check">${isSelected ? CHOICE_CHECK_SVG : ''}</span>
              </button>
            `;
          }).join('')}
        </div>

        <div id="other-wrapper" class="pt-2 ${showOtherInput ? '' : 'hidden'}">
          <input id="other-input" type="text" value="${(otherText[q.id] || '').replace(/"/g, '&quot;')}"
            placeholder="Please specify 'Other'..."
            oninput="otherText['${q.id}'] = this.value;"
            class="w-full bg-cream/70 border border-sage-400 rounded-xl px-4 py-2.5 text-sm text-ink placeholder-[#9D9589] focus:outline-none focus:ring-2 focus:ring-sage-500/30" />
        </div>

        <p id="error-msg" class="text-rose-600 text-sm font-medium mt-2 hidden">Please select an option to continue.</p>
      </div>
    `;
  }

  // 4. MULTI-SELECT CHECKBOXES
  else if (q.type === 'multiselect') {
    const selectedList = answers[q.id] || [];
    const useTwoCols = q.options.length > 5;
    const showOtherInput = selectedList.includes('Other');

    html += `
      <div class="bg-white/90 backdrop-blur-sm border border-[#E6DDD0] rounded-3xl p-6 sm:p-9 shadow-[0_14px_40px_-14px_rgba(30,39,35,0.08)] space-y-3.5">
        <div class="space-y-1">
          <h2 class="text-2xl sm:text-3xl font-bold text-ink leading-snug tracking-tight">${q.title}</h2>
          <p class="text-stonewarm text-sm sm:text-base">${q.subtitle}</p>
        </div>
        <div class="pt-1.5 grid ${useTwoCols ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2 max-h-[48vh] overflow-y-auto pr-1">
          ${q.options.map(opt => {
            const isSelected = selectedList.includes(opt.label);
            return `
              <button id="opt-${opt.key}" aria-pressed="${isSelected}" onclick="toggleMultiChoice('${q.id}', '${opt.label.replace(/'/g, "\\'")}')"
                class="${multiOptionClass(isSelected)}">
                <div class="flex items-center gap-3 pr-2">
                  <span data-role="badge" class="${multiBadgeClass(isSelected)}">
                    ${opt.key}
                  </span>
                  <span class="font-medium text-sm">${opt.label}</span>
                </div>
                <div data-role="box" class="${multiBoxClass(isSelected)}">
                  ${isSelected ? MULTI_CHECK_SVG : ''}
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Always rendered so toggling "Other" can show/hide it without re-rendering the card -->
        <div id="other-wrapper" class="pt-1 ${showOtherInput ? '' : 'hidden'}">
          <input id="other-input" type="text" value="${(otherText[q.id] || '').replace(/"/g, '&quot;')}"
            placeholder="Please specify 'Other'..."
            oninput="otherText['${q.id}'] = this.value;"
            class="w-full bg-cream/70 border border-sage-400 rounded-xl px-4 py-2 text-sm text-ink placeholder-[#9D9589] focus:outline-none focus:ring-2 focus:ring-sage-500/30" />
        </div>

        <p id="error-msg" class="text-rose-600 text-sm font-medium mt-1 hidden">Please select at least one option.</p>
        <div class="pt-2 flex items-center gap-3">
          <button onclick="nextStep()" class="px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center gap-2">
            Continue
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </button>
          ${PRESS_ENTER_HINT}
        </div>
      </div>
    `;
  }

  // 5. LINEAR SCALE (1-5)
  else if (q.type === 'scale') {
    const currentVal = answers[q.id];
    html += `
      <div class="bg-white/90 backdrop-blur-sm border border-[#E6DDD0] rounded-3xl p-6 sm:p-9 shadow-[0_14px_40px_-14px_rgba(30,39,35,0.08)] space-y-4">
        <div class="space-y-1.5">
          <h2 class="text-2xl sm:text-3xl font-bold text-ink leading-snug tracking-tight">${q.title}</h2>
          <p class="text-stonewarm text-sm sm:text-base">${q.subtitle}</p>
        </div>
        <div class="pt-4 grid grid-cols-5 gap-3">
          ${q.scale.map(num => {
            const isSelected = currentVal === num;
            return `
              <button id="scale-${num}" aria-pressed="${isSelected}" onclick="selectScale('${q.id}', ${num})"
                class="${scaleOptionClass(isSelected)}">
                ${num}
              </button>
            `;
          }).join('')}
        </div>
        <div class="flex justify-between text-xs font-medium text-stonewarm pt-1">
          <span>${q.minLabel}</span>
          <span>${q.maxLabel}</span>
        </div>
        <p id="error-msg" class="text-rose-600 text-sm font-medium mt-2 hidden">Please select a rating from 1 to 5.</p>
      </div>
    `;
  }

  // 6. PARAGRAPH / TEXTAREA
  else if (q.type === 'textarea') {
    const val = answers[q.id] || '';
    html += `
      <div class="bg-white/90 backdrop-blur-sm border border-[#E6DDD0] rounded-3xl p-6 sm:p-9 shadow-[0_14px_40px_-14px_rgba(30,39,35,0.08)] space-y-4">
        <div class="space-y-1.5">
          <h2 class="text-2xl sm:text-3xl font-bold text-ink leading-snug tracking-tight">${q.title}</h2>
          <p class="text-stonewarm text-sm sm:text-base">${q.subtitle}</p>
        </div>
        <div class="pt-2">
          <textarea id="active-input" rows="3" placeholder="${q.placeholder}"
            oninput="answers['${q.id}'] = this.value; clearError();"
            class="w-full bg-cream/60 border border-[#D6CEC2] focus:border-sage-500 rounded-2xl p-4 text-base sm:text-lg text-ink placeholder-[#9D9589] focus:outline-none focus:bg-white focus:ring-2 focus:ring-sage-500/20 transition resize-none">${val}</textarea>
          <p id="error-msg" class="text-rose-600 text-sm font-medium mt-1.5 hidden">Please enter a response before continuing.</p>
        </div>
        <div class="pt-2 flex items-center gap-3">
          <button onclick="nextStep()" class="px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center gap-2">
            Continue
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </button>
          ${PRESS_ENTER_HINT}
        </div>
      </div>
    `;
  }

  // 7. COMPLETED SUMMARY & GOOGLE SHEETS SYNC
  else if (q.type === 'summary') {
    if (submissionStatus === 'idle') {
      submitToGoogleSheets();
    }
    html += `
      <div class="selectable-text bg-white/95 backdrop-blur-sm border border-[#E6DDD0] rounded-3xl p-6 sm:p-9 shadow-[0_18px_48px_-16px_rgba(30,39,35,0.12)] space-y-6 max-h-[75vh] overflow-y-auto">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE2D6] pb-5">
          <div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200">
              <svg class="w-3.5 h-3.5 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              JazakAllah Khair / Thank You!
            </span>
            <h2 class="font-display text-2xl sm:text-3xl font-bold text-ink mt-2">Community Survey Response Summary</h2>
            <p class="text-sm text-stonewarm mt-0.5">${answers.city || 'No city'} • ${answers.age_range || ''} • ${answers.household_type || ''}</p>
          </div>
          <div class="flex gap-2">
            <button onclick="downloadJSON()" class="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold shadow-sm transition">
              Download JSON
            </button>
            <button onclick="resetSurvey()" class="px-4 py-2 rounded-xl bg-linen hover:bg-[#E7DFD2] border border-[#DDD4C6] text-ink text-xs font-semibold transition">
              New Response
            </button>
          </div>
        </div>

        <div id="sheets-status-banner">${getSubmissionStatusHTML()}</div>

        <div class="grid sm:grid-cols-2 gap-3 text-xs">
          <div class="p-4 rounded-2xl bg-cream/80 border border-[#E6DDD0]">
            <p class="text-sage-700 uppercase font-semibold tracking-wider mb-1">Top Family Challenges</p>
            <p class="text-ink leading-relaxed">${(answers.biggest_challenges || []).join(', ') || '—'}</p>
          </div>
          <div class="p-4 rounded-2xl bg-cream/80 border border-[#E6DDD0]">
            <p class="text-sage-700 uppercase font-semibold tracking-wider mb-1">Requested Programs</p>
            <p class="text-ink leading-relaxed">${(answers.desired_programs || []).join(', ') || '—'}</p>
          </div>
          <div class="p-4 rounded-2xl bg-cream/80 border border-[#E6DDD0]">
            <p class="text-sage-700 uppercase font-semibold tracking-wider mb-1">Youth Topics Needed</p>
            <p class="text-ink leading-relaxed">${(answers.youth_topics || []).join(', ') || '—'}</p>
          </div>
          <div class="p-4 rounded-2xl bg-cream/80 border border-[#E6DDD0]">
            <p class="text-sage-700 uppercase font-semibold tracking-wider mb-1">Adult Topics Needed</p>
            <p class="text-ink leading-relaxed">${(answers.adult_topics || []).join(', ') || '—'}</p>
          </div>
          <div class="p-4 rounded-2xl bg-cream/80 border border-[#E6DDD0]">
            <p class="text-sage-700 uppercase font-semibold tracking-wider mb-1">Schedule &amp; Logistics</p>
            <p class="text-ink leading-relaxed">${(answers.best_times || []).join(', ')} • ${answers.preferred_format || ''} (${answers.travel_distance || ''})</p>
          </div>
          <div class="p-4 rounded-2xl bg-cream/80 border border-[#E6DDD0]">
            <p class="text-sage-700 uppercase font-semibold tracking-wider mb-1">Volunteering</p>
            <p class="text-ink leading-relaxed">${answers.volunteer_interest || 'No'} ${(answers.volunteer_areas || []).length ? `(${answers.volunteer_areas.join(', ')})` : ''}</p>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 text-xs text-stonewarm">
          <button onclick="prevStep()" class="hover:text-ink font-medium transition">
            ← Press Left Arrow to review or edit answers
          </button>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;

  // Focus input if visible
  const inputEl = document.getElementById('active-input') || document.querySelector('#other-wrapper:not(.hidden) #other-input');
  if (inputEl) {
    setTimeout(() => focusAtEnd(inputEl), 50);
  }
}

// ==========================================
// 4. STEP & SELECTION HANDLERS
// ==========================================
function clearError() {
  const err = document.getElementById('error-msg');
  if (err) err.classList.add('hidden');
}

function validateCurrentStep() {
  const activeQuestions = getActiveQuestions();
  const q = activeQuestions[currentStepIndex];
  if (!q.required) return true;

  const val = answers[q.id];
  const isEmpty =
    val === undefined ||
    val === null ||
    (typeof val === 'string' && val.trim() === '') ||
    (Array.isArray(val) && val.length === 0);

  if (isEmpty) {
    const err = document.getElementById('error-msg');
    const card = document.getElementById('card-wrapper');
    if (err) err.classList.remove('hidden');
    if (card) {
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
    return false;
  }
  return true;
}

function nextStep() {
  const activeQuestions = getActiveQuestions();
  if (isTransitioning || currentStepIndex >= activeQuestions.length - 1) return;
  if (!validateCurrentStep()) return;

  direction = 'next';
  currentStepIndex++;
  renderQuestion();
}

function prevStep() {
  if (isTransitioning || currentStepIndex <= 0) return;
  direction = 'prev';
  currentStepIndex--;
  renderQuestion();
}

function fillQuickChip(qId, value) {
  answers[qId] = value;
  clearError();
  const inputEl = document.getElementById('active-input');
  if (inputEl) {
    inputEl.value = value;
    focusAtEnd(inputEl);
  }
}

function toggleOtherWrapper(isShown) {
  const wrapper = document.getElementById('other-wrapper');
  if (!wrapper) return;
  wrapper.classList.toggle('hidden', !isShown);
  if (isShown) {
    focusAtEnd(document.getElementById('other-input'));
  }
}

function selectSingleChoice(qId, label, key) {
  if (isTransitioning) return;
  answers[qId] = label;
  clearError();

  const q = rawQuestions.find(item => item.id === qId);
  if (q?.options) {
    q.options.forEach(opt => {
      const btn = document.getElementById(`opt-${opt.key}`);
      if (!btn) return;
      const selected = opt.key === key;
      btn.className = choiceOptionClass(selected);
      btn.setAttribute('aria-pressed', String(selected));
      const badge = btn.querySelector('[data-role="badge"]');
      if (badge) badge.className = choiceBadgeClass(selected);
      const check = btn.querySelector('[data-role="check"]');
      if (check) check.innerHTML = selected ? CHOICE_CHECK_SVG : '';
    });
  }

  // If user clicked "Other", reveal the custom input field in-place instead of auto-advancing
  if (label === 'Other') {
    toggleOtherWrapper(true);
    return;
  }

  toggleOtherWrapper(false);
  isTransitioning = true;
  const btn = document.getElementById(`opt-${key}`);
  if (btn) btn.classList.add('blink-select');

  setTimeout(() => {
    isTransitioning = false;
    nextStep();
  }, 320);
}

function toggleMultiChoice(qId, label) {
  const list = answers[qId] ? [...answers[qId]] : [];
  const idx = list.indexOf(label);
  const isSelected = idx === -1;
  if (isSelected) list.push(label);
  else list.splice(idx, 1);
  answers[qId] = list;

  if (list.length > 0) clearError();

  const q = rawQuestions.find(item => item.id === qId);
  const opt = q?.options?.find(o => o.label === label);
  const btn = opt ? document.getElementById(`opt-${opt.key}`) : null;
  if (btn) {
    btn.className = multiOptionClass(isSelected);
    btn.setAttribute('aria-pressed', String(isSelected));
    const badge = btn.querySelector('[data-role="badge"]');
    if (badge) badge.className = multiBadgeClass(isSelected);
    const box = btn.querySelector('[data-role="box"]');
    if (box) {
      box.className = multiBoxClass(isSelected);
      box.innerHTML = isSelected ? MULTI_CHECK_SVG : '';
    }
  }

  if (label === 'Other') {
    toggleOtherWrapper(isSelected);
  }
}

function selectScale(qId, num) {
  if (isTransitioning) return;
  isTransitioning = true;
  answers[qId] = num;
  clearError();

  const q = rawQuestions.find(item => item.id === qId);
  if (q?.scale) {
    q.scale.forEach(n => {
      const btn = document.getElementById(`scale-${n}`);
      if (!btn) return;
      const selected = n === num;
      btn.className = scaleOptionClass(selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
  }

  const btn = document.getElementById(`scale-${num}`);
  if (btn) btn.classList.add('blink-select');

  setTimeout(() => {
    isTransitioning = false;
    nextStep();
  }, 300);
}

function buildSubmissionPayload() {
  return {
    spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
    submittedAt: new Date().toISOString(),
    answers,
    otherDetails: otherText
  };
}

function getSubmissionStatusHTML() {
  if (submissionStatus === 'submitting') {
    return `<div class="px-4 py-2.5 rounded-2xl bg-sage-50 border border-sage-200 text-xs font-medium text-sage-700">Saving response to Google Sheets...</div>`;
  }
  if (submissionStatus === 'saved') {
    return `<div class="px-4 py-2.5 rounded-2xl bg-sage-50 border border-sage-200 text-xs font-semibold text-sage-700">Response saved to Google Sheets database.</div>`;
  }
  if (submissionStatus === 'unconfigured') {
    return `<div class="px-4 py-2.5 rounded-2xl bg-terracotta-50 border border-terracotta-200 text-xs text-terracotta-600">Google Sheets Web App URL not configured yet — add your deployed Apps Script URL in <code>script.js</code> (you can still download JSON below).</div>`;
  }
  if (submissionStatus === 'error') {
    return `<div class="px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-3"><span>Could not save to Google Sheets. Please try again or download JSON.</span><button onclick="submitToGoogleSheets()" class="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shrink-0 transition">Retry</button></div>`;
  }
  return '';
}

function updateSubmissionBanner() {
  const banner = document.getElementById('sheets-status-banner');
  if (banner) banner.innerHTML = getSubmissionStatusHTML();
}

async function postToLocalBridge(body) {
  const sameOriginUrl = window.location.protocol.startsWith('http') ? '/api/submit' : null;
  const targets = sameOriginUrl && window.location.origin !== 'http://localhost:8080'
    ? [sameOriginUrl, LOCAL_BRIDGE_URL]
    : [sameOriginUrl || LOCAL_BRIDGE_URL];

  for (const url of targets) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      if (res.ok) return 'saved';
    } catch (_) {
      // Try next candidate endpoint
    }
  }
  return 'unconfigured';
}

async function submitToGoogleSheets() {
  submissionStatus = 'submitting';
  updateSubmissionBanner();
  const body = JSON.stringify(buildSubmissionPayload());

  if (GOOGLE_SHEETS_WEBAPP_URL) {
    try {
      await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body
      });
      submissionStatus = 'saved';
    } catch (err) {
      console.error('Google Sheets submission failed:', err);
      submissionStatus = 'error';
    }
    updateSubmissionBanner();
    return;
  }

  submissionStatus = await postToLocalBridge(body);
  updateSubmissionBanner();
}

function downloadJSON() {
  const payload = buildSubmissionPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `community-survey-response-${Date.now()}.json`;
  a.click();
}

function resetSurvey() {
  Object.keys(answers).forEach(k => delete answers[k]);
  Object.keys(otherText).forEach(k => delete otherText[k]);
  submissionStatus = 'idle';
  direction = 'prev';
  currentStepIndex = 0;
  renderQuestion();
}

// ==========================================
// 5. GLOBAL KEYBOARD SHORTCUTS
// ==========================================
window.addEventListener('keydown', (e) => {
  // Never hijack browser/OS shortcuts (Cmd+C, Ctrl+C, Cmd+1, Alt+Arrow, etc.)
  if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;

  const activeQuestions = getActiveQuestions();
  const q = activeQuestions[currentStepIndex];
  const activeEl = document.activeElement;
  const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

  // 1. ENTER -> Next Question
  if (e.key === 'Enter') {
    if (q.type === 'textarea' && e.shiftKey) return;
    e.preventDefault();
    nextStep();
    return;
  }

  // 2. LEFT ARROW -> Previous Question
  if (e.key === 'ArrowLeft') {
    if (isTyping && activeEl.selectionStart > 0) return;
    e.preventDefault();
    prevStep();
    return;
  }

  // 3. RIGHT ARROW -> Next Question
  if (e.key === 'ArrowRight') {
    if (isTyping && activeEl.selectionEnd < activeEl.value.length) return;
    e.preventDefault();
    nextStep();
    return;
  }

  // 4. LETTER HOTKEYS (A-P) for Choice & Multi-select
  if (!isTyping && (q.type === 'choice' || q.type === 'multiselect')) {
    const key = e.key.toUpperCase();
    const matched = q.options.find(o => o.key === key);
    if (matched) {
      e.preventDefault();
      if (q.type === 'choice') {
        selectSingleChoice(q.id, matched.label, matched.key);
      } else {
        toggleMultiChoice(q.id, matched.label);
      }
    }
  }

  // 5. NUMBER HOTKEYS (1-5) for Scale
  if (!isTyping && q.type === 'scale') {
    const num = parseInt(e.key, 10);
    if (q.scale.includes(num)) {
      e.preventDefault();
      selectScale(q.id, num);
    }
  }
});

// Initial render
renderQuestion();
