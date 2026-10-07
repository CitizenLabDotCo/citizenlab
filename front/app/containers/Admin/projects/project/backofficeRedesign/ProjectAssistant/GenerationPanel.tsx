import React from 'react';

import { Box, Icon, Spinner, Text, colors } from '@citizenlab/cl2-component-library';

type Props = {
  steps: string[];
  activeIndex: number;
  prompt: string;
  fileNames: string[];
};

const StepRow = ({
  label,
  state,
}: {
  label: string;
  state: 'done' | 'active' | 'pending';
}) => (
  <Box display="flex" alignItems="center" gap="10px" py="6px">
    <Box width="22px" display="flex" alignItems="center" justifyContent="center">
      {state === 'done' && (
        <Icon name="check-circle" width="20px" height="20px" fill={colors.success} />
      )}
      {state === 'active' && <Spinner size="18px" />}
      {state === 'pending' && (
        <Icon name="clock" width="18px" height="18px" fill={colors.grey400} />
      )}
    </Box>
    <Text
      m="0px"
      color={state === 'pending' ? 'textSecondary' : 'textPrimary'}
      fontWeight={state === 'active' ? 'bold' : 'normal'}
    >
      {label}
    </Text>
  </Box>
);

// The progress lives inline in the dock (not a modal) so the manager can watch
// the project page on the left fill in, and so the brief and the run read as
// one thread: the brief sits to the right as the manager's own message, the
// assistant's progress reply sits to the left. When the run finishes, the
// panel hands over to the shared draft review (summary + why + redraft).
const GenerationPanel = ({ steps, activeIndex, prompt, fileNames }: Props) => (
  <Box>
    {(prompt.trim() !== '' || fileNames.length > 0) && (
      <Box display="flex" justifyContent="flex-end" mb="24px">
        <Box
          maxWidth="88%"
          px="14px"
          py="12px"
          borderRadius="14px 14px 4px 14px"
          bgColor={colors.grey100}
        >
          {prompt.trim() !== '' && (
            <Text m="0px" color="textPrimary" lineHeight="1.5">
              {prompt.trim()}
            </Text>
          )}
          {fileNames.length > 0 && (
            <Box
              display="flex"
              flexWrap="wrap"
              gap="6px"
              mt={prompt.trim() !== '' ? '8px' : '0px'}
            >
              {fileNames.map((name) => (
                <Box
                  key={name}
                  display="flex"
                  alignItems="center"
                  gap="6px"
                  px="8px"
                  py="2px"
                  bgColor="white"
                  border={`1px solid ${colors.grey200}`}
                  borderRadius="8px"
                  maxWidth="100%"
                >
                  <Icon name="file" width="14px" height="14px" fill={colors.grey700} />
                  <Text
                    m="0px"
                    fontSize="s"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    maxWidth="160px"
                  >
                    {name}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    )}

    <Box display="flex" alignItems="center" gap="10px" mb="16px">
      <Box
        flex="0 0 auto"
        width="28px"
        height="28px"
        borderRadius="50%"
        bgColor={colors.teal50}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon name="stars" width="16px" height="16px" fill={colors.teal500} />
      </Box>
      <Text m="0px" fontSize="l" fontWeight="bold" lineHeight="1.2">
        Drafting your project
      </Text>
    </Box>

    <Text m="0px" mb="12px" color="textSecondary" lineHeight="1.5">
      I’m drafting the whole project — this takes about a minute. The project
      page on the left fills in as I go.
    </Text>
    {steps.map((label, index) => (
      <StepRow
        key={label}
        label={label}
        state={
          index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending'
        }
      />
    ))}
  </Box>
);

export default GenerationPanel;
