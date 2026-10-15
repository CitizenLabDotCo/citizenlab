import React, { useEffect, useRef, useState } from 'react';

import { Box, Icon, Spinner, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAddProject from 'api/projects/useAddProject';

import useLocale from 'hooks/useLocale';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import clHistory from 'utils/cl-router/history';

import DraftPreviewPane from './DraftPreviewPane';
import ModalComposer from './ModalComposer';
import {
  DRAFT_DESCRIPTION,
  DRAFT_TITLE,
  DRAFTING_STEPS,
  INTRO,
  QUESTION,
  REVIEW_PROMPT,
  STEP_MS,
  SUGGESTIONS,
  WHAT_I_DID,
} from './script';

// The AI project assistant as a create-flow modal. The manager describes the
// project, answers one question, watches it draft, then reviews a Draft/Preview
// of the whole project before committing. "Create project" lands them in the
// normal project setup workspace. Everything here is the scripted scenario in
// ./script — the generation mechanics are unchanged; this is the experience.

type Phase = 'brief' | 'question' | 'drafting' | 'review';

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Shell = styled.div<{ $wide: boolean }>`
  background: ${colors.white};
  border-radius: 20px;
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '1240px' : '720px')};
  height: ${({ $wide }) => ($wide ? '88vh' : 'auto')};
  max-height: 88vh;
  display: flex;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
`;

const LinkButton = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: ${colors.teal700};
  cursor: pointer;
`;

const Header = ({
  onStartFromScratch,
  onClose,
}: {
  onStartFromScratch: () => void;
  onClose: () => void;
}) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    px="24px"
    py="18px"
    flex="0 0 auto"
  >
    <Box display="flex" alignItems="center" gap="10px">
      <Icon name="stars" width="20px" height="20px" fill={colors.teal500} />
      <Text m="0px" fontSize="l" fontWeight="bold" color="textPrimary">
        Project assistant
      </Text>
      <Box px="8px" py="2px" borderRadius="999px" bgColor={colors.grey100}>
        <Text m="0px" fontSize="s" color="textSecondary" fontWeight="bold">
          Beta
        </Text>
      </Box>
    </Box>
    <Box display="flex" alignItems="center" gap="18px">
      <LinkButton type="button" onClick={onStartFromScratch}>
        Start from scratch
      </LinkButton>
      <button
        type="button"
        onClick={onClose}
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
        aria-label="Close"
      >
        <Icon name="close" width="18px" height="18px" fill={colors.textSecondary} />
      </button>
    </Box>
  </Box>
);

const UserBubble = ({ text }: { text: string }) => (
  <Box display="flex" justifyContent="flex-end">
    <Box maxWidth="85%" p="12px 16px" borderRadius="14px 14px 4px 14px" bgColor={colors.grey100}>
      <Text m="0px" color="textPrimary" lineHeight="1.5">
        {text}
      </Text>
    </Box>
  </Box>
);

const AssistantLine = ({ children }: { children: React.ReactNode }) => (
  <Text m="0px" color="textPrimary" lineHeight="1.55">
    {children}
  </Text>
);

const QuestionCard = ({ onPick }: { onPick: () => void }) => (
  <Box border={`1px solid ${colors.grey300}`} borderRadius="14px" p="20px">
    <Text m="0px" fontWeight="bold" fontSize="l" color="textPrimary">
      {QUESTION.title}
    </Text>
    <Text m="8px 0 16px" color="textSecondary" lineHeight="1.5">
      {QUESTION.help}
    </Text>
    <Box display="flex" flexDirection="column" gap="10px">
      {QUESTION.options.map((opt) => (
        <Box
          key={opt.id}
          as="button"
          // @ts-expect-error prototype: Box rendered as a native button
          type="button"
          onClick={onPick}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="12px"
          width="100%"
          p="14px 16px"
          borderRadius="10px"
          border={`1px solid ${opt.suggested ? colors.teal400 : colors.grey300}`}
          background={colors.white}
          style={{ cursor: 'pointer', textAlign: 'left' }}
        >
          <Box>
            <Text m="0px" fontWeight="bold" color="textPrimary">
              {opt.label}
            </Text>
            <Text m="2px 0 0" fontSize="s" color="textSecondary">
              {opt.sub}
            </Text>
          </Box>
          {opt.suggested && (
            <Box flex="0 0 auto" px="10px" py="4px" borderRadius="999px" bgColor={colors.teal50}>
              <Text m="0px" fontSize="s" color="teal700" fontWeight="bold">
                Suggested
              </Text>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  </Box>
);

const StepRow = ({ label, state }: { label: string; state: 'done' | 'active' | 'todo' }) => (
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

const DraftingChecklist = ({ activeStep }: { activeStep: number }) => (
  <Box border={`1px solid ${colors.grey300}`} borderRadius="14px" p="20px">
    <Text m="0 0 16px" fontWeight="bold" fontSize="l" color="textPrimary">
      Drafting your project
    </Text>
    <Box display="flex" flexDirection="column" gap="14px">
      {DRAFTING_STEPS.map((label, i) => (
        <StepRow
          key={label}
          label={label}
          state={i < activeStep ? 'done' : i === activeStep ? 'active' : 'todo'}
        />
      ))}
    </Box>
  </Box>
);

type Props = {
  onClose: () => void;
  onStartFromScratch: () => void;
};

const ProjectAssistantModal = ({ onClose, onStartFromScratch }: Props) => {
  const locale = useLocale();
  const { mutateAsync: addProject } = useAddProject();

  const [phase, setPhase] = useState<Phase>('brief');
  const [brief, setBrief] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [replies, setReplies] = useState<{ user: string; assistant: string }[]>([]);
  const [creating, setCreating] = useState(false);
  const timers = useRef<number[]>([]);

  // Run the drafting checklist, then reveal the review.
  useEffect(() => {
    if (phase !== 'drafting') return;
    setActiveStep(0);
    DRAFTING_STEPS.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setActiveStep(i + 1), STEP_MS * (i + 1))
      );
    });
    timers.current.push(
      window.setTimeout(() => setPhase('review'), STEP_MS * (DRAFTING_STEPS.length + 1))
    );
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [phase]);

  const applySuggestion = (label: string, reply: string) =>
    setReplies((prev) => [...prev, { user: label, assistant: reply }]);

  const createProject = async () => {
    setCreating(true);
    try {
      const project = await addProject({
        title_multiloc: { [locale]: DRAFT_TITLE },
        description_preview_multiloc: { [locale]: DRAFT_DESCRIPTION },
        admin_publication_attributes: { publication_status: 'draft' },
      } as any);
      clHistory.push(adminProjectsProjectPath(project.data.id));
      onClose();
    } catch {
      setCreating(false);
    }
  };

  const wide = phase === 'review';

  // The left (conversation) column — shared across every phase.
  const conversation = (
    <>
      <Header onStartFromScratch={onStartFromScratch} onClose={onClose} />

      <Box flex="1" minHeight="0" overflowY="auto" px="24px" display="flex" flexDirection="column" gap="18px">
        {phase === 'brief' && <AssistantLine>{INTRO}</AssistantLine>}

        {phase !== 'brief' && (
          <>
            {brief && <UserBubble text={brief} />}

            {phase === 'question' && (
              <>
                <AssistantLine>{QUESTION.lead}</AssistantLine>
                <QuestionCard onPick={() => setPhase('drafting')} />
              </>
            )}

            {phase === 'drafting' && <DraftingChecklist activeStep={activeStep} />}

            {phase === 'review' && (
              <>
                <DraftingChecklist activeStep={DRAFTING_STEPS.length} />

                <Box p="16px 18px" borderRadius="14px" bgColor={colors.grey100}>
                  <Text m="0 0 12px" fontWeight="bold" color="textPrimary">
                    Here is what I did:
                  </Text>
                  <Box display="flex" flexDirection="column" gap="10px">
                    {WHAT_I_DID.map((item) => (
                      <Box key={item} display="flex" gap="10px" alignItems="flex-start">
                        <Box flex="0 0 auto" mt="2px">
                          <Icon name="check" width="15px" height="15px" fill={colors.teal500} />
                        </Box>
                        <Text m="0px" color="textPrimary" lineHeight="1.45">
                          {item}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <AssistantLine>{REVIEW_PROMPT}</AssistantLine>

                {replies.map((r, i) => (
                  <React.Fragment key={i}>
                    <UserBubble text={r.user} />
                    <AssistantLine>{r.assistant}</AssistantLine>
                  </React.Fragment>
                ))}

                <Box display="flex" flexWrap="wrap" gap="8px">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => applySuggestion(s.label, s.reply)}
                      style={{
                        appearance: 'none',
                        border: `1px solid ${colors.grey300}`,
                        background: colors.white,
                        borderRadius: '999px',
                        padding: '8px 14px',
                        font: 'inherit',
                        fontSize: '14px',
                        color: colors.textPrimary,
                        cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </Box>
              </>
            )}
          </>
        )}
      </Box>

      {phase !== 'drafting' && (
        <Box flex="0 0 auto" p="16px 24px 24px">
          <ModalComposer
            placeholder={phase === 'brief' ? 'Chat to create' : 'Chat to change anything'}
            onSend={(text) => {
              if (phase === 'brief') {
                setBrief(text);
                setPhase('question');
              } else if (phase === 'review') {
                applySuggestion(text, 'Done — I’ve applied that to the draft on the right.');
              }
            }}
          />
        </Box>
      )}
    </>
  );

  return (
    <Scrim onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Shell $wide={wide}>
        {wide ? (
          <>
            <Box flex="0 0 440px" display="flex" flexDirection="column" minHeight="0" borderRight={`1px solid ${colors.grey200}`}>
              {conversation}
            </Box>
            <Box flex="1" minWidth="0" display="flex" flexDirection="column" minHeight="0" bgColor={colors.grey50}>
              <Box flex="1" minHeight="0">
                <DraftPreviewPane />
              </Box>
              <Box
                flex="0 0 auto"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="16px"
                px="32px"
                py="18px"
                borderTop={`1px solid ${colors.grey200}`}
                bgColor={colors.white}
              >
                <Text m="0px" fontSize="s" color="textSecondary">
                  Nothing is visible to residents until you publish.
                </Text>
                <ButtonWithLink
                  buttonStyle="admin-dark"
                  onClick={createProject}
                  processing={creating}
                >
                  Create project
                </ButtonWithLink>
              </Box>
            </Box>
          </>
        ) : (
          <Box flex="1" display="flex" flexDirection="column" minHeight="0">
            {conversation}
          </Box>
        )}
      </Shell>
    </Scrim>
  );
};

export default ProjectAssistantModal;
