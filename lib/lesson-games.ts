export type LessonGameKind = 'semantic' | 'grid' | 'states' | 'array' | 'async';

export interface LessonGameBase {
  lessonSlug: string;
  lessonTitle: string;
  kind: LessonGameKind;
  arcadeLabel: string;
  title: string;
  subtitle: string;
  story: string;
  rewardTitle: string;
  rewardDescription: string;
  palette: {
    from: string;
    via: string;
    to: string;
    glow: string;
    chip: string;
  };
}

export interface SemanticRound {
  prompt: string;
  context: string;
  choices: { label: string; description: string }[];
  answer: string;
  insight: string;
  celebration: string;
}

export interface GridOptionPlacement {
  label: string;
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  tone: string;
}

export interface GridRound {
  prompt: string;
  context: string;
  hint: string;
  options: {
    id: string;
    label: string;
    note: string;
    placements: GridOptionPlacement[];
  }[];
  answer: string;
  insight: string;
  celebration: string;
}

export interface StatesRound {
  scenario: string;
  targetState: string;
  context: string;
  options: {
    id: string;
    label: string;
    styleNote: string;
  }[];
  answer: string;
  insight: string;
  celebration: string;
}

export interface ArrayRound {
  prompt: string;
  input: string[];
  target: string[];
  options: {
    id: string;
    label: string;
    explanation: string;
  }[];
  answer: string;
  insight: string;
  celebration: string;
}

export interface AsyncRound {
  scenario: string;
  goal: string;
  availableSteps: string[];
  answer: string[];
  insight: string;
  celebration: string;
}

export interface SemanticLessonGame extends LessonGameBase {
  kind: 'semantic';
  rounds: SemanticRound[];
}

export interface GridLessonGame extends LessonGameBase {
  kind: 'grid';
  rounds: GridRound[];
}

export interface StatesLessonGame extends LessonGameBase {
  kind: 'states';
  rounds: StatesRound[];
}

export interface ArrayLessonGame extends LessonGameBase {
  kind: 'array';
  rounds: ArrayRound[];
}

export interface AsyncLessonGame extends LessonGameBase {
  kind: 'async';
  rounds: AsyncRound[];
}

export type LessonGameDefinition =
  | SemanticLessonGame
  | GridLessonGame
  | StatesLessonGame
  | ArrayLessonGame
  | AsyncLessonGame;

