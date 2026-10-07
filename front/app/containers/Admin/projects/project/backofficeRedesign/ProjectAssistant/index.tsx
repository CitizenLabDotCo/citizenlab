import React, { useRef, useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

import customFieldsKeys from 'api/custom_fields/keys';
import customFormKeys from 'api/custom_form/keys';
import useAddFile from 'api/files/useAddFile';
import phasesKeys from 'api/phases/keys';
import usePhases from 'api/phases/usePhases';
import useAddProjectGeneration from 'api/project_generations/useAddProjectGeneration';
import useProjectGenerationJob from 'api/project_generations/useProjectGenerationJob';
import { isProjectGenerationInProgress } from 'api/project_generations/util';
import projectPageLayoutKeys from 'api/project_page_layout/keys';
import projectsKeys from 'api/projects/keys';
import { IProjectData } from 'api/projects/types';

import useLocale from 'hooks/useLocale';
import useOnQuerySuccess from 'hooks/useOnQuerySuccess';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isCLErrorsWrapper } from 'utils/errorUtils';
import { getBase64FromFile } from 'utils/fileUtils';

import Composer, { MAX_PROMPT_LENGTH } from './Composer';
import GenerationPanel from './GenerationPanel';
import ReferenceProjectsControl, {
  ReferenceProject,
} from './ReferenceProjectsControl';
import DraftReview from './DraftReview';
import Intake from './Intake';
import {
  INTAKE_QUESTIONS,
  IntakeAnswers,
  IntakeOption,
  IntakeQuestionId,
} from './intakeConfig';
import { DEFAULT_LEVERS, LeverId } from './leverConfig';
import messages from './messages';
import Transcript from './Transcript';
import { Exchange } from './types';
import useDemoGeneration from './useDemoGeneration';
import UserMessage from './UserMessage';

// By default the Draft button plays a simulated run (progress + result report)
// so the preview link always shows the polished experience. Add `?live` to the
// URL to exercise the real backend generation end to end instead.
const DEMO_MODE =
  typeof window === 'undefined' ||
  !new URLSearchParams(window.location.search).has('live');

const getErrorCode = (error: unknown) =>
  isCLErrorsWrapper(error)
    ? Object.values(error.errors).flat().at(0)?.error
    : undefined;

type Props = {
  project: IProjectData;
};

