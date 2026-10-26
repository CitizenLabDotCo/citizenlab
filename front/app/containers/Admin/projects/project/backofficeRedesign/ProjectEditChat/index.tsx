import React, { useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, format, parseISO } from 'date-fns';
import styled, { keyframes } from 'styled-components';

import customFieldsKeys from 'api/custom_fields/keys';
import customFormKeys from 'api/custom_form/keys';
import useAddPhase from 'api/phases/useAddPhase';
import phasesKeys from 'api/phases/keys';
import usePhases from 'api/phases/usePhases';
import { ParticipationMethod } from 'api/phases/types';
import projectPageLayoutKeys from 'api/project_page_layout/keys';
import useAddProjectGeneration from 'api/project_generations/useAddProjectGeneration';
import projectsKeys from 'api/projects/keys';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';
import useLocale from 'hooks/useLocale';

import DraftingProgress from '../ProjectAssistantModal/DraftingProgress';
import GenerationWatcher from '../ProjectAssistantModal/GenerationWatcher';
import ModalComposer from '../ProjectAssistantModal/ModalComposer';
import { DEFAULT_LEVERS } from '../ProjectAssistant/leverConfig';

// The persistent "chat to change anything" entry in the project setup
// workspace. Two jobs:
//
//  1. On arrival from the assistant it carries the before-you-publish checklist
//     (the generator's next_steps) — the bar pulses for attention and, once
//     opened, the steps show as a tickable list. This is where the manager
//     actually does the work, so the checklist lives here rather than in the
//     create modal.
//
//  2. It answers change requests. A *targeted* edit — "add a phase" — is routed
//     to the matching tool (it really creates the phase and asks a question
//     first), NOT a full regeneration. Broad asks ("make it more ambitious")
//     still fall back to a whole-project redraft via the engine. (Prototype:
//     only the phase intent is wired to a real targeted tool so far — the same
//     pattern is what every other intent should route through.)

const INTRO =
  'Ask for a change and I’ll make it. Small edits — like adding a phase — I do directly; bigger reshapes I’ll redraft.';

const SUGGESTIONS = [
  'Add a new phase',
  'Make the introduction shorter and punchier',
  'Make the survey shorter',
];

// The quick-reply options offered when the manager asks to add a phase, mapped
// to the real participation method the new phase is created with.
const PHASE_METHODS: { label: string; method: ParticipationMethod }[] = [
  { label: 'Information', method: 'information' },
  { label: 'Collect ideas', method: 'ideation' },
  { label: 'Voting', method: 'voting' },
  { label: 'Survey', method: 'native_survey' },
  { label: 'Poll', method: 'poll' },
];

// "add / new / another … phase" — a targeted structural edit, not a redraft.
const isAddPhaseIntent = (text: string) =>
  /\bphases?\b/i.test(text) && /\b(add|new|another|extra|insert|include)\b/i.test(text);

const pulse = keyframes`
  0%, 100% { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12), 0 0 0 0 rgba(4, 77, 108, 0.35); }
  50% { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12), 0 0 0 8px rgba(4, 77, 108, 0); }
`;

const Bar = styled.button<{ $attention: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 999px;
  border: 1px solid ${({ $attention }) => ($attention ? colors.teal400 : colors.grey300)};
  background: ${colors.white};
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  font: inherit;
  color: ${({ $attention }) => ($attention ? colors.textPrimary : colors.grey600)};
  min-width: 320px;
  ${({ $attention }) =>
    $attention &&
    `animation: ${pulse} 1.8s ease-in-out infinite;`}
  &:hover {
    border-color: ${colors.teal400};
  }
`;

const Panel = styled.div`
  width: 600px;
  max-width: calc(100vw - 48px);
  max-height: 72vh;
  display: flex;
  flex-direction: column;
  background: ${colors.white};
  border: 1px solid ${colors.grey300};
  border-radius: 16px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.22);
  overflow: hidden;