const FRONTEND_FOUNDATIONS_GAMES: LessonGameDefinition[] = [
  {
    lessonSlug: 'frontend-development-foundations-semantic-structure-audit',
    lessonTitle: 'Audit and improve semantic page structure',
    kind: 'semantic',
    arcadeLabel: 'Semantic Sleuth',
    title: 'Page Glow-Up Detective',
    subtitle: 'Find the best semantic upgrade for each messy page section.',
    story:
      'You are the frontend detective on a magazine redesign team. Each round gives you a vague wrapper. Pick the semantic tag that makes the page easier to read, maintain, and explain.',
    rewardTitle: 'Semantic Sleuth unlocked',
    rewardDescription: 'You can spot structure that describes purpose before style.',
    palette: {
      from: 'from-rose-500/25',
      via: 'via-fuchsia-500/15',
      to: 'to-amber-400/20',
      glow: 'shadow-[0_0_60px_rgba(244,114,182,0.25)]',
      chip: 'bg-rose-400/15 text-rose-100 border-rose-300/20',
    },
    rounds: [
      {
        prompt: 'The top strip holds the site logo, a search field, and the main navigation.',
        context: 'The team currently wrapped all of it in a plain `div`.',
        choices: [
          { label: '<header>', description: 'Groups the introductory area and top navigation for the page.' },
          { label: '<section>', description: 'Creates a generic grouped area, but does not describe the page-level role.' },
          { label: '<aside>', description: 'Works better for supporting content that is not the main page introduction.' },
        ],
        answer: '<header>',
        insight: 'A header communicates that the content introduces the page and often contains top-level navigation.',
        celebration: 'The page instantly feels easier to scan.',
      },
      {
        prompt: 'A block contains the article title, the main story paragraphs, and one embedded image.',
        context: 'It is the central content people came to read.',
        choices: [
          { label: '<main>', description: 'Represents the primary content area of the page.' },
          { label: '<footer>', description: 'Better for closing content, contact details, or meta information.' },
          { label: '<nav>', description: 'Intended for navigation links, not the core reading experience.' },
        ],
        answer: '<main>',
        insight: 'Use `main` for the page’s dominant content so structure reflects what matters most.',
        celebration: 'You centered the page around the real story.',
      },
      {
        prompt: 'A sidebar shows related resources, quick tips, and a short author note.',
        context: 'It supports the main content but is not the main learning path.',
        choices: [
          { label: '<aside>', description: 'Ideal for supporting content that sits alongside the main flow.' },
          { label: '<article>', description: 'Better for self-contained standalone content.' },
          { label: '<main>', description: 'Too strong for content that only supports the main page.' },
        ],
        answer: '<aside>',
        insight: 'An aside is perfect when content adds context without being the primary focus.',
        celebration: 'Supporting content now has the right voice instead of fighting the page.',
      },
      {
        prompt: 'The bottom area shows social links, copyright text, and a short contact line.',
        context: 'The design is polished, but the HTML is still a generic wrapper.',
        choices: [
          { label: '<footer>', description: 'Marks the closing support area for the page or section.' },
          { label: '<section>', description: 'Too generic for a well-known closing page pattern.' },
          { label: '<main>', description: 'Should be reserved for primary page content.' },
        ],
        answer: '<footer>',
        insight: 'Footer helps teammates and assistive tools understand that the content closes out the page.',
        celebration: 'Clean finish. The document now tells a clearer story.',
      },
    ],
  },
  {
    lessonSlug: 'frontend-development-foundations-css-grid-two-dimensional-layouts',
    lessonTitle: 'Use CSS Grid for two-dimensional layouts',
    kind: 'grid',
    arcadeLabel: 'Grid Choreographer',
    title: 'Layout Star Studio',
    subtitle: 'Pick the layout composition that actually fits the screen goal.',
    story:
      'You are art directing a creator dashboard. Each level shows a screen goal and three possible grid patterns. Choose the arrangement that uses rows and columns with intention.',
    rewardTitle: 'Grid Choreographer unlocked',
    rewardDescription: 'You can see two-dimensional layout structure before writing the CSS.',
    palette: {
      from: 'from-cyan-500/25',
      via: 'via-sky-500/15',
      to: 'to-emerald-400/20',
      glow: 'shadow-[0_0_60px_rgba(34,211,238,0.22)]',
      chip: 'bg-cyan-400/15 text-cyan-100 border-cyan-300/20',
    },
    rounds: [
      {
        prompt: 'A dashboard needs a wide analytics panel on top and three equal cards underneath.',
        context: 'Both rows and columns matter here, not just horizontal alignment.',
        hint: 'Look for a layout that gives the hero panel full width before splitting into smaller cards.',
        options: [
          {
            id: 'hero-top',
            label: 'Hero top + card trio',
            note: 'Top panel spans the full row, cards share the next row.',
            placements: [
              { label: 'Analytics', row: 1, col: 1, colSpan: 3, tone: 'bg-cyan-400/80' },
              { label: 'Tasks', row: 2, col: 1, tone: 'bg-fuchsia-400/80' },
              { label: 'Goals', row: 2, col: 2, tone: 'bg-amber-400/80' },
              { label: 'Notes', row: 2, col: 3, tone: 'bg-emerald-400/80' },
            ],
          },
          {
            id: 'vertical-stack',
            label: 'Single column stack',
            note: 'Everything falls into one long column.',
            placements: [
              { label: 'Analytics', row: 1, col: 1, tone: 'bg-cyan-400/80' },
              { label: 'Tasks', row: 2, col: 1, tone: 'bg-fuchsia-400/80' },
              { label: 'Goals', row: 3, col: 1, tone: 'bg-amber-400/80' },
              { label: 'Notes', row: 4, col: 1, tone: 'bg-emerald-400/80' },
            ],
          },
          {
            id: 'two-two',
            label: 'Two by two block',
            note: 'Makes the hero panel lose its importance.',
            placements: [
              { label: 'Analytics', row: 1, col: 1, tone: 'bg-cyan-400/80' },
              { label: 'Tasks', row: 1, col: 2, tone: 'bg-fuchsia-400/80' },
              { label: 'Goals', row: 2, col: 1, tone: 'bg-amber-400/80' },
              { label: 'Notes', row: 2, col: 2, tone: 'bg-emerald-400/80' },
            ],
          },
        ],
        answer: 'hero-top',
        insight: 'Grid shines when you need a wide area plus smaller supporting panels in the same composition.',
        celebration: 'That screen now has rhythm instead of random boxes.',
      },
      {
        prompt: 'A gallery page needs one featured card next to a neat column of smaller updates.',
        context: 'The featured content should feel important, but the side cards still need clear structure.',
        hint: 'A strong answer lets the feature occupy more than one row.',
        options: [
          {
            id: 'feature-column',
            label: 'Feature with stacked updates',
            note: 'The feature spans two rows while updates stack beside it.',
            placements: [
              { label: 'Feature', row: 1, col: 1, rowSpan: 2, tone: 'bg-cyan-400/80' },
              { label: 'Update', row: 1, col: 2, tone: 'bg-fuchsia-400/80' },
              { label: 'Update', row: 2, col: 2, tone: 'bg-amber-400/80' },
            ],
          },
          {
            id: 'equal-cards',
            label: 'Equal card wall',
            note: 'Useful for parity, but does not highlight the feature.',
            placements: [
              { label: 'Feature', row: 1, col: 1, tone: 'bg-cyan-400/80' },
              { label: 'Update', row: 1, col: 2, tone: 'bg-fuchsia-400/80' },
              { label: 'Update', row: 2, col: 1, tone: 'bg-amber-400/80' },
            ],
          },
          {
            id: 'one-row',
            label: 'One long row',
            note: 'Turns the whole thing into a strip instead of a composition.',
            placements: [
              { label: 'Feature', row: 1, col: 1, tone: 'bg-cyan-400/80' },
              { label: 'Update', row: 1, col: 2, tone: 'bg-fuchsia-400/80' },
              { label: 'Update', row: 1, col: 3, tone: 'bg-amber-400/80' },
            ],
          },
        ],
        answer: 'feature-column',
        insight: 'Letting one card span rows is one of the clearest signs that Grid is solving a two-dimensional problem.',
        celebration: 'Feature energy restored.',
      },
      {
        prompt: 'A planner needs four equal habit cards in a tidy matrix with even spacing.',
        context: 'Nothing is meant to dominate. The goal is clean balance.',
        hint: 'This is a classic small matrix problem.',
        options: [
          {
            id: 'balanced-matrix',
            label: 'Balanced 2x2 matrix',
            note: 'Each card shares equal space in both directions.',
            placements: [
              { label: 'Read', row: 1, col: 1, tone: 'bg-cyan-400/80' },
              { label: 'Code', row: 1, col: 2, tone: 'bg-fuchsia-400/80' },
              { label: 'Stretch', row: 2, col: 1, tone: 'bg-amber-400/80' },
              { label: 'Rest', row: 2, col: 2, tone: 'bg-emerald-400/80' },
            ],
          },
          {
            id: 'hero-emphasis',
            label: 'Oversized hero card',
            note: 'Adds hierarchy that the brief did not ask for.',
            placements: [
              { label: 'Read', row: 1, col: 1, colSpan: 2, tone: 'bg-cyan-400/80' },
              { label: 'Code', row: 2, col: 1, tone: 'bg-fuchsia-400/80' },
              { label: 'Stretch', row: 2, col: 2, tone: 'bg-amber-400/80' },
              { label: 'Rest', row: 3, col: 1, colSpan: 2, tone: 'bg-emerald-400/80' },
            ],
          },
          {
            id: 'staggered',
            label: 'Staggered collage',
            note: 'Interesting, but too irregular for this goal.',
            placements: [
              { label: 'Read', row: 1, col: 1, tone: 'bg-cyan-400/80' },
              { label: 'Code', row: 1, col: 2, tone: 'bg-fuchsia-400/80' },
              { label: 'Stretch', row: 2, col: 2, tone: 'bg-amber-400/80' },
              { label: 'Rest', row: 3, col: 1, tone: 'bg-emerald-400/80' },
            ],
          },
        ],
        answer: 'balanced-matrix',
        insight: 'When every card has equal importance, Grid gives you calm, visible structure fast.',
        celebration: 'Balanced, tidy, and instantly readable.',
      },
    ],
  },
  {
    lessonSlug: 'frontend-development-foundations-hover-focus-success-error-states',
    lessonTitle: 'Style hover, focus, success, and error states',
    kind: 'states',
    arcadeLabel: 'Feedback Stylist',
    title: 'UI Mood Runway',
    subtitle: 'Match each interface moment with the clearest visual state.',
    story:
      'You are styling a polished app for real learners. Each scene needs a state that guides someone clearly, not just something that looks pretty.',
    rewardTitle: 'Feedback Stylist unlocked',
    rewardDescription: 'You can make interface states feel supportive, visible, and consistent.',
    palette: {
      from: 'from-violet-500/25',
      via: 'via-indigo-500/15',
      to: 'to-pink-400/20',
      glow: 'shadow-[0_0_60px_rgba(168,85,247,0.22)]',
      chip: 'bg-violet-400/15 text-violet-100 border-violet-300/20',
    },
    rounds: [
      {
        scenario: 'A learner tabs onto an email field using the keyboard.',
        targetState: 'Focus',
        context: 'They need to know exactly where they are before typing.',
        options: [
          { id: 'focus-ring', label: 'Add a strong outline or glow ring', styleNote: 'Visible, calm, and easy to notice.' },
          { id: 'hover-only', label: 'Only lighten the background on mouse hover', styleNote: 'Looks subtle, but disappears for keyboard users.' },
          { id: 'shake', label: 'Shake the field immediately', styleNote: 'Creates anxiety without communicating position.' },
        ],
        answer: 'focus-ring',
        insight: 'Focus styles should help the learner orient themselves, especially without a mouse.',
        celebration: 'Keyboard users just got a much smoother experience.',
      },
      {
        scenario: 'A save button is clickable and the user moves a cursor over it.',
        targetState: 'Hover',
        context: 'The button should feel interactive before it is clicked.',
        options: [
          { id: 'gentle-hover', label: 'Shift color and shadow slightly on hover', styleNote: 'Shows affordance without shouting.' },
          { id: 'no-change', label: 'Leave it visually identical', styleNote: 'Makes interactivity harder to sense.' },
          { id: 'error-red', label: 'Turn it bright red on hover', styleNote: 'Suggests danger when nothing is wrong.' },
        ],
        answer: 'gentle-hover',
        insight: 'Hover is a cue for interactivity, not a reason to change the button’s meaning.',
        celebration: 'That button now feels alive and trustworthy.',
      },
      {
        scenario: 'A profile form submits correctly and the update succeeds.',
        targetState: 'Success',
        context: 'The user should feel confident that the action worked.',
        options: [
          { id: 'success-banner', label: 'Show a calm success message with supportive color', styleNote: 'Confirms the result and closes the loop.' },
          { id: 'silent', label: 'Do nothing after submit', styleNote: 'Leaves people guessing whether it saved.' },
          { id: 'huge-modal', label: 'Open a blocking modal for a tiny success', styleNote: 'Too much interruption for routine feedback.' },
        ],
        answer: 'success-banner',
        insight: 'Success states should confirm clearly without derailing the user.',
        celebration: 'Feedback landed exactly where it needed to.',
      },
      {
        scenario: 'The password field is missing a required rule.',
        targetState: 'Error',
        context: 'The learner needs direction, not punishment.',
        options: [
          { id: 'error-help', label: 'Show a clear message near the field with a visible error style', styleNote: 'Tells the user what to fix.' },
          { id: 'all-caps', label: 'Display “INVALID” in all caps only', styleNote: 'Adds heat, not clarity.' },
          { id: 'hidden-error', label: 'Store the error only in the console', styleNote: 'Invisible to the person who needs help.' },
        ],
        answer: 'error-help',
        insight: 'The best error states are visible, specific, and easy to recover from.',
        celebration: 'That form now feels helpful instead of harsh.',
      },
    ],
  },
  {
    lessonSlug: 'frontend-development-foundations-array-methods-transform-interface-data',
    lessonTitle: 'Use array methods to transform interface data',
    kind: 'array',
    arcadeLabel: 'Data DJ',
    title: 'Data Remix Club',
    subtitle: 'Choose the transformation combo that produces the target UI output.',
    story:
      'You are remixing raw interface data into polished lists for a trend board. Each round starts messy and ends with the exact UI-ready result you need.',
    rewardTitle: 'Data DJ unlocked',
    rewardDescription: 'You know how to shape data before rendering instead of mixing logic everywhere.',
    palette: {
      from: 'from-amber-500/25',
      via: 'via-orange-500/15',
      to: 'to-pink-400/20',
      glow: 'shadow-[0_0_60px_rgba(251,191,36,0.22)]',
      chip: 'bg-amber-400/15 text-amber-100 border-amber-300/20',
    },
    rounds: [
      {
        prompt: 'The UI should show only the learners who are active this week.',
        input: ['Mina active', 'Joy paused', 'Ada active', 'Lulu paused'],
        target: ['Mina active', 'Ada active'],
        options: [
          { id: 'filter-active', label: 'Use `filter()` for active learners', explanation: 'Keeps only the items that match the active condition.' },
          { id: 'map-labels', label: 'Use `map()` to rename every learner', explanation: 'Changes each item but does not remove paused ones.' },
          { id: 'find-first', label: 'Use `find()` to get one active learner', explanation: 'Only returns a single match, not the whole list.' },
        ],
        answer: 'filter-active',
        insight: 'Filter is the right first move when the target UI needs fewer records than the original array.',
        celebration: 'Clean list. No extra noise.',
      },
      {
        prompt: 'The UI needs card labels like “MINA - 87%” from profile objects.',
        input: ['Mina, 87', 'Joy, 74', 'Ada, 92'],
        target: ['MINA - 87%', 'JOY - 74%', 'ADA - 92%'],
        options: [
          { id: 'map-format', label: 'Use `map()` to format each record', explanation: 'Transforms every record into the display string the UI wants.' },
          { id: 'filter-high', label: 'Use `filter()` for scores above 80', explanation: 'Would remove some items instead of formatting them all.' },
          { id: 'sort-score', label: 'Use `sort()` by score first', explanation: 'Sorting changes order, not shape.' },
        ],
        answer: 'map-format',
        insight: 'Map is your go-to when every item stays, but the display shape changes.',
        celebration: 'The list now looks like a real UI payload.',
      },
      {
        prompt: 'The target feed should show top scorers only, then format them as badges.',
        input: ['Mina 87', 'Joy 74', 'Ada 92', 'Lulu 69'],
        target: ['Mina star', 'Ada star'],
        options: [
          { id: 'filter-then-map', label: '`filter()` high scorers, then `map()` badge labels', explanation: 'First reduce the list, then format what remains.' },
          { id: 'map-then-find', label: '`map()` all labels, then `find()` a top scorer', explanation: 'Would only return one result after over-formatting.' },
          { id: 'sort-then-filter', label: '`sort()` all learners, then `filter()` later', explanation: 'Possible, but adds an unnecessary step for this output.' },
        ],
        answer: 'filter-then-map',
        insight: 'When the UI needs fewer records and a new shape, filter before map is often the cleanest path.',
        celebration: 'That transformation chain is sharp.',
      },
    ],
  },
  {
    lessonSlug: 'frontend-development-foundations-fetch-data-with-ui-states',
    lessonTitle: 'Fetch data and show loading, success, and error states',
    kind: 'async',
    arcadeLabel: 'Signal Captain',
    title: 'Signal Rescue Mission',
    subtitle: 'Build the right UI state sequence for each async moment.',
    story:
      'You are keeping a live app calm while data travels through the network. Choose the sequence that makes the experience feel understandable from the first click to the final result.',
    rewardTitle: 'Signal Captain unlocked',
    rewardDescription: 'You can turn async work into visible, reassuring interface states.',
    palette: {
      from: 'from-emerald-500/25',
      via: 'via-teal-500/15',
      to: 'to-sky-400/20',
      glow: 'shadow-[0_0_60px_rgba(16,185,129,0.22)]',
      chip: 'bg-emerald-400/15 text-emerald-100 border-emerald-300/20',
    },
    rounds: [
      {
        scenario: 'A learner opens a lesson dashboard and the app starts fetching recent activity.',
        goal: 'Show progress first, then the real data once it arrives.',
        availableSteps: ['Loading state', 'Success state', 'Idle state', 'Error state'],
        answer: ['Idle state', 'Loading state', 'Success state'],
        insight: 'The calm pattern is idle before action, loading during the request, and success once data is ready.',
        celebration: 'Smooth async storytelling.',
      },
      {
        scenario: 'A retry request fails because the connection drops.',
        goal: 'Let the learner know what happened and make recovery obvious.',
        availableSteps: ['Success state', 'Retry action', 'Loading state', 'Error state'],
        answer: ['Loading state', 'Error state', 'Retry action'],
        insight: 'Error should follow the failed request, and a retry should give the user a next step instead of a dead end.',
        celebration: 'That flow feels kind and competent.',
      },
      {
        scenario: 'A profile card loads correctly after a slow request.',
        goal: 'Avoid jumping straight from nothing to content with no explanation.',
        availableSteps: ['Loading state', 'Success state', 'Hidden console log', 'Idle state'],
        answer: ['Idle state', 'Loading state', 'Success state'],
        insight: 'Visible loading feedback keeps the interface feeling alive while the request is in flight.',
        celebration: 'The UI stayed clear the whole way through.',
      },
    ],
  },
];

export function getLessonGameDefinition(lessonSlug?: string | null): LessonGameDefinition | null {
  if (!lessonSlug) {
    return null;
  }

  return FRONTEND_FOUNDATIONS_GAMES.find((game) => game.lessonSlug === lessonSlug) || null;
}
