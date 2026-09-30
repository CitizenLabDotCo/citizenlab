import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Spinner,
  Text,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import Composer from './Composer';
import { LEVERS } from './sampleDraft';
import { AssistantMode, Exchange, GeneratedDraft, LeverId } from './types';

// prototype data — the staged generation. Each step reveals one more part of the
// preview (see ProjectPreview: 1 = page, 2 = phases, 3 = survey).
const STEPS: { label: string; reveal: number }[] = [
  { label: 'Reading your brief…', reveal: 0 },
  { label: 'Writing the project page…', reveal: 1 },
  { label: 'Setting up the phases…', reveal: 2 },
  { label: 'Drafting the survey…', reveal: 3 },
];
const STEP_MS = 1500;

const TEMPLATES = [
  'Participatory budget',
  'Consultation on a plan',
  'Collect and prioritise ideas',
];

type Props = {
  draft: GeneratedDraft;
  onStageChange: (stage: number) => void;
};

const Assistant = ({ draft, onStageChange }: Props) => {
  const [mode, setMode] = useState<AssistantMode>('start');
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [leverChoices, setLeverChoices] = useState<Record<LeverId, number>>({
    influence: 1,
    howFixed: 1,
    reach: 1,
    audience: 1,
  });
  const [steppedAside, setSteppedAside] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const timers = useRef<number[]>([]);

  // Run the staged generation whenever we enter "generating".
  useEffect(() => {
    if (mode !== 'generating') return;
    setStepIndex(0);
    STEPS.forEach((step, index) => {
      const timer = window.setTimeout(() => {
        setStepIndex(index);
        onStageChange(step.reveal);
      }, index * STEP_MS);
      timers.current.push(timer);
    });
    const done = window.setTimeout(() => {
      onStageChange(3);
      setMode('review');
    }, STEPS.length * STEP_MS);
    timers.current.push(done);
    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const reset = () => {
    setMode('start');
    setPrompt('');
    setFiles([]);
    setExchanges([]);
    setSteppedAside(false);
    onStageChange(0);
  };

  const sendBrief = () => {
    setExchanges((previous) => [
      ...previous,
      {
        id: String(previous.length),
        prompt: prompt.trim(),
        fileNames: files.map((file) => file.name),
      },
    ]);
    setPrompt('');
    setFiles([]);
    setMode('levers');
  };

  const startFromTemplate = (name: string) => {
    setExchanges([
      { id: '0', prompt: `Start from the “${name}” template`, fileNames: [] },
    ]);
    setMode('generating');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      p="20px"
      bgColor={colors.white}
    >
      <Box display="flex" alignItems="center" gap="8px" mb="4px">
        <Icon name="stars" fill={colors.teal400} />
        <Title variant="h3" m="0px">
          Project assistant
        </Title>
      </Box>
      <Text m="0px" mb="16px" fontSize="s" color="textSecondary">
        I can draft a whole project for you — page, phases and a survey — ready
        for you to review.
      </Text>

      <Box flex="1" overflowY="auto">
        {(exchanges.length > 0 || mode === 'generating') && (
          <Transcript
            exchanges={exchanges}
            generating={mode === 'generating'}
            currentStep={stepIndex}
          />
        )}

        {mode === 'start' && (
          <StartCards
            steppedAside={steppedAside}
            onBuild={() => setMode('composer')}
            onTemplate={() => setMode('composer') /* placeholder */}
            onSelf={() => setSteppedAside(true)}
          />
        )}

        {mode === 'levers' && (
          <Levers
            choices={leverChoices}
            onChange={(id, value) =>
              setLeverChoices((previous) => ({ ...previous, [id]: value }))
            }
            onGenerate={() => setMode('generating')}
          />
        )}

        {mode === 'review' && (
          <ReviewCard
            draft={draft}
            onRefine={() => setMode('composer')}
            onReset={reset}
          />
        )}
      </Box>

      {mode === 'composer' && (
        <Box mt="16px">
          <TemplateRow onPick={startFromTemplate} />
          <Composer
            prompt={prompt}
            files={files}
            busy={false}
            onPromptChange={setPrompt}
            onFilesChange={setFiles}
            onSend={sendBrief}
          />
        </Box>
      )}
    </Box>
  );
};

// --- three start cards -----------------------------------------------------

const StarterCard = ({
  icon,
  title,
  body,
  onClick,
  highlight,
}: {
  icon: IconNames;
  title: string;
  body: string;
  onClick: () => void;
  highlight?: boolean;
}) => (
  <Box
    as="button"
    onClick={onClick}
    display="flex"
    gap="12px"
    w="100%"
    textAlign="left"
    p="16px"
    bgColor={highlight ? colors.teal50 : colors.white}
    border={`1px solid ${highlight ? colors.teal400 : colors.borderLight}`}
    borderRadius={stylingConsts.borderRadius}
    style={{ cursor: 'pointer' }}
  >
    <Box flexShrink={0}>
      <Icon name={icon} fill={highlight ? colors.teal500 : colors.grey700} />
    </Box>
    <Box>
      <Text m="0px" fontWeight="bold" color="primary">
        {title}
      </Text>
      <Text m="0px" fontSize="s" color="textSecondary">
        {body}
      </Text>
    </Box>
  </Box>
);

const StartCards = ({
  steppedAside,
  onBuild,
  onTemplate,
  onSelf,
}: {
  steppedAside: boolean;
  onBuild: () => void;
  onTemplate: () => void;
  onSelf: () => void;
}) => (
  <Box display="flex" flexDirection="column" gap="10px">
    <StarterCard
      icon="stars"
      title="Build it with me"
      body="Describe your goal, optionally attach a note, and I’ll draft the project."
      onClick={onBuild}
      highlight
    />
    <StarterCard
      icon="template"
      title="Start from a template"
      body="Pick a proven set-up and adapt it."
      onClick={onTemplate}
    />
    <StarterCard
      icon="settings"
      title="Set it up myself"
      body="I’ll step aside — build it manually in the panel on the left."
      onClick={onSelf}
    />
    {steppedAside && (
      <Box
        mt="4px"
        p="12px"
        bgColor={colors.grey50}
        borderRadius={stylingConsts.borderRadius}
      >
        <Text m="0px" fontSize="s" color="textSecondary">
          No problem — I’ve stepped aside. Build your project in the left panel,
          or pick one of the options above whenever you want a hand.
        </Text>
      </Box>
    )}
  </Box>
);

// A small template shortcut shown above the composer.
const TemplateRow = ({ onPick }: { onPick: (name: string) => void }) => (
  <Box mb="12px">
    <Text m="0px" mb="6px" fontSize="s" color="textSecondary">
      …or start from a template:
    </Text>
    <Box display="flex" flexWrap="wrap" gap="6px">
      {TEMPLATES.map((name) => (
        <Box
          key={name}
          as="button"
          onClick={() => onPick(name)}
          px="10px"
          py="6px"
          bgColor={colors.grey100}
          border="none"
          borderRadius={stylingConsts.borderRadius}
          style={{ cursor: 'pointer' }}
        >
          <Text m="0px" fontSize="s">
            {name}
          </Text>
        </Box>
      ))}
    </Box>
  </Box>
);

// --- the four levers -------------------------------------------------------

const Levers = ({
  choices,
  onChange,
  onGenerate,
}: {
  choices: Record<LeverId, number>;
  onChange: (id: LeverId, value: number) => void;
  onGenerate: () => void;
}) => (
  <Box
    mt="12px"
    p="16px"
    bgColor={colors.white}
    border={`1px solid ${colors.borderLight}`}
    borderRadius={stylingConsts.borderRadius}
  >
    <Box display="flex" alignItems="center" gap="8px" mb="4px">
      <Icon name="bullseye" width="18px" height="18px" fill={colors.teal500} />
      <Text m="0px" fontWeight="bold" color="primary">
        Before I draft, let’s confirm a few things
      </Text>
    </Box>
    <Text m="0px" mb="16px" fontSize="s" color="textSecondary">
      These shape the phases and tone. I’ve guessed sensible defaults.
    </Text>
    <Box display="flex" flexDirection="column" gap="16px">
      {LEVERS.map((lever) => (
        <Box key={lever.id}>
          <Text m="0px" mb="6px" fontSize="s" fontWeight="bold">
            {lever.question}
          </Text>
          <Box display="flex" gap="6px">
            {lever.options.map((option, index) => {
              const selected = choices[lever.id] === index;
              return (
                <Box
                  key={option}
                  as="button"
                  onClick={() => onChange(lever.id, index)}
                  flex="1"
                  px="8px"
                  py="8px"
                  textAlign="center"
                  bgColor={selected ? colors.teal100 : colors.grey50}
                  border={`1px solid ${
                    selected ? colors.teal400 : colors.borderLight
                  }`}
                  borderRadius={stylingConsts.borderRadius}
                  style={{ cursor: 'pointer' }}
                >
                  <Text
                    m="0px"
                    fontSize="xs"
                    color={selected ? 'teal700' : 'textSecondary'}
                  >
                    {option}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
    <Box mt="16px">
      <ButtonWithLink type="button" icon="stars" onClick={onGenerate} width="100%">
        Generate my project
      </ButtonWithLink>
    </Box>
  </Box>
);

// --- transcript + generation progress --------------------------------------

const Transcript = ({
  exchanges,
  generating,
  currentStep,
}: {
  exchanges: Exchange[];
  generating: boolean;
  currentStep: number;
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [exchanges.length, generating, currentStep]);

  return (
    <Box display="flex" flexDirection="column" gap="12px" mb="12px">
      {exchanges.map((exchange) => (
        <Box
          key={exchange.id}
          alignSelf="flex-end"
          maxWidth="90%"
          p="12px"
          bgColor={colors.grey100}
          borderRadius={stylingConsts.borderRadius}
        >
          {exchange.prompt && (
            <Text m="0px" whiteSpace="pre-wrap">
              {exchange.prompt}
            </Text>
          )}
          {exchange.fileNames.map((name) => (
            <Box key={name} display="flex" alignItems="center" gap="4px" mt="4px">
              <Icon name="paperclip" width="14px" height="14px" fill={colors.grey700} />
              <Text m="0px" fontSize="s" color="grey700">
                {name}
              </Text>
            </Box>
          ))}
        </Box>
      ))}
      {generating && (
        <Box
          p="12px"
          bgColor={colors.white}
          border={`1px solid ${colors.borderLight}`}
          borderRadius={stylingConsts.borderRadius}
        >
          {STEPS.map((step, index) => {
            const done = index < currentStep;
            const active = index === currentStep;
            if (index > currentStep) return null;
            return (
              <Box key={step.label} display="flex" alignItems="center" gap="8px" py="2px">
                {done ? (
                  <Icon name="check-circle" width="16px" height="16px" fill={colors.success} />
                ) : (
                  <Spinner size="16px" />
                )}
                <Text m="0px" color={active ? 'textPrimary' : 'textSecondary'}>
                  {step.label}
                </Text>
              </Box>
            );
          })}
        </Box>
      )}
      <div ref={endRef} />
    </Box>
  );
};

// --- review card -----------------------------------------------------------

const ReviewCard = ({
  draft,
  onRefine,
  onReset,
}: {
  draft: GeneratedDraft;
  onRefine: () => void;
  onReset: () => void;
}) => (
  <Box
    p="16px"
    bgColor={colors.white}
    border={`1px solid ${colors.borderLight}`}
    borderRadius={stylingConsts.borderRadius}
  >
    <Box display="flex" alignItems="center" gap="8px" mb="8px">
      <Icon name="check-circle" fill={colors.success} />
      <Text m="0px" fontWeight="bold" color="primary">
        Draft ready — review it on the right
      </Text>
    </Box>
    <Text m="0px" mb="12px" fontSize="s" color="textSecondary">
      I’ve drafted “{draft.title}”: a project page, {draft.phases.length} phases
      and a {draft.survey.length}-question survey. Nothing is published — edit
      anything before you share it.
    </Text>
    <Box display="flex" flexDirection="column" gap="8px">
      <ButtonWithLink type="button" icon="arrow-right" width="100%">
        Open in the builder
      </ButtonWithLink>
      <ButtonWithLink
        type="button"
        buttonStyle="secondary-outlined"
        icon="refresh"
        width="100%"
        onClick={onRefine}
      >
        Refine with another instruction
      </ButtonWithLink>
      <ButtonWithLink
        type="button"
        buttonStyle="text"
        width="100%"
        onClick={onReset}
      >
        Start over
      </ButtonWithLink>
    </Box>
  </Box>
);

export default Assistant;
