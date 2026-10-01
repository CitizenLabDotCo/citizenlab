import React, { useRef, useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

import customFieldsKeys from 'api/custom_fields/keys';
import customFormKeys from 'api/custom_form/keys';
import useAddFile from 'api/files/useAddFile';
import phasesKeys from 'api/phases/keys';
import useAddProjectGeneration from 'api/project_generations/useAddProjectGeneration';
import useProjectGenerationJob from 'api/project_generations/useProjectGenerationJob';
import { isProjectGenerationInProgress } from 'api/project_generations/util';
import projectPageLayoutKeys from 'api/project_page_layout/keys';
import projectsKeys from 'api/projects/keys';
import { IProjectData } from 'api/projects/types';

import useLocale from 'hooks/useLocale';
import useOnQuerySuccess from 'hooks/useOnQuerySuccess';

import { useIntl } from 'utils/cl-intl';
import { isCLErrorsWrapper } from 'utils/errorUtils';
import { getBase64FromFile } from 'utils/fileUtils';

import Composer, { MAX_PROMPT_LENGTH } from './Composer';
import GenerationModal from './GenerationModal';
import { DEFAULT_LEVERS, LeverId } from './leverConfig';
import Levers from './Levers';
import messages from './messages';
import Transcript from './Transcript';
import { Exchange } from './types';
import useDemoGeneration from './useDemoGeneration';

// prototype data — staging has no generation engine, so the Draft button plays
// a simulated run (progress modal + result report) instead of calling the API.
// Flip to false to exercise the real backend path (epic preview env).
const DEMO_MODE: boolean = true;

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
  const { mutateAsync: addFile } = useAddFile();
  const { mutateAsync: addProjectGeneration } = useAddProjectGeneration();

  const demo = useDemoGeneration();
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [levers, setLevers] = useState(DEFAULT_LEVERS);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string>();
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

    if (succeeded) {
      refreshWorkspace();
    }
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
      await addProjectGeneration({
        projectId,
        prompt: prompt.trim().slice(0, MAX_PROMPT_LENGTH),
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
    } catch (error) {
      setSendError(getSendErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const busy = sending || !!runningJob || jobsQuery.isLoading;
  const showTranscript = exchanges.length > 0 || !!runningJob;
  const hasInput = prompt.trim() !== '' || files.length > 0;
  const canDraft = hasInput && !busy;

  const setLever = (id: LeverId, value: number) =>
    setLevers((previous) => ({ ...previous, [id]: value }));

  const handleDraft = () => {
    if (DEMO_MODE) {
      demo.start();
      return;
    }
    send();
  };

  return (
    <Box p="20px" display="flex" flexDirection="column" gap="16px">
      <Box display="flex" alignItems="center" gap="10px">
        <Box
          flex="0 0 auto"
          width="36px"
          height="36px"
          borderRadius="50%"
          bgColor={colors.teal50}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon name="stars" width="20px" height="20px" fill={colors.teal500} />
        </Box>
        <Box>
          <Text m="0px" fontSize="l" fontWeight="bold">
            {formatMessage(messages.title)}
          </Text>
          <Text m="0px" fontSize="s" color="textSecondary">
            {formatMessage(messages.tagline)}
          </Text>
        </Box>
      </Box>

      {showTranscript ? (
        <Transcript
          exchanges={exchanges}
          runningJobStartedAt={runningJob?.attributes.created_at}
        />
      ) : (
        <Text m="0px" color="textSecondary">
          {formatMessage(messages.intro)}
        </Text>
      )}

      {!runningJob && (
        <>
          <Composer
            prompt={prompt}
            files={files}
            busy={busy}
            canDraft={canDraft}
            onPromptChange={setPrompt}
            onFilesChange={setFiles}
            onDraft={handleDraft}
          />

          {/* Optional shaping questions appear below the input once there's a
              brief to shape; before that, a quiet teaser so the reveal feels
              intentional. */}
          {hasInput ? (
            <Levers values={levers} disabled={busy} onChange={setLever} />
          ) : (
            <Text m="0px" fontSize="s" color="textSecondary">
              {formatMessage(messages.leversTeaser)}
            </Text>
          )}
        </>
      )}

      {sendError && (
        <Text m="0px" color="error">
          {sendError}
        </Text>
      )}

      <GenerationModal
        status={demo.status}
        steps={demo.steps}
        activeIndex={demo.activeIndex}
        report={demo.report}
        onClose={demo.reset}
      />
    </Box>
  );
};

export default ProjectAssistant;
