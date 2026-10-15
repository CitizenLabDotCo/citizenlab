import { IconNames } from '@citizenlab/cl2-component-library';

// prototype data — the whole assistant modal plays one scripted scenario
// ("Reimagining Mercier Street"), so the create flow always reads the same
// polished way for a demo. The generation mechanics are unchanged; this file is
// just the copy and the shape of the draft the review pane renders. A developer
// rebuilding this for real would swap these constants for the engine's output.

export const INTRO =
  'Describe the project you have in mind, or attach a concept note or plan. I will ask one question and draft it for you.';

// The example brief, shown as the manager's own first message once they send.
export const EXAMPLE_BRIEF =
  "We're redesigning Mercier Street to give more space to pedestrians and cyclists. We want residents' ideas first, then weigh the trade-offs, before council decides.";

// The single clarifying question the assistant asks before drafting. One
// question, not a form — the one answer that most changes the draft.
export const QUESTION = {
  lead: 'Got it. One question before I draft, so the draft lands closer to what you want.',
  title: 'How much influence will residents really have?',
  help: 'This sets the honest promise on the page and the phase recipe. Overstating it is the fastest way to lose trust.',
  options: [
    { id: 'consult', label: 'Consult', sub: 'Gather input, the city decides' },
    { id: 'involve', label: 'Involve', sub: 'Residents shape the design' },
    {
      id: 'collaborate',
      label: 'Collaborate',
      sub: 'Co-design together',
      suggested: true,
    },
    { id: 'empower', label: 'Empower', sub: 'Residents decide' },
  ],
};

// The drafting checklist. Each step ticks over in turn, then the whole thing
// settles as "done" when the draft appears on the right.
export const DRAFTING_STEPS = [
  'Reading your brief',
  'Choosing the participation approach',
  'Planning 3 phases and their methods',
  'Writing the project page and 6 survey questions',
  'Generating a project image',
  'Adding a spotlight survey',
  'Running the quality checks',
];

// How long each step holds. Slow enough to read; the questionnaire step sits a
// touch longer because it's the one people want to watch.
export const STEP_MS = 1400;

// "Here is what I did" — the plain-language recap under the checklist.
export const WHAT_I_DID = [
  'Wrote the project page, topic tags and area',
  'Generated a project image',
  'Planned 3 phases: map input, survey, information',
  'Wrote 6 survey questions',
  'Added a spotlight survey',
];

// The follow-up prompt + one-tap suggestions for the review step.
export const REVIEW_PROMPT =
  'Read the draft on the right. Is there anything you would like to change?';

export type Suggestion = {
  id: string;
  label: string;
  // The assistant's scripted reply when this change is applied.
  reply: string;
};

export const SUGGESTIONS: Suggestion[] = [
  {
    id: 'map-more-time',
    label: 'Give the map phase more time',
    reply:
      'Done. The map phase now runs 6 weeks, and the rest of the timeline moves with it.',
  },
  {
    id: 'shorter-title',
    label: 'Make the title shorter',
    reply: 'Done. The title is now “Mercier Street”.',
  },
];

// ---- The draft itself, as the review pane renders it ----

export const DRAFT_TITLE = 'Reimagining Mercier Street';

export const DRAFT_DESCRIPTION =
  'More room for walking, cycling and greenery on Mercier Street. Nothing is fixed yet: residents shape the redesign before council decides.';

export const DRAFT_AREA = 'Old Town';

export const DRAFT_TAGS = ['Mobility', 'Streetscape', 'Green spaces'];

export type DraftQuestion = { label: string; type: string };

export const SURVEY_QUESTIONS: DraftQuestion[] = [
  { label: 'How often do you use Mercier Street?', type: 'Single choice' },
  {
    label: 'How do you usually travel along Mercier Street? Select up to two.',
    type: 'Multiple choice',
  },
  {
    label: 'Rank these priorities for the redesign, from most to least important',
    type: 'Ranking',
  },
  {
    label: 'How much do you support reducing car through-traffic on Mercier Street?',
    type: 'Linear scale',
  },
  {
    label: 'Where would you most like to see greenery or seating added?',
    type: 'Short answer',
  },
  {
    label: 'Anything else the design team should keep in mind?',
    type: 'Long answer',
  },
];

export type DraftPhase = {
  icon: IconNames;
  title: string;
  method: string;
  dates: string;
  description: string;
  // Where the phase sits on the mini Nov–Jan gantt (percentages of the track).
  barLeft: string;
  barWidth: string;
  questions?: DraftQuestion[];
};

export const TIMELINE_PHASES: DraftPhase[] = [
  {
    icon: 'map',
    title: 'Map what should change on Mercier Street',
    method: 'Map input',
    dates: '22 October – 18 November',
    description: 'Residents drop a pin where something should change and describe it.',
    barLeft: '0%',
    barWidth: '34%',
  },
  {
    icon: 'survey',
    title: 'Weigh in on the design trade-offs',
    method: 'Survey',
    dates: '21 November – 11 December',
    description: 'A short survey turns the map ideas into concrete choices.',
    barLeft: '38%',
    barWidth: '30%',
    questions: SURVEY_QUESTIONS,
  },
  {
    icon: 'info-outline',
    title: 'What we heard and what happens next',
    method: 'Information',
    dates: '14 December – 27 December',
    description: 'A summary of the ideas and results, and how they shaped the design.',
    barLeft: '72%',
    barWidth: '22%',
  },
];

export const SPOTLIGHT_PHASE: DraftPhase = {
  icon: 'survey',
  title: 'Mercier Street today',
  method: 'Survey',
  dates: '22 October – 23 December',
  description:
    'A two minute pulse on how people use the street now, open the whole time. It runs beside the timeline.',
  barLeft: '0%',
  barWidth: '94%',
};

export const TIMELINE_MONTHS = ['Nov', 'Dec'];
