import { GeneratedDraft, Lever } from './types';

// prototype data — the project the assistant "generates". In the real feature
// this comes back from the LLM as structured JSON; here it's canned so we can
// react to the flow and the preview.
export const SAMPLE_DRAFT: GeneratedDraft = {
  title: 'Safer cycling routes to school',
  tagline:
    'Help us redesign the streets so children can bike to school safely',
  description:
    'Too many children are driven to school because the routes feel unsafe. We want your local knowledge: which crossings, junctions and streets make you worry, and what would make them better. Your input shapes the improvements we fund in the 2027 mobility budget.',
  goal: 'Collect residents’ local knowledge of unsafe routes and co-design improvements before the 2027 budget is set.',
  phases: [
    {
      title: 'Gather local knowledge',
      method: 'Idea collection',
      icon: 'idea',
      duration: '3 weeks',
      description:
        'Residents drop pins on the crossings and streets that feel unsafe, and describe why.',
    },
    {
      title: 'Understand the journeys',
      method: 'Survey',
      icon: 'survey',
      duration: '2 weeks',
      description:
        'A short survey on how and when children travel to school today.',
    },
    {
      title: 'Prioritise the fixes',
      method: 'Voting',
      icon: 'vote-ballot',
      duration: '2 weeks',
      description:
        'Residents vote on which route improvements should be funded first.',
    },
  ],
  survey: [
    {
      title: 'Which route does your child take to school?',
      type: 'Point on a map',
      icon: 'location-simple',
    },
    {
      title: 'What makes that route feel unsafe?',
      type: 'Multiple choice',
      icon: 'survey-multiple-choice',
    },
    {
      title: 'How often does your child cycle to school?',
      type: 'Single choice',
      icon: 'survey-single-choice',
    },
    {
      title: 'What one change would help the most?',
      type: 'Open answer',
      icon: 'survey-long-answer',
    },
  ],
};

export const LEVERS: Lever[] = [
  {
    id: 'influence',
    question: 'How much influence will residents have?',
    options: ['We gather input', 'We decide together', 'Residents decide'],
  },
  {
    id: 'howFixed',
    question: 'How fixed is the plan already?',
    options: ['Early exploration', 'A rough direction', 'Mostly decided'],
  },
  {
    id: 'reach',
    question: 'What matters more here?',
    options: ['Many quick voices', 'A balance', 'Fewer, in depth'],
  },
  {
    id: 'audience',
    question: 'Who is this open to?',
    options: ['Everyone', 'Residents only', 'An invited group'],
  },
];
