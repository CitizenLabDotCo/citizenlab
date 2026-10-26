import React, { useCallback, useEffect, useState } from 'react';

import { Box, Icon, Spinner, Text, colors } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';

import customFieldsKeys from 'api/custom_fields/keys';
import customFormKeys from 'api/custom_form/keys';
import useAddFile from 'api/files/useAddFile';
import phasesKeys from 'api/phases/keys';
import projectGenerationJobKeys from 'api/project_generations/keys';
import useAddProjectGeneration from 'api/project_generations/useAddProjectGeneration';
import projectPageLayoutKeys from 'api/project_page_layout/keys';
import useAddProject from 'api/projects/useAddProject';
import projectsKeys from 'api/projects/keys';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getBase64FromFile } from 'utils/fileUtils';

import Intake from '../ProjectAssistant/Intake';
import {
  INTAKE_QUESTIONS,
  IntakeAnswers,
  IntakeOption,
  IntakeQuestionId,
} from '../ProjectAssistant/intakeConfig';
import { DEFAULT_LEVERS, LeverId } from '../ProjectAssistant/leverConfig';
import ReferenceProjectsControl, {
  ReferenceProject,
} from '../ProjectAssistant/ReferenceProjectsControl';

import DraftingProgress from './DraftingProgress';
import DraftPreviewPane from './DraftPreviewPane';
import GenerationWatcher from './GenerationWatcher';
import ModalComposer from './ModalComposer';
import { INTAKE_LEAD, INTRO, REVIEW_PROMPT } from './script';
import ThinkingDots from './ThinkingDots';

// The AI project assistant as a create-flow modal, wired to the real generation
// pipeline: describe the project → answer a few questions → it creates a draft
// project and calls the engine → watch it draft → review the real result →
// Create project opens it in the normal setup workspace. The intake and its
// answer→levers mapping are reused from the dock, so the questions are the real
// ones and they genuinely shape the generated project.

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
  /* A generous, comfortably-sized dialog through brief/questions/drafting so the
     ~8-question list isn't cramped; the review step widens further into the
     two-pane preview. */
  max-width: ${({ $wide }) => ($wide ? '1160px' : '720px')};
  height: ${({ $wide }) => ($wide ? '88vh' : 'min(88vh, 860px)')};
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

