import React, { useEffect, useState } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Spinner,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

type Props = {
  startedAt: string;
};

// Each stage narrates a slice of what the generator is doing. It leads with the
// proprietary intelligence — the evidence base and the lookup of comparable
// consultations — before the drafting steps, so the wait reads as expert work.
// The copy stays generic on the method on purpose: this loader cannot know
// whether the drafted project ends up with a survey, so it never promises one.
//
// `start` is the elapsed-second mark at which a stage becomes the active one.
// The marks are spaced roughly evenly (~7s apart) so the narration doesn't
// clump at the front and then jump to "done". Real generation is variable
// (~30–90s); the last stage is a graceful hold that can sit without feeling
// stuck until the backend job actually completes (handled outside this
// component) and the project appears.
type Stage = {
  start: number;
  label: string;
  icon: IconNames;
  fill: string;
  bg: string;
};

const STAGES: Stage[] = [
  {
    start: 0,
    label: 'Reading your brief',
    icon: 'book',
    fill: colors.teal500,
    bg: colors.teal50,
  },
  {
    start: 7,
    label: 'Drawing on 10 years and 20,000+ consultations',
    icon: 'stars',
    fill: colors.teal700,
    bg: colors.teal100,
  },
  {
    start: 15,
    label: 'Looking for high-quality projects similar to yours',
    icon: 'search',
    fill: colors.blue500,
    bg: colors.blue10,
  },
  {
    start: 24,
    label: 'Identifying the patterns that made them work',
    icon: 'idea',
    fill: colors.teal400,
    bg: colors.teal100,
  },
  {
    start: 33,
    label: 'Choosing the right participation method',
    icon: 'bullseye',
    fill: colors.blue500,
    bg: colors.blue10,
  },
  {
    start: 42,
    label: 'Drafting the project page',
    icon: 'page',
    fill: colors.teal500,
    bg: colors.teal50,
  },
  {
    start: 51,
    label: 'Writing the questionnaire',
    icon: 'list',
    fill: colors.teal700,
    bg: colors.teal100,
  },
  {
    start: 62,
    label: 'Checking the questions for clarity and bias',
    icon: 'eye',
    fill: colors.blue500,
    bg: colors.blue10,
  },
  {
    start: 72,
    label: 'Setting up phases, dates & access',
    icon: 'timeline',
    fill: colors.teal400,
    bg: colors.teal100,
  },
  {
    start: 81,
    label: 'Adding the finishing touches',
    icon: 'check-circle',
    fill: colors.green600,
    bg: colors.green100,
  },
];

const secondsSince = (startedAt: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));

const activeStageIndex = (seconds: number) => {
  let index = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (seconds >= STAGES[i].start) index = i;
  }
  return index;
};

// Eases toward — but never reaches — 100%. The asymptote keeps the bar always
// nudging forward during a variable-length job, so the final jump to a finished
// project never looks like the bar "completed" early.
const progressPercent = (seconds: number) => {
  const eased = 1 - Math.exp(-seconds / 36);
  return Math.min(96, Math.round(eased * 96));
};

const WorkingIndicator = ({ startedAt }: Props) => {
  const [seconds, setSeconds] = useState(() => secondsSince(startedAt));

  useEffect(() => {
    const interval = setInterval(
      () => setSeconds(secondsSince(startedAt)),
      1000
    );
    return () => clearInterval(interval);
  }, [startedAt]);

  const index = activeStageIndex(seconds);
  const stage = STAGES[index];
  const isLastStage = index === STAGES.length - 1;
  const progress = progressPercent(seconds);

  return (
    <Box
      role="status"
      display="flex"
      flexDirection="column"
      gap="12px"
      p="16px"
      bgColor={colors.white}
      border={`1px solid ${colors.borderLight}`}
      borderRadius={stylingConsts.borderRadius}
    >
      <Box display="flex" alignItems="center" gap="12px">
        <Box
          flexShrink="0"
          width="36px"
          height="36px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="50%"
          bgColor={stage.bg}
          style={{ transition: 'background-color 400ms ease' }}
        >
          <Icon
            name={stage.icon}
            width="20px"
            height="20px"
            fill={stage.fill}
            my="0px"
          />
        </Box>

        <Box flex="1" minWidth="0">
          <Box display="flex" alignItems="center" gap="8px">
            <Text m="0px" fontWeight="semi-bold" color="textPrimary">
              {stage.label}
            </Text>
            <Spinner size="16px" />
          </Box>
          <Text m="0px" mt="2px" fontSize="s" color="textSecondary">
            {isLastStage
              ? `Almost there — putting it all together · ${seconds}s`
              : `Working on your project · ${seconds}s elapsed`}
          </Text>
        </Box>
      </Box>

      {/* Thin, continuously-easing progress affordance. */}
      <Box
        width="100%"
        height="4px"
        borderRadius="2px"
        bgColor={colors.grey200}
        overflow="hidden"
      >
        <Box
          height="100%"
          borderRadius="2px"
          bgColor={colors.teal500}
          style={{
            width: `${progress}%`,
            transition: 'width 900ms ease',
          }}
        />
      </Box>
    </Box>
  );
};

export default WorkingIndicator;
