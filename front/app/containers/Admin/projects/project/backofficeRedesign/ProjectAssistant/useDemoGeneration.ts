import { useEffect, useRef, useState } from 'react';

// prototype data — staging has no generation engine behind the button, so this
// hook plays a realistic generation sequence (progress steps, then a result
// report) purely on the front end, to review the UI of the whole flow.

export type DemoStatus = 'idle' | 'running' | 'done';

export const DEMO_STEPS = [
  'Reading your brief',
  'Choosing the right approach',
  'Writing the project page',
  'Designing the survey',
  'Setting phases, dates & access',
  'Running the quality check',
];

const STEP_MS = 1150;

export type DemoArtifact = {
  icon: 'sidebar-pages-menu' | 'calendar' | 'survey-matrix' | 'lock';
  title: string;
  detail: string;
};

export type DemoNextStep = {
  icon: 'edit' | 'survey-matrix' | 'calendar' | 'lock';
  title: string;
  detail: string;
};

export type DemoReport = {
  archetype: string;
  rationale: string;
  artifacts: DemoArtifact[];
  surveyScore: number;
  surveyNote: string;
  nextSteps: DemoNextStep[];
};

// prototype data — a plausible result for a "we decide together / rough
// direction" consultation brief.
const REPORT: DemoReport = {
  archetype: 'Consultation',
  rationale:
    'You chose “we decide together” on a rough direction, so I led with a survey to gather structured input, then a short phase to review it and share back what you heard — closing the loop with residents.',
  artifacts: [
    {
      icon: 'sidebar-pages-menu',
      title: 'Project page',
      detail: 'Intro, the context, and a clear “what happens next”.',
    },
    {
      icon: 'calendar',
      title: '3 phases',
      detail: 'Survey (2 weeks) → Review input (1 week) → Share what we heard.',
    },
    {
      icon: 'survey-matrix',
      title: 'Survey with 8 questions',
      detail: 'A mix of multiple-choice and two open questions.',
    },
    {
      icon: 'lock',
      title: 'Access',
      detail: 'Open to all residents, no registration wall.',
    },
  ],
  surveyScore: 86,
  surveyNote:
    'Strong on clarity and neutral wording. Consider shortening question 5 and adding one demographic question.',
  nextSteps: [
    {
      icon: 'edit',
      title: 'Polish the project page',
      detail: 'Tweak the intro and add your own image.',
    },
    {
      icon: 'survey-matrix',
      title: 'Review the 8 survey questions',
      detail: 'Edit wording or reorder in the survey builder.',
    },
    {
      icon: 'calendar',
      title: 'Confirm the phase dates',
      detail: 'I used sensible defaults — set the real start and end.',
    },
    {
      icon: 'lock',
      title: 'Check who can participate',
      detail: 'Open it up further or restrict to a group.',
    },
  ],
};

const useDemoGeneration = () => {
  const [status, setStatus] = useState<DemoStatus>('idle');
  const [activeIndex, setActiveIndex] = useState(0);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const start = () => {
    clear();
    setStatus('running');
    setActiveIndex(0);
    DEMO_STEPS.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setActiveIndex(i + 1), STEP_MS * (i + 1))
      );
    });
    timers.current.push(
      window.setTimeout(
        () => setStatus('done'),
        STEP_MS * DEMO_STEPS.length + 500
      )
    );
  };

  const reset = () => {
    clear();
    setStatus('idle');
    setActiveIndex(0);
  };

  useEffect(() => () => clear(), []);

  return { status, steps: DEMO_STEPS, activeIndex, report: REPORT, start, reset };
};

export default useDemoGeneration;
