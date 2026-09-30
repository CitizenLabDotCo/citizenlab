import React from 'react';

import {
  Box,
  Icon,
  Text,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { GeneratedDraft } from './types';

// prototype data — a front-office-style preview of the project the assistant is
// drafting. Sections appear as the generation reaches them (revealedStage),
// so the manager watches the project take shape.
//   0 = nothing yet · 1 = page · 2 = phases · 3 = survey
type Props = {
  draft: GeneratedDraft;
  revealedStage: number;
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <Box
    bgColor={colors.white}
    borderRadius={stylingConsts.borderRadius}
    border={`1px solid ${colors.borderLight}`}
    p="20px"
    mb="16px"
  >
    {children}
  </Box>
);

const ProjectPreview = ({ draft, revealedStage }: Props) => {
  if (revealedStage === 0) {
    return (
      <Box
        height="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="12px"
        color={colors.textSecondary}
      >
        <Icon name="layout-1column" width="40px" height="40px" fill={colors.grey400} />
        <Text m="0px" color="textSecondary">
          Your project will appear here as the assistant builds it.
        </Text>
      </Box>
    );
  }

  return (
    <Box maxWidth="720px" mx="auto" w="100%">
      {/* The project page */}
      <Card>
        <Box
          height="140px"
          borderRadius={stylingConsts.borderRadius}
          mb="16px"
          display="flex"
          alignItems="flex-end"
          p="16px"
          background={`linear-gradient(135deg, ${colors.teal300}, ${colors.teal500})`}
        >
          <Text m="0px" color="white" fontSize="s" fontWeight="bold">
            PROJECT
          </Text>
        </Box>
        <Title variant="h2" mt="0px" mb="4px" color="primary">
          {draft.title}
        </Title>
        <Text m="0px" mb="12px" color="textSecondary" fontSize="l">
          {draft.tagline}
        </Text>
        <Text m="0px">{draft.description}</Text>
      </Card>

      {/* The timeline of phases */}
      {revealedStage >= 2 && (
        <Card>
          <Text m="0px" mb="12px" fontWeight="bold" color="primary">
            How you can take part
          </Text>
          <Box display="flex" flexDirection="column" gap="10px">
            {draft.phases.map((phase, index) => (
              <Box
                key={phase.title}
                display="flex"
                gap="12px"
                alignItems="flex-start"
                p="12px"
                bgColor={colors.grey50}
                borderRadius={stylingConsts.borderRadius}
              >
                <Box
                  flexShrink={0}
                  w="32px"
                  h="32px"
                  borderRadius="50%"
                  bgColor={colors.teal100}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon name={phase.icon} width="18px" height="18px" fill={colors.teal600} />
                </Box>
                <Box flex="1">
                  <Box display="flex" alignItems="center" gap="8px">
                    <Text m="0px" fontWeight="bold">
                      {index + 1}. {phase.title}
                    </Text>
                    <Text m="0px" fontSize="s" color="textSecondary">
                      {phase.method} · {phase.duration}
                    </Text>
                  </Box>
                  <Text m="0px" fontSize="s" color="textSecondary">
                    {phase.description}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      {/* The drafted survey */}
      {revealedStage >= 3 && (
        <Card>
          <Text m="0px" mb="12px" fontWeight="bold" color="primary">
            Survey · {draft.survey.length} questions
          </Text>
          <Box display="flex" flexDirection="column" gap="8px">
            {draft.survey.map((question, index) => (
              <Box
                key={question.title}
                display="flex"
                gap="10px"
                alignItems="center"
                p="10px"
                border={`1px solid ${colors.borderLight}`}
                borderRadius={stylingConsts.borderRadius}
              >
                <Icon name={question.icon} width="16px" height="16px" fill={colors.grey700} />
                <Box flex="1">
                  <Text m="0px">
                    {index + 1}. {question.title}
                  </Text>
                  <Text m="0px" fontSize="xs" color="textSecondary">
                    {question.type}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default ProjectPreview;
