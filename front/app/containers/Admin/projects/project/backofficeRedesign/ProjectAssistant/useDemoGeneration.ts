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

// The demo's result mirrors the real engine's manager-facing briefing
// (ai_generation_summary): a headline + pedagogical "why" highlights in the
// participation-expert voice, plus the concrete plan and access. DraftReview
// renders this with exactly the same layout it uses for a live draft.
export type DemoReport = {
  headline: string;
  highlights: string[];
  steps: string[];
  visibility: string;
};

// prototype data — a plausible result for a "we decide together / rough
// direction" consultation brief, written as the participation expert would
// explain it: no internal terms, each line teaches why the choice was made.
const REPORT: DemoReport = {
  headline:
    'I’ve set this up as a two-way consultation: you gather structured input first, then close the loop by showing residents what you heard and what it changed.',
  highlights: [
    'Across thousands of engagement projects, the biggest driver of trust isn’t the survey itself — it’s whether people see what happened to their input. That’s why I ended with a “what we heard” phase, not the survey.',
    'I led with a focused survey rather than open idea-collection: your brief points to a decision you’ve already largely framed, so structured questions give you input you can actually compare and act on.',
    'The survey stays short and mostly multiple-choice, with two open questions at the end — completion drops sharply past ~8 questions, and free text is far costlier to make sense of at scale.',
    'I kept it open to anyone with no sign-up wall: a registration barrier is the most common reason first-time participation stalls. You can always tighten access to verified residents later if you need to.',
  ],
  steps: ['Survey (14 days)', 'Review input (7 days)', 'Share what we heard'],
  visibility: 'anyone who visits',
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
