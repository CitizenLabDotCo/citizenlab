import React, { useState } from 'react';

import {
  Box,
  Icon,
  Text,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import Assistant from './Assistant';
import ProjectPreview from './ProjectPreview';
import { SAMPLE_DRAFT } from './sampleDraft';

// prototype data — a self-contained screen for the AI project generator, so it
// can be opened directly without a draft project or the back-office redesign
// flag. Layout mirrors the redesigned project workspace: a left set-up rail, a
// centre preview, and the assistant docked on the right.
const PANEL = '360px';
const GAP = '8px';

const LeftRail = () => (
  <Box p="16px" display="flex" flexDirection="column" gap="10px">
    <Text m="0px" fontWeight="bold" color="primary">
      Set up
    </Text>
    {['Project page', 'Timeline & phases', 'Participants', 'Publish'].map(
      (label) => (
        <Box
          key={label}
          display="flex"
          alignItems="center"
          gap="8px"
          p="10px"
          bgColor={colors.grey50}
          borderRadius={stylingConsts.borderRadius}
        >
          <Box
            w="16px"
            h="16px"
            borderRadius="50%"
            border={`1.5px solid ${colors.grey400}`}
            flexShrink={0}
          />
          <Text m="0px" fontSize="s" color="textSecondary">
            {label}
          </Text>
        </Box>
      )
    )}
  </Box>
);

const ProjectGeneratorPrototype = () => {
  const [revealedStage, setRevealedStage] = useState(0);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={GAP}
      p={GAP}
      height="100vh"
      overflow="hidden"
      bgColor={colors.background}
    >
      {/* header */}
      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        px="16px"
        py="12px"
        bgColor={colors.white}
        borderRadius={stylingConsts.borderRadius}
      >
        <Icon name="stars" fill={colors.teal400} />
        <Title variant="h4" m="0px">
          New project
        </Title>
        <Text m="0px" ml="4px" fontSize="s" color="textSecondary">
          Draft — not published
        </Text>
      </Box>

      <Box display="flex" gap={GAP} flexGrow={1} minHeight="0" overflow="hidden">
        {/* left set-up rail */}
        <Box
          flex={`0 0 ${PANEL}`}
          minHeight="0"
          overflowY="auto"
          bgColor={colors.white}
          borderRadius={stylingConsts.borderRadius}
        >
          <LeftRail />
        </Box>

        {/* centre preview */}
        <Box
          flexGrow={1}
          minWidth="0"
          minHeight="0"
          overflowY="auto"
          p="20px"
          bgColor={colors.grey100}
          borderRadius={stylingConsts.borderRadius}
        >
          <ProjectPreview draft={SAMPLE_DRAFT} revealedStage={revealedStage} />
        </Box>

        {/* assistant dock */}
        <Box
          flex={`0 0 ${PANEL}`}
          minHeight="0"
          overflowY="auto"
          bgColor={colors.white}
          borderRadius={stylingConsts.borderRadius}
        >
          <Assistant draft={SAMPLE_DRAFT} onStageChange={setRevealedStage} />
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectGeneratorPrototype;