`;

const Chip = styled.button`
  appearance: none;
  border: 1px solid ${colors.grey300};
  background: ${colors.white};
  border-radius: 999px;
  padding: 8px 14px;
  font: inherit;
  font-size: 14px;
  color: ${colors.textPrimary};
  cursor: pointer;
  &:hover:not(:disabled) {
    border-color: ${colors.teal400};
    background: ${colors.grey100};
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

type Exchange = { user: string; assistant?: string };

type Props = { project: IProjectData };

const ProjectEditChat = ({ project }: Props) => {
  const projectId = project.id;
  const locale = useLocale();
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { mutateAsync: addProjectGeneration } = useAddProjectGeneration();
  const { mutateAsync: addPhase } = useAddPhase();
  const { data: phases } = usePhases(projectId);

  const nextSteps = project.attributes.ai_generation_summary?.next_steps ?? [];

  const [open, setOpen] = useState(false);
  // The checklist pulses for attention until the manager has opened the panel
  // at least once.
  const [seen, setSeen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [jobStartedAt, setJobStartedAt] = useState<string>();
  const [error, setError] = useState<string>();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  // When the manager asks to add a phase we ask one question (what kind) before
  // doing it; this flag drives the method quick-replies.
  const [awaitingPhaseKind, setAwaitingPhaseKind] = useState(false);

  const title = localize(project.attributes.title_multiloc);
  const preview = localize(project.attributes.description_preview_multiloc);

  const hasPendingSteps = nextSteps.length > 0 && !seen;

  const openPanel = () => {
    setOpen(true);
    setSeen(true);
  };

  const refreshWorkspace = () => {
    queryClient.invalidateQueries({ queryKey: projectsKeys.item({ id: projectId }) });
    queryClient.invalidateQueries({ queryKey: phasesKeys.all() });
    queryClient.invalidateQueries({ queryKey: projectPageLayoutKeys.all() });
    queryClient.invalidateQueries({ queryKey: customFieldsKeys.all() });
    queryClient.invalidateQueries({ queryKey: customFormKeys.all() });
  };

  const toggleStep = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const pushAssistant = (user: string, assistant: string) =>
    setExchanges((prev) => [...prev, { user, assistant }]);

  // A broad reshape: redraft the whole project with the engine (the heavy path).
  const redraft = async (direction: string) => {
    setError(undefined);
    setExchanges((prev) => [...prev, { user: direction }]);
    try {
      const context = [
        `This is an existing project titled "${title}".`,
        preview ? `Its summary: ${preview}` : '',
        'Please revise the whole project with this direction:',
        direction,
      ]
        .filter(Boolean)
        .join('\n');
      await addProjectGeneration({
        projectId,
        prompt: context,
        locale,
        fileIds: [],
        levers: DEFAULT_LEVERS,
      });
      setJobStartedAt(new Date().toISOString());
      setRegenerating(true);
    } catch {
      setError('Something went wrong with that change. Please try again.');
    }
  };

  // A targeted edit: actually add a phase after the last one, no regeneration.
  const addPhaseOfKind = async (label: string, method: ParticipationMethod) => {
    setError(undefined);
    setAwaitingPhaseKind(false);
    setBusy(true);
    try {
      const ends = (phases?.data ?? [])
        .map((p) => p.attributes.end_at)
        .filter((d): d is string => !!d)
        .sort();
      const start = ends.length ? addDays(parseISO(ends[ends.length - 1]), 1) : new Date();
      const end = addDays(start, 13);
      await addPhase({
        projectId,
        placement_type: 'on_timeline',
        participation_method: method,
        title_multiloc: { [locale]: label },
        start_at: format(start, 'yyyy-MM-dd'),
        end_at: format(end, 'yyyy-MM-dd'),
      });
      refreshWorkspace();
      const when = `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
      pushAssistant(
        `${label} phase`,
        `Done — I added a “${label}” phase (${when}) after your last one. You can rename it, move it, or set it up on the timeline.`
      );
    } catch {
      setError('Something went wrong adding the phase. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Route the request: targeted intents are handled directly; everything else
  // is a redraft.
  const send = (text: string) => {
    if (isAddPhaseIntent(text)) {
      setExchanges((prev) => [
        ...prev,
        {
          user: text,
          assistant:
            'Sure — what should this phase do? Pick one and I’ll slot it in after your last phase.',
        },
      ]);
      setAwaitingPhaseKind(true);
      return;
    }
    redraft(text);
  };

  const onComplete = (succeeded: boolean) => {
    refreshWorkspace();
    setRegenerating(false);
    setExchanges((prev) => {
      const last = prev[prev.length - 1];
      if (last && !last.assistant) {
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            assistant: succeeded
              ? 'Done — I’ve redrafted the project. The preview is updated.'
              : 'I’ve redrafted most of it; one or two parts may need a look.',
          },
        ];
      }
      return prev;
    });
  };

  return (
    <Box position="absolute" bottom="20px" left="0" right="0" display="flex" justifyContent="center" zIndex="20">
      {regenerating && jobStartedAt && (
        <GenerationWatcher projectId={projectId} since={jobStartedAt} onComplete={onComplete} />
      )}

      {!open ? (
        <Bar type="button" onClick={openPanel} $attention={hasPendingSteps}>
          <Icon name="stars" width="18px" height="18px" fill={colors.teal500} />
          {hasPendingSteps
            ? `${nextSteps.length} ${nextSteps.length === 1 ? 'thing' : 'things'} to check before publishing`
            : 'Chat to change anything'}
        </Bar>
      ) : (
        <Panel>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p="14px 18px"
            borderBottom={`1px solid ${colors.grey200}`}
            flex="0 0 auto"
          >
            <Box display="flex" alignItems="center" gap="10px" minWidth="0">
              <Icon name="stars" width="18px" height="18px" fill={colors.teal500} />
              <Box minWidth="0">
                <Text m="0px" fontWeight="bold" color="textPrimary">
                  Project assistant
                </Text>
                <Text m="0px" fontSize="s" color="textSecondary" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                  {title}
                </Text>
              </Box>
            </Box>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'inline-flex' }}
              aria-label="Collapse"
            >
              <Icon name="chevron-down" width="18px" height="18px" fill={colors.textSecondary} />
            </button>
          </Box>

          <Box flex="1" minHeight="0" overflowY="auto" p="16px 18px" display="flex" flexDirection="column" gap="14px">
            {/* The before-you-publish checklist, carried over from the draft.
                Shown first so the manager sees what's left to do. */}
            {nextSteps.length > 0 && (
              <Box p="14px 16px" borderRadius="12px" bgColor={colors.grey100}>
                <Text m="0 0 10px" fontSize="s" fontWeight="bold" color="textPrimary">
                  Before you publish
                </Text>
                <Box display="flex" flexDirection="column" gap="10px">
                  {nextSteps.map((step, i) => {
                    const done = checked.has(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleStep(i)}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                          appearance: 'none',
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          textAlign: 'left',
                          cursor: 'pointer',
                          font: 'inherit',
                        }}
                      >
                        <Box
                          flex="0 0 auto"
                          width="16px"
                          height="16px"
                          mt="2px"
                          borderRadius="4px"
                          border={`1.5px solid ${done ? colors.teal400 : colors.grey400}`}
                          bgColor={done ? colors.teal400 : colors.white}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {done && <Icon name="check" width="11px" height="11px" fill="#fff" />}
                        </Box>
                        <Text
                          m="0px"
                          color={done ? 'textSecondary' : 'textPrimary'}
                          lineHeight="1.45"
                          style={done ? { textDecoration: 'line-through' } : undefined}
                        >
                          {step}
                        </Text>
                      </button>
                    );
                  })}
                </Box>
              </Box>
            )}

            <Text m="0px" color="textSecondary" lineHeight="1.5">
              {INTRO}
            </Text>

            {exchanges.map((exchange, i) => (
              <React.Fragment key={i}>
                <Box display="flex" justifyContent="flex-end">
                  <Box maxWidth="85%" p="10px 14px" borderRadius="14px 14px 4px 14px" bgColor={colors.grey100}>
                    <Text m="0px" color="textPrimary" lineHeight="1.5">
                      {exchange.user}
                    </Text>
                  </Box>
                </Box>
                {exchange.assistant && (
                  <Text m="0px" color="textPrimary" lineHeight="1.55">
                    {exchange.assistant}
                  </Text>
                )}
              </React.Fragment>
            ))}

            {/* The one clarifying question for "add a phase": pick a kind and it
                gets created directly. */}
            {awaitingPhaseKind && (
              <Box display="flex" flexWrap="wrap" gap="8px">
                {PHASE_METHODS.map((m) => (
                  <Chip
                    key={m.method}
                    type="button"
                    disabled={busy}
                    onClick={() => addPhaseOfKind(m.label, m.method)}
                  >
                    {m.label}
                  </Chip>
                ))}
              </Box>
            )}

            {regenerating && jobStartedAt && <DraftingProgress startedAt={jobStartedAt} />}

            {!regenerating && !awaitingPhaseKind && exchanges.length === 0 && (
              <Box display="flex" flexWrap="wrap" gap="8px">
                {SUGGESTIONS.map((s) => (
                  <Chip key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </Chip>
                ))}
              </Box>
            )}

            {error && (
              <Text m="0px" color="error">
                {error}
              </Text>
            )}
          </Box>

          <Box flex="0 0 auto" p="12px 18px 16px" borderTop={`1px solid ${colors.grey200}`}>
            <ModalComposer placeholder="Describe a change…" disabled={regenerating || busy} onSend={send} />
          </Box>
        </Panel>
      )}
    </Box>
  );
};

export default ProjectEditChat;