// The assistant is the main path, so the header stays clean — just the title
// and a close. The alternatives (start from scratch, the retiring template
// gallery) sit as quiet links under the composer instead.
const Header = ({ onClose }: { onClose: () => void }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" px="24px" py="18px" flex="0 0 auto">
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
    <button
      type="button"
      onClick={onClose}
      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
      aria-label="Close"
    >
      <Icon name="close" width="18px" height="18px" fill={colors.textSecondary} />
    </button>
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

type Props = {
  onClose: () => void;
  onStartFromScratch: () => void;
  onBrowseTemplates: () => void;
};

const ProjectAssistantModal = ({
  onClose,
  onStartFromScratch,
  onBrowseTemplates,
}: Props) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  const { mutateAsync: addProject } = useAddProject();
  const { mutateAsync: addFile } = useAddFile();
  const { mutateAsync: addProjectGeneration } = useAddProjectGeneration();

  const [phase, setPhase] = useState<Phase>('brief');
  const [brief, setBrief] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const [levers, setLevers] = useState(DEFAULT_LEVERS);
  // Existing projects pulled in as context for the draft (title + summary),
  // read by the engine the same way an attached brief is.
  const [referenceProjects, setReferenceProjects] = useState<ReferenceProject[]>([]);
  const [projectId, setProjectId] = useState<string>();
  const [jobStartedAt, setJobStartedAt] = useState<string>();
  const [starting, setStarting] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState<string>();
  // Redraft exchanges shown in the review conversation.
  const [replies, setReplies] = useState<{ user: string; assistant?: string }[]>([]);
  // The "why these choices" rationale is collapsed by default — the headline and
  // the before-you-publish checklist are what the manager needs first.
  const [showWhy, setShowWhy] = useState(false);
  // A brief "assistant is thinking" beat after the brief is sent, before the
  // questions appear — so the intake reads as generated, not snapped open.
  const [intakeThinking, setIntakeThinking] = useState(false);

  useEffect(() => {
    if (!intakeThinking) return undefined;
    const timer = setTimeout(() => setIntakeThinking(false), 1200);
    return () => clearTimeout(timer);
  }, [intakeThinking]);

  const { data: project } = useProjectById(projectId ?? '');
  const summary = project?.data.attributes.ai_generation_summary ?? null;

  // Keep the job query refetching while a draft is in flight. The shared hook's
  // refetchInterval stops polling the moment it sees no in-progress job — which
  // can happen on the very first fetch if the tracker is not queryable yet,
  // leaving the watcher stuck. Forcing an invalidation every couple of seconds
  // guarantees we keep checking until the run actually completes.
  useEffect(() => {
    if (phase !== 'drafting' || !projectId) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: projectGenerationJobKeys.list({ projectId }),
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [phase, projectId, queryClient]);

  const refreshWorkspace = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.item({ id }) });
      queryClient.invalidateQueries({ queryKey: phasesKeys.all() });
      queryClient.invalidateQueries({ queryKey: projectPageLayoutKeys.all() });
      queryClient.invalidateQueries({ queryKey: customFieldsKeys.all() });
      queryClient.invalidateQueries({ queryKey: customFormKeys.all() });
    },
    [queryClient]
  );

  // The intake answers, turned into the same plain-language brief lines the dock
  // sends, so the engine reads them in the manager's own words.
  const briefSupplement = () =>
    INTAKE_QUESTIONS.flatMap((question) => {
      const answer = answers[question.id];
      const option = question.options.find((o) => o.id === answer?.optionId);
      if (!option) return [];
      const lines: string[] = [];
      const briefText = formatMessage(option.brief).trim();
      if (briefText) lines.push(briefText);
      const detail = answer?.detail?.trim();
      if (detail && question.detailBrief) {
        lines.push(formatMessage(question.detailBrief, { detail }));
      }
      return lines;
    });

  const handleAnswer = (questionId: IntakeQuestionId, option: IntakeOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], optionId: option.id } }));
    if (option.levers) setLevers((prev) => ({ ...prev, ...option.levers }));
  };

  const handleDetail = (questionId: IntakeQuestionId, detail: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], detail } }));

  const setLever = (id: LeverId, value: number) =>
    setLevers((prev) => ({ ...prev, [id]: value }));

  const uploadFile = async (id: string, file: File) =>
    addFile({
      content: await getBase64FromFile(file),
      name: file.name,
      project: id,
      category: 'other',
      ai_processing_allowed: true,
    });

  const buildPrompt = (direction?: string) => {
    const sections = [brief.trim()];
    const supplement = briefSupplement();
    if (supplement.length) sections.push('', ...supplement);
    if (referenceProjects.length) {
      sections.push(
        '',
        'Use these existing projects as reference for style, structure and tone where they fit:'
      );
      referenceProjects.forEach((project) =>
        sections.push(`- ${project.title}: ${project.description}`)
      );
    }
    if (direction) {
      sections.push('', 'Please revise the previous draft with this direction:', direction);
    }
    return sections.join('\n');
  };

  // Create the draft project, upload any files, and kick off the real engine.
  const startDraft = async () => {
    setError(undefined);
    setStarting(true);
    try {
      const titleGuess = brief.split('\n')[0].trim().slice(0, 80) || 'New project';
      const created = await addProject({
        title_multiloc: { [locale]: titleGuess },
        admin_publication_attributes: { publication_status: 'draft' },
      } as any);
      const id = created.data.id;
      setProjectId(id);

      const uploads = await Promise.all(files.map((file) => uploadFile(id, file)));
      const fileIds = uploads.map((upload) => upload.data.id);

      await addProjectGeneration({ projectId: id, prompt: buildPrompt(), locale, fileIds, levers });
      setJobStartedAt(new Date().toISOString());
      setPhase('drafting');
    } catch {
      setError('Something went wrong starting the draft. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  // Redraft the existing project with more direction (from the review composer).
  const redraft = async (direction: string) => {
    if (!projectId) return;
    setError(undefined);
    setReplies((prev) => [...prev, { user: direction }]);
    try {
      await addProjectGeneration({ projectId, prompt: buildPrompt(direction), locale, fileIds: [], levers });
      setJobStartedAt(new Date().toISOString());
      setPhase('drafting');
    } catch {
      setError('Something went wrong with that change. Please try again.');
    }
  };

  const handleGenerationComplete = useCallback(
    (succeeded: boolean) => {
      if (projectId) refreshWorkspace(projectId);
      setReplies((prev) => {
        const last = prev[prev.length - 1];
        if (last && !last.assistant) {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              assistant: succeeded
                ? 'Done — I’ve updated the draft on the right.'
                : 'I’ve updated most of the draft; one or two parts need a look on the right.',
            },
          ];
        }
        return prev;
      });
      setPhase('review');
    },
    [projectId, refreshWorkspace]
  );

  const openProject = () => {
    if (!projectId) return;
    setNavigating(true);
    clHistory.push(adminProjectsProjectPath(projectId));
    onClose();
  };

  // The modal stays a single narrow chat column through the questions AND the
  // drafting steps; it only expands to the two-pane preview once the draft is
  // ready to show (the review step).
  const wide = phase === 'review';

  // The intake choices, shown back as tags on the preview so the manager sees
  // what the draft was shaped around.
  const chosenTags = INTAKE_QUESTIONS.flatMap((question) => {
    const answer = answers[question.id];
    const option = question.options.find((o) => o.id === answer?.optionId);
    return option ? [formatMessage(option.label)] : [];
  });

  const conversation = (
    <>
      <Header onClose={onClose} />

      <Box flex="1" minHeight="0" overflowY="auto" px="24px" pb="20px" display="flex" flexDirection="column" gap="18px">
        {phase === 'brief' && <AssistantLine>{INTRO}</AssistantLine>}

        {phase !== 'brief' && (
          <>
            {brief && <UserBubble text={brief} />}

            {/* Once drafting starts, the choices the manager made in the intake
                are shown back as their own "turn" — aligned right like a sent
                message — so the thread keeps flowing into the drafting step
                rather than swapping to a blank progress screen. */}
            {(phase === 'drafting' || phase === 'review') && chosenTags.length > 0 && (
              <Box display="flex" justifyContent="flex-end">
                <Box maxWidth="85%" display="flex" flexWrap="wrap" gap="6px" justifyContent="flex-end">
                  {chosenTags.map((tag) => (
                    <Box
                      key={tag}
                      px="10px"
                      py="4px"
                      borderRadius="999px"
                      bgColor={colors.grey100}
                    >
                      <Text m="0px" fontSize="s" color="textSecondary">
                        {tag}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {phase === 'drafting' && (
              <AssistantLine>
                Perfect — I’ve got what I need. Give me a moment while I pull this
                together.
              </AssistantLine>
            )}

            {phase === 'question' &&
              (intakeThinking ? (
                <ThinkingDots />
              ) : (
                <>
                  <AssistantLine>{INTAKE_LEAD}</AssistantLine>
                  <Intake
                    answers={answers}
                    levers={levers}
                    disabled={starting}
                    onAnswer={handleAnswer}
                    onDetail={handleDetail}
                    onLeverChange={setLever}
                  />
                </>
              ))}

            {(phase === 'drafting' || phase === 'review') && jobStartedAt && (
              <DraftingProgress startedAt={jobStartedAt} done={phase === 'review'} />
            )}

            {phase === 'review' && (
              <>
                {summary?.headline && (
                  <Box p="16px 18px" borderRadius="14px" bgColor={colors.grey100}>
                    <Text m="0 0 8px" fontWeight="bold" color="textPrimary">
                      Here is what I did
                    </Text>
                    <Text m="0px" color="textPrimary" lineHeight="1.5">
                      {summary.headline}
                    </Text>

                    {/* The before-you-publish checklist deliberately does NOT
                        live here — it surfaces on the project workspace after
                        "Create project", where the manager actually does the
                        work (see ProjectEditChat). This card stays a short
                        explanation of what was drafted. */}

                    {/* The "why" rationale, collapsed by default so the card
                        stays short — expandable for the manager who wants it. */}
                    {summary.highlights && summary.highlights.length > 0 && (
                      <Box mt="14px" pt="14px" borderTop={`1px solid ${colors.grey300}`}>
                        <LinkButton
                          type="button"
                          onClick={() => setShowWhy((show) => !show)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          Why these choices
                          <Icon
                            name={showWhy ? 'chevron-up' : 'chevron-down'}
                            width="12px"
                            height="12px"
                            fill={colors.teal700}
                          />
                        </LinkButton>
                        {showWhy && (
                          <Box
                            as="ul"
                            m="10px 0 0"
                            pl="18px"
                            display="flex"
                            flexDirection="column"
                            gap="8px"
                          >
                            {summary.highlights.map((point, i) => (
                              <Text
                                key={i}
                                as="li"
                                m="0px"
                                color="textSecondary"
                                lineHeight="1.5"
                              >
                                {point}
                              </Text>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}

                <AssistantLine>{REVIEW_PROMPT}</AssistantLine>

                {replies.map((r, i) => (
                  <React.Fragment key={i}>
                    <UserBubble text={r.user} />
                    {r.assistant && <AssistantLine>{r.assistant}</AssistantLine>}
                  </React.Fragment>
                ))}
              </>
            )}

            {error && (
              <Text m="0px" color="error">
                {error}
              </Text>
            )}
          </>
        )}
      </Box>

      {phase === 'question' && (
        <Box flex="0 0 auto" p="16px 24px 24px" borderTop={`1px solid ${colors.grey200}`}>
          <ButtonWithLink type="button" width="100%" icon="stars" onClick={startDraft} processing={starting} disabled={starting}>
            Draft my project
          </ButtonWithLink>
        </Box>
      )}

      {phase === 'review' && (
        <Box flex="0 0 auto" p="16px 24px 24px">
          <ModalComposer placeholder="Tell me what to change…" onSend={redraft} />
        </Box>
      )}

      {phase === 'brief' && (
        <Box flex="0 0 auto" p="16px 24px 24px" display="flex" flexDirection="column" gap="12px">
          <ReferenceProjectsControl
            selected={referenceProjects}
            onChange={setReferenceProjects}
            excludeProjectId={projectId ?? ''}
          />
          <ModalComposer
            placeholder="Chat to create"
            files={files}
            onFilesChange={setFiles}
            onSend={(text) => {
              setBrief(text);
              setIntakeThinking(true);
              setPhase('question');
            }}
          />
          {/* The escape hatches from the AI flow: quiet links under the
              composer, not competing with it. Scratch leads to the blank
              builder; template opens the existing (retiring) gallery. */}
          <Box display="flex" justifyContent="center" alignItems="center" gap="10px">
            <LinkButton type="button" onClick={onStartFromScratch}>
              Start from scratch
            </LinkButton>
            <Text m="0px" fontSize="s" color="textSecondary">
              ·
            </Text>
            <LinkButton
              type="button"
              onClick={onBrowseTemplates}
              style={{ color: colors.textSecondary, fontWeight: 400 }}
            >
              Start from a template
            </LinkButton>
          </Box>
        </Box>
      )}
    </>
  );

  return (
    <Scrim onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Shell $wide={wide}>
        {projectId && phase === 'drafting' && jobStartedAt && (
          <GenerationWatcher projectId={projectId} since={jobStartedAt} onComplete={handleGenerationComplete} />
        )}

        {wide ? (
          <>
            <Box flex="0 0 520px" display="flex" flexDirection="column" minHeight="0" borderRight={`1px solid ${colors.grey200}`}>
              {conversation}
            </Box>
            <Box flex="1" minWidth="0" display="flex" flexDirection="column" minHeight="0" bgColor={colors.grey50}>
              {phase === 'review' && projectId ? (
                <>
                  <Box flex="1" minHeight="0">
                    <DraftPreviewPane projectId={projectId} tags={chosenTags} />
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
                    <ButtonWithLink buttonStyle="admin-dark" onClick={openProject} processing={navigating}>
                      Create project
                    </ButtonWithLink>
                  </Box>
                </>
              ) : (
                <Box flex="1" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap="16px">
                  <Spinner />
                  <Text m="0px" color="textSecondary">
                    Assembling your project…
                  </Text>
                </Box>
              )}
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
