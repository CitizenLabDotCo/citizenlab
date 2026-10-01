import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Spinner,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { DemoReport, DemoStatus } from './useDemoGeneration';

type Props = {
  status: DemoStatus;
  steps: string[];
  activeIndex: number;
  report: DemoReport;
  prompt: string;
  fileNames: string[];
  onClose: () => void;
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

const InfoRow = ({
  icon,
  title,
  detail,
}: {
  icon: IconNames;
  title: string;
  detail: string;
}) => (
  <Box display="flex" gap="10px" py="8px">
    <Box
      flex="0 0 auto"
      width="32px"
      height="32px"
      borderRadius="8px"
      bgColor={colors.teal50}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Icon name={icon} width="18px" height="18px" fill={colors.teal500} />
    </Box>
    <Box>
      <Text m="0px" fontWeight="bold">
        {title}
      </Text>
      <Text m="0px" fontSize="s" color="textSecondary">
        {detail}
      </Text>
    </Box>
  </Box>
);

const RunningView = ({
  steps,
  activeIndex,
}: {
  steps: string[];
  activeIndex: number;
}) => (
  <Box>
    <Text m="0px" mb="12px" color="textSecondary">
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

const ReportView = ({
  report,
  onClose,
}: {
  report: DemoReport;
  onClose: () => void;
}) => (
  <Box>
    <Box
      display="inline-flex"
      alignItems="center"
      gap="6px"
      px="10px"
      py="4px"
      mb="12px"
      borderRadius={stylingConsts.borderRadius}
      bgColor={colors.teal50}
    >
      <Icon name="stars" width="16px" height="16px" fill={colors.teal500} />
      <Text m="0px" fontSize="s" fontWeight="bold" color="teal700">
        Shaped as a {report.archetype}
      </Text>
    </Box>
    <Text m="0px" mb="20px" color="textSecondary">
      {report.rationale}
    </Text>

    <Text m="0px" mb="4px" variant="bodyS" color="textSecondary">
      WHAT I CREATED — nothing is published yet
    </Text>
    <Box mb="20px">
      {report.artifacts.map((artifact) => (
        <InfoRow
          key={artifact.title}
          icon={artifact.icon}
          title={artifact.title}
          detail={artifact.detail}
        />
      ))}
    </Box>

    <Box
      display="flex"
      alignItems="center"
      gap="14px"
      p="14px"
      mb="20px"
      borderRadius={stylingConsts.borderRadius}
      border={`1px solid ${colors.grey300}`}
    >
      <Box
        flex="0 0 auto"
        width="56px"
        height="56px"
        borderRadius="50%"
        bgColor={colors.success}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text m="0px" color="white" fontWeight="bold" fontSize="l">
          {report.surveyScore}
        </Text>
      </Box>
      <Box>
        <Text m="0px" fontWeight="bold">
          Survey quality check
        </Text>
        <Text m="0px" fontSize="s" color="textSecondary">
          {report.surveyNote}
        </Text>
      </Box>
    </Box>

    <Text m="0px" mb="4px" variant="bodyS" color="textSecondary">
      SUGGESTED NEXT STEPS — where to take it from here
    </Text>
    <Box mb="24px">
      {report.nextSteps.map((step) => (
        <Box
          key={step.title}
          as="button"
          onClick={onClose}
          display="flex"
          alignItems="center"
          gap="10px"
          width="100%"
          py="10px"
          px="4px"
          background="transparent"
          border="none"
          borderBottom={`1px solid ${colors.grey200}`}
          style={{ cursor: 'pointer', textAlign: 'left' }}
        >
          <Icon name={step.icon} width="18px" height="18px" fill={colors.teal500} />
          <Box flexGrow={1}>
            <Text m="0px" fontWeight="bold">
              {step.title}
            </Text>
            <Text m="0px" fontSize="s" color="textSecondary">
              {step.detail}
            </Text>
          </Box>
          <Icon name="chevron-right" width="18px" height="18px" fill={colors.grey600} />
        </Box>
      ))}
    </Box>

    <Box display="flex" gap="10px">
      <ButtonWithLink buttonStyle="secondary-outlined" onClick={onClose}>
        Start over
      </ButtonWithLink>
      <ButtonWithLink icon="sidebar-pages-menu" onClick={onClose}>
        Review the project
      </ButtonWithLink>
    </Box>
  </Box>
);

// The progress + result live inline in the dock (not a modal) so the manager
// can watch the project page on the left fill in, and so the brief, the run
// and the result read as one thread in the assistant.
const GenerationPanel = ({
  status,
  steps,
  activeIndex,
  report,
  prompt,
  fileNames,
  onClose,
}: Props) => (
  <Box>
    {(prompt.trim() !== '' || fileNames.length > 0) && (
      <Box
        mb="16px"
        p="12px"
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.grey100}
      >
        {prompt.trim() !== '' && (
          <Text m="0px" color="textPrimary">
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
                gap="4px"
                px="8px"
                py="2px"
                bgColor="white"
                borderRadius={stylingConsts.borderRadius}
                maxWidth="100%"
              >
                <Icon name="file" width="14px" height="14px" fill={colors.grey700} />
                <Text m="0px" fontSize="s" overflow="hidden" whiteSpace="nowrap">
                  {name}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    )}

    <Text m="0px" mb="12px" fontSize="l" fontWeight="bold">
      {status === 'done' ? 'Your project draft is ready' : 'Drafting your project'}
    </Text>

    {status === 'done' ? (
      <ReportView report={report} onClose={onClose} />
    ) : (
      <RunningView steps={steps} activeIndex={activeIndex} />
    )}
  </Box>
);

export default GenerationPanel;
