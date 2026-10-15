import React, { useEffect, useState } from 'react';

import { Box, Icon, Spinner, Text, colors } from '@citizenlab/cl2-component-library';

// The drafting checklist, driven by the REAL generation job's elapsed time. Each
// step ticks over on a schedule; the last step holds (spinner) until the backend
// job actually completes and the parent switches to the review — so a variable
// ~30–90s run never looks like it finished early. The narration leads with the
// proprietary intelligence (the evidence base, the lookup of comparable
// consultations) so the wait reads as expert work, brought over from the
// original project-generation prototype.

type Step = { at: number; label: string };

// `at` is the elapsed-second mark where the step becomes active. Spaced ~6s so
// the narration doesn't clump; the final step sits and waits for completion.
const STEPS: Step[] = [
  { at: 0, label: 'Reading your brief' },
  { at: 6, label: 'Drawing on 10 years and 20,000+ consultations of what works' },
  { at: 12, label: 'Looking for high-quality projects similar to yours' },
  { at: 18, label: 'Identifying the patterns that made them work' },
  { at: 24, label: 'Choosing the right participation method for your goal' },
  { at: 30, label: 'Drafting the project page — intro, context and the ask' },
  { at: 37, label: 'Writing the questionnaire' },
  { at: 44, label: 'Checking the questions for clarity and bias' },
  { at: 51, label: 'Setting phases, dates & access' },
  { at: 58, label: 'Running the quality checks' },
];

const secondsSince = (startedAt: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));

const activeIndex = (seconds: number) => {
  let index = 0;
  STEPS.forEach((step, i) => {
    if (seconds >= step.at) index = i;
  });
  return index;
};

const Row = ({ label, state }: { label: string; state: 'done' | 'active' | 'todo' }) => (
  <Box display="flex" alignItems="center" gap="12px">
    <Box flex="0 0 auto" width="22px" height="22px" display="flex" alignItems="center" justifyContent="center">
      {state === 'done' ? (
        <Icon name="check-circle" width="22px" height="22px" fill={colors.teal500} />
      ) : state === 'active' ? (
        <Spinner size="20px" />
      ) : (
        <Box width="18px" height="18px" borderRadius="50%" border={`2px solid ${colors.grey300}`} />
      )}
    </Box>
    <Text m="0px" color={state === 'todo' ? 'textSecondary' : 'textPrimary'} lineHeight="1.4">
      {label}
    </Text>
  </Box>
);

type Props = {
  startedAt: string;
  // When true (job finished), every step shows as done.
  done?: boolean;
};

const DraftingProgress = ({ startedAt, done }: Props) => {
  const [seconds, setSeconds] = useState(() => secondsSince(startedAt));

  useEffect(() => {
    const interval = setInterval(() => setSeconds(secondsSince(startedAt)), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const active = done ? STEPS.length : activeIndex(seconds);

  return (
    <Box border={`1px solid ${colors.grey300}`} borderRadius="14px" p="20px">
      <Text m="0 0 16px" fontWeight="bold" fontSize="l" color="textPrimary">
        Drafting your project
      </Text>
      <Box display="flex" flexDirection="column" gap="14px">
        {STEPS.map((step, i) => (
          <Row
            key={step.label}
            label={step.label}
            state={i < active ? 'done' : i === active ? 'active' : 'todo'}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DraftingProgress;