const ProjectAssistant = ({ project }: Props) => {
  const projectId = project.id;
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  const jobsQuery = useProjectGenerationJob(projectId);
  const { data: phases } = usePhases(projectId);
  const { mutateAsync: addFile } = useAddFile();
  const { mutateAsync: addProjectGeneration } = useAddProjectGeneration();

  const demo = useDemoGeneration();
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [referenceProjects, setReferenceProjects] = useState<ReferenceProject[]>(
    []
  );
  const [levers, setLevers] = useState(DEFAULT_LEVERS);
  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string>();
  // A project that already has phases was generated (or built) before, so a new
  // run is a full re-generation — it replaces everything. Ask once to confirm.
  const [confirmingRegen, setConfirmingRegen] = useState(false);
  // After a draft lands, the manager can redraft with more direction; this box's
  // text (plus any added context) drives a fresh, replacing generation.
  const [refineText, setRefineText] = useState('');
  // The running job this panel has seen, so that its completion is handled once.
  const watchedJobIdRef = useRef<string>();

  const newestJob = jobsQuery.data?.data.at(0);
  const runningJob = isProjectGenerationInProgress(newestJob)
    ? newestJob
    : undefined;
  const lastExchange = exchanges.at(-1);

  // The generated project lands in the real workspace surfaces, so refresh them.
  const refreshWorkspace = () => {
    queryClient.invalidateQueries({
      queryKey: projectsKeys.item({ id: projectId }),
    });
    queryClient.invalidateQueries({ queryKey: phasesKeys.all() });
    queryClient.invalidateQueries({ queryKey: projectPageLayoutKeys.all() });
    queryClient.invalidateQueries({ queryKey: customFieldsKeys.all() });
    queryClient.invalidateQueries({ queryKey: customFormKeys.all() });
  };

  useOnQuerySuccess(jobsQuery, () => {
    if (!newestJob) return;

    if (isProjectGenerationInProgress(newestJob)) {
      watchedJobIdRef.current = newestJob.id;
      return;
    }

    const startedByLastExchange =
      !!lastExchange &&
      !lastExchange.outcome &&
      newestJob.id !== lastExchange.previousJobId;
    const isWatched = watchedJobIdRef.current === newestJob.id;
    if (newestJob.attributes.completed_at === null) return;
    if (!startedByLastExchange && !isWatched) return;

    watchedJobIdRef.current = undefined;
    const succeeded = newestJob.attributes.error_count === 0;

    if (startedByLastExchange) {
      setExchanges((previous) =>
        previous.map((exchange) =>
          exchange.id === lastExchange.id
            ? { ...exchange, outcome: succeeded ? 'succeeded' : 'failed' }
            : exchange
        )
      );
    }

    // Refresh even on partial failure: the generator usually persists most of
    // the project (phases, survey, page) before a non-fatal tool error, so the
    // workspace should always reflect what was actually created — not stay on
    // the pre-generation empty state until a manual reload.
    refreshWorkspace();
  });

  const uploadFile = async (file: File) =>
    addFile({
      content: await getBase64FromFile(file),
      name: file.name,
      project: projectId,
      category: 'other',
      ai_processing_allowed: true,
    });

  const getSendErrorMessage = (error: unknown) => {
    switch (getErrorCode(error)) {
      case 'generation_in_progress':
        return formatMessage(messages.errorInProgress);
      case 'ai_processing_not_allowed':
        return formatMessage(messages.errorAiProcessingNotAllowed);
      case 'unsupported_file_type':
        return formatMessage(messages.errorUnsupportedFileType);
      default:
        return formatMessage(messages.errorGeneric);
    }
  };

  const send = async () => {
    setSendError(undefined);
    setSending(true);

    try {
      const uploads = await Promise.allSettled(files.map(uploadFile));
      const failedIndex = uploads.findIndex(
        (upload) => upload.status === 'rejected'
      );
      if (failedIndex !== -1) {
        setSendError(
          formatMessage(messages.errorUpload, { fileName: files[failedIndex].name })
        );
        return;
      }

      const fileIds = uploads.flatMap((upload) =>
        upload.status === 'fulfilled' ? [upload.value.data.id] : []
      );
      // The intake answers ride along as plain-language context appended to the
      // brief, so the engine reads them in the same words the manager would use.
      const extra = briefSupplement();
      // Selected platform projects ride along as reference context, in the same
      // plain words a manager would use ("make one like these").
      const referenceLines = referenceProjects.length
        ? [
            'Use these existing projects on the platform as reference and context:',
            ...referenceProjects.map((reference) =>
              reference.description
                ? `- ${reference.title}: ${reference.description}`
                : `- ${reference.title}`
            ),
          ]
        : [];
      const sections = [prompt.trim()];
      if (extra.length) sections.push('', ...extra);
      if (referenceLines.length) sections.push('', ...referenceLines);
      const fullPrompt = sections.join('\n').slice(0, MAX_PROMPT_LENGTH);
      await addProjectGeneration({
        projectId,
        prompt: fullPrompt,
        locale,
        fileIds,
        levers,
      });

      setExchanges((previous) => [
        ...previous,
        {
          id: String(Date.now()),
          prompt: prompt.trim(),
          fileNames: files.map((file) => file.name),
          previousJobId: newestJob?.id,
        },
      ]);
      setPrompt('');
      setFiles([]);
      setReferenceProjects([]);
      // A fresh brief starts a fresh conversation.
      setAnswers({});
      setLevers(DEFAULT_LEVERS);
    } catch (error) {
      setSendError(getSendErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  // On staging the Draft button plays a simulated run instead of hitting the
  // backend; these mirror the live running/succeeded states so the panel below
  // renders the same way for both.
  const demoRunning = demo.status === 'running';
  const demoDone = demo.status === 'done';

  const busy = sending || !!runningJob || jobsQuery.isLoading;
  const showTranscript = exchanges.length > 0 || !!runningJob;
  const hasInput = prompt.trim() !== '' || files.length > 0;
  const canDraft = hasInput && !busy;
  const hasExistingContent = (phases?.data.length ?? 0) > 0;
  // Once a draft has landed this session, the panel switches from the brief
  // composer to the review surface: the assistant's summary of what it built
  // (+ why), the review links, and a box to redraft with more direction.
  const hasDraft = demoDone || lastExchange?.outcome === 'succeeded';
  const showDraftReview = hasDraft && !runningJob && !sending;

  const setLever = (id: LeverId, value: number) =>
    setLevers((previous) => ({ ...previous, [id]: value }));

  // Picking an answer records it and nudges the structural dials it implies.
  const handleAnswer = (questionId: IntakeQuestionId, option: IntakeOption) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: { ...previous[questionId], optionId: option.id },
    }));
    if (option.levers) {
      setLevers((previous) => ({ ...previous, ...option.levers }));
    }
  };

  const handleDetail = (questionId: IntakeQuestionId, detail: string) =>
    setAnswers((previous) => ({
      ...previous,
      [questionId]: { ...previous[questionId], detail },
    }));

  // The answered questions, turned into plain-language lines for the brief.
  const briefSupplement = () =>
    INTAKE_QUESTIONS.flatMap((question) => {
      const answer = answers[question.id];
      const option = question.options.find((o) => o.id === answer?.optionId);
      if (!option) return [];
      // Some options (e.g. "No", "Nothing in particular") carry an empty brief —
      // they record an answer without adding a line. Drop those blanks.
      const lines: string[] = [];
      const briefText = formatMessage(option.brief).trim();
      if (briefText) lines.push(briefText);
      const detail = answer?.detail?.trim();
      if (detail && question.detailBrief) {
        lines.push(formatMessage(question.detailBrief, { detail }));
      }
      return lines;
    });

  const handleDraft = () => {
    // On a project that already has content, the first click arms a confirm —
    // re-generating fully replaces the current page, phases and survey.
    if (hasExistingContent && !confirmingRegen) {
      setConfirmingRegen(true);
      return;
    }
    setConfirmingRegen(false);
    if (DEMO_MODE) {
      demo.start();
      return;
    }
    send();
  };

  // The redraft button: on staging it replays the simulated run; live, it
  // sends the brief + new direction back to the engine.
  const handleRegenerate = () => {
    if (DEMO_MODE) {
      setRefineText('');
      setReferenceProjects([]);
      demo.start();
      return;
    }
    regenerateWithChanges();
  };

  // Redraft with more direction: the original brief plus the manager's new
  // direction and any added reference projects go back as a fresh, replacing
  // run. The direction shows as the next message in the conversation.
  const regenerateWithChanges = async () => {
    setSendError(undefined);
    setSending(true);
    try {
      const feedback = refineText.trim();
      const originalBrief = exchanges[0]?.prompt ?? '';
      const referenceLines = referenceProjects.length
        ? [
            'Use these existing projects on the platform as reference and context:',
            ...referenceProjects.map((reference) =>
              reference.description
                ? `- ${reference.title}: ${reference.description}`
                : `- ${reference.title}`
            ),
          ]
        : [];
      const sections = [originalBrief];
      if (feedback) {
        sections.push('', 'Please revise the previous draft with this direction:', feedback);
      }
      if (referenceLines.length) sections.push('', ...referenceLines);
      const fullPrompt = sections.join('\n').slice(0, MAX_PROMPT_LENGTH);
      await addProjectGeneration({
        projectId,
        prompt: fullPrompt,
        locale,
        fileIds: [],
        levers,
      });
      setExchanges((previous) => [
        ...previous,
        {
          id: String(Date.now()),
          prompt: feedback || 'Regenerate the project',
          fileNames: [],
          previousJobId: newestJob?.id,
        },
      ]);
      setRefineText('');
      setReferenceProjects([]);
    } catch (error) {
      setSendError(getSendErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <Box p="20px" display="flex" flexDirection="column" gap="20px">
      <Box
        display="flex"
        alignItems="center"
        gap="12px"
        pb="16px"
        borderBottom={`1px solid ${colors.grey200}`}
      >
        <Box
          flex="0 0 auto"
          width="40px"
          height="40px"
          borderRadius="50%"
          bgColor={colors.teal50}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon name="stars" width="22px" height="22px" fill={colors.teal500} />
        </Box>
        <Box>
          <Text m="0px" fontSize="l" fontWeight="bold" lineHeight="1.2">
            {formatMessage(messages.title)}
          </Text>
          <Text m="0px" fontSize="s" color="textSecondary" lineHeight="1.3">
            {formatMessage(messages.tagline)}
          </Text>
        </Box>
      </Box>

      {demoRunning ? (
        /* Progress lives inline in the dock, as the assistant's reply to the
           brief — not a modal that would cover the project page. */
        <GenerationPanel
          steps={demo.steps}
          activeIndex={demo.activeIndex}
          prompt={prompt}
          fileNames={files.map((file) => file.name)}
        />
      ) : (
        <>
          {showTranscript ? (
            <Transcript
              exchanges={exchanges}
              runningJobStartedAt={runningJob?.attributes.created_at}
            />
          ) : (
            !hasDraft && (
              <Text m="0px" color="textSecondary" lineHeight="1.55">
                {formatMessage(messages.intro)}
              </Text>
            )
          )}

          {/* The simulated run has no live transcript, so show the brief as the
              manager's own message above the summary, as the live flow does. */}
          {demoDone && (prompt.trim() !== '' || files.length > 0) && (
            <UserMessage
              prompt={prompt.trim()}
              fileNames={files.map((file) => file.name)}
            />
          )}

          {/* After a draft lands: the assistant's summary of what it built and
              why + the review links, then a box to redraft with more direction. */}
          {showDraftReview && (
            <DraftReview
              projectId={projectId}
              demoReport={demoDone ? demo.report : undefined}
            />
          )}

          {hasDraft && !runningJob && (
            <Box display="flex" flexDirection="column" gap="10px">
              <Text m="0px" fontSize="s" color="textSecondary" lineHeight="1.5">
                Not quite right? Give me more direction or context and I’ll redraft
                the whole project.
              </Text>
              <textarea
                value={refineText}
                onChange={(event) => setRefineText(event.target.value)}
                placeholder="e.g. focus on young families, make the survey shorter, add an in-person workshop"
                rows={3}
                disabled={sending}
                style={{
                  width: '100%',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.grey300}`,
                  resize: 'vertical',
                }}
              />
              <ReferenceProjectsControl
                selected={referenceProjects}
                onChange={setReferenceProjects}
                excludeProjectId={projectId}
                disabled={sending}
              />
              <Box
                p="10px 12px"
                borderRadius="8px"
                style={{ background: '#FFF4E5', border: '1px solid #F5C87E' }}
              >
                <Text m="0px" fontSize="s" color="textPrimary">
                  ⚠️ Regenerating replaces the whole project — the current page,
                  phases and survey.
                </Text>
              </Box>
              <ButtonWithLink
                type="button"
                width="100%"
                icon="stars"
                onClick={handleRegenerate}
                processing={sending}
                disabled={sending}
              >
                Regenerate project
              </ButtonWithLink>
            </Box>
          )}

          {!runningJob && !hasDraft && (
            <>
              <Composer
                prompt={prompt}
                files={files}
                busy={busy}
                onPromptChange={setPrompt}
                onFilesChange={setFiles}
              />

              <ReferenceProjectsControl
                selected={referenceProjects}
                onChange={setReferenceProjects}
                excludeProjectId={projectId}
                disabled={busy}
              />

              {/* The conversational intake opens once there's a brief to shape;
                  before that, a quiet teaser so the reveal feels intentional.
                  Keyed by the round so each new brief starts a fresh chat. */}
              {hasInput ? (
                <Intake
                  key={exchanges.length}
                  answers={answers}
                  levers={levers}
                  disabled={busy}
                  onAnswer={handleAnswer}
                  onDetail={handleDetail}
                  onLeverChange={setLever}
                />
              ) : (
                <Text m="0px" fontSize="s" color="textSecondary">
                  {formatMessage(messages.leversTeaser)}
                </Text>
              )}

              {/* Draft is the final commit, after the shaping choices. On a
                  project that already has content it becomes a guarded
                  re-generate: the first click arms the warning below. */}
              {confirmingRegen && (
                <Box
                  p="12px"
                  borderRadius="8px"
                  style={{ background: '#FFF4E5', border: '1px solid #F5C87E' }}
                >
                  <Text m="0px" fontSize="s" color="textPrimary">
                    ⚠️ This fully regenerates the project — the current page,
                    phases and survey will be replaced.
                  </Text>
                </Box>
              )}
              <ButtonWithLink
                type="button"
                width="100%"
                icon="stars"
                onClick={handleDraft}
                disabled={!canDraft}
                processing={busy}
              >
                {confirmingRegen ? (
                  'Yes, regenerate everything'
                ) : hasExistingContent ? (
                  'Regenerate project'
                ) : (
                  <FormattedMessage {...messages.draftButton} />
                )}
              </ButtonWithLink>
              {confirmingRegen && (
                <button
                  type="button"
                  onClick={() => setConfirmingRegen(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: colors.textSecondary,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
              )}
            </>
          )}

          {sendError && (
            <Text m="0px" color="error">
              {sendError}
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

export default ProjectAssistant;
