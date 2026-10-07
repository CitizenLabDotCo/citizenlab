import React, { useEffect, useState } from 'react';

import {
  Box,
  Spinner,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

type Props = {
  startedAt: string;
};

// prototype data — a plain-language narration of what the engine is actually
// doing behind the scenes, so the wait reads as considered work rather than a
// dead spinner. Each stage starts at its `after` second and holds until the
// next; the last one holds until the draft lands.
const STAGES: { after: number; label: string }[] = [
  { after: 0, label: 'Reading your brief and what you want to learn' },
  {
    after: 5,
    label: 'Drawing on 10 years and 20,000+ consultations of what works',
  },
  { after: 13, label: 'Choosing the right participation method for your goal' },
  {
    after: 22,
    label: 'Drafting the project page — the intro, the context and the ask',
  },
  { after: 34, label: 'Writing the survey questions' },
  { after: 46, label: 'Setting up the phases and timeline' },
  { after: 56, label: 'Setting who can see it and who can take part' },
  { after: 66, label: 'Adding the finishing touches' },
];

const secondsSince = (startedAt: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));

const stageFor = (seconds: number) =>
  STAGES.reduce(
    (current, stage) => (seconds >= stage.after ? stage.label : current),
    STAGES[0].label
  );

const WorkingIndicator = ({ startedAt }: Props) => {
  const [seconds, setSeconds] = useState(() => secondsSince(startedAt));

  useEffect(() => {
    const interval = setInterval(() => setSeconds(secondsSince(startedAt)), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const label = stageFor(seconds);

  return (
    <Box
      role="status"
      display="flex"
      alignItems="flex-start"
      gap="12px"
      p="14px"
      bgColor={colors.white}
      border={`1px solid ${colors.borderLight}`}
      borderRadius={stylingConsts.borderRadius}
    >
      <Box flex="0 0 auto" mt="2px">
        <Spinner size="20px" />
      </Box>
      <Box flex="1" minWidth="0">
        {/* key re-mounts the line on each stage so the change fades in */}
        <Text
          key={label}
          m="0px"
          color="textPrimary"
          lineHeight="1.4"
          style={{ animation: 'cl-assistant-fade 400ms ease' }}
        >
          {label}…
        </Text>
        <Text m="4px 0 0" fontSize="s" color="textSecondary">
          Drafting your project — this usually takes under a minute · {seconds}s
        </Text>
      </Box>
      <style>{`@keyframes cl-assistant-fade { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </Box>
  );
};

export default WorkingIndicator;
