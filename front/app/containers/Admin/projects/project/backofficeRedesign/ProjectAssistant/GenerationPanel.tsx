import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Spinner,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

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

// Small uppercase section label, used to divide the report into scannable
// groups without shouting.
const SectionLabel = ({ label, note }: { label: string; note: string }) => (
  <Box display="flex" alignItems="baseline" flexWrap="wrap" gap="8px" mb="10px">
    <Text
      m="0px"
      variant="bodyS"
      fontWeight="bold"
      color="textSecondary"
      style={{ letterSpacing: '0.07em' }}
    >
      {label}
    </Text>
    <Text m="0px" variant="bodyS" color="textSecondary">
      {note}
    </Text>
  </Box>
);

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
  <Box display="flex" gap="12px" py="8px">
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
      <Text m="0px" fontWeight="bold" lineHeight="1.3">
        {title}
      </Text>
      <Text m="0px" fontSize="s" color="textSecondary" lineHeight="1.4">
        {detail}
      </Text>
    </Box>
  </Box>
);

// A score ring (out of 100) instead of a flat badge — reads as a measured
// quality check rather than a pass/fail stamp.
const ScoreRing = ({ score }: { score: number }) => (
  <Box
    flex="0 0 auto"
    width="60px"
    height="60px"
    borderRadius="50%"
    display="flex"
    alignItems="center"
    justifyContent="center"
    background={`conic-gradient(${colors.success} ${score * 3.6}deg, ${
      colors.grey200
    } 0deg)`}
  >
    <Box
      width="46px"
      height="46px"
      borderRadius="50%"
      bgColor="white"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Text m="0px" fontWeight="bold" fontSize="m" lineHeight="1">
        {score}
      </Text>
      <Text m="0px" fontSize="xs" color="textSecondary" lineHeight="1.1">
        /100
      </Text>
    </Box>
  </Box>
);

// Clickable row that takes the manager into one of the real workspace surfaces.
const NextStepRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 6px;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${colors.grey200};
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease;

  &:hover {
    background: ${colors.grey100};
  }
  &:last-of-type {
    border-bottom: none;
  }
`;

const RunningView = ({
  steps,
  activeIndex,
}: {
  steps: string[];
  activeIndex: number;
}) => (
  <Box>
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
      px="12px"
      py="5px"
      mb="12px"
      borderRadius="999px"
      bgColor={colors.teal50}
    >
      <Icon name="stars" width="16px" height="16px" fill={colors.teal500} />
      <Text m="0px" fontSize="s" fontWeight="bold" color="teal700">
        Shaped as a {report.archetype}
      </Text>
    </Box>
    <Text m="0px" mb="24px" color="textSecondary" lineHeight="1.55">
      {report.rationale}
    </Text>

    <SectionLabel label="WHAT I CREATED" note="Nothing is published yet" />
    <Box mb="24px">
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
      p="16px"
      mb="24px"
      borderRadius="12px"
      border={`1px solid ${colors.grey200}`}
      bgColor={colors.grey100}
    >
      <ScoreRing score={report.surveyScore} />
      <Box>
        <Text m="0px" fontWeight="bold" lineHeight="1.3">
          Survey quality check
        </Text>
        <Text m="0px" fontSize="s" color="textSecondary" lineHeight="1.45">
          {report.surveyNote}
        </Text>
      </Box>
    </Box>

    <SectionLabel
      label="SUGGESTED NEXT STEPS"
      note="Where to take it from here"
    />
    <Box mb="24px">
      {report.nextSteps.map((step) => (
        <NextStepRow key={step.title} type="button" onClick={onClose}>
          <Icon name={step.icon} width="18px" height="18px" fill={colors.teal500} />
          <Box flexGrow={1}>
            <Text m="0px" fontWeight="bold" lineHeight="1.3">
              {step.title}
            </Text>
            <Text m="0px" fontSize="s" color="textSecondary" lineHeight="1.4">
              {step.detail}
            </Text>
          </Box>
          <Icon
            name="chevron-right"
            width="18px"
            height="18px"
            fill={colors.grey600}
          />
        </NextStepRow>
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
// and the result read as one thread in the assistant. The brief sits to the
// right as the manager's own message; the assistant's reply sits to the left.
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
        {status === 'done'
          ? 'Your project draft is ready'
          : 'Drafting your project'}
      </Text>
    </Box>

    {status === 'done' ? (
      <ReportView report={report} onClose={onClose} />
    ) : (
      <RunningView steps={steps} activeIndex={activeIndex} />
    )}
  </Box>
);

export default GenerationPanel;
