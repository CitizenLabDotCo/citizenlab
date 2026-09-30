import React, { useRef, useState } from 'react';

import {
  Box,
  Icon,
  Text,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import customFieldsKeys from 'api/custom_fields/keys';
import customFormKeys from 'api/custom_form/keys';
import useAddFile from 'api/files/useAddFile';
import phasesKeys from 'api/phases/keys';
import { IPhaseData } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';
import useAddSurveyGeneration from 'api/survey_generations/useAddSurveyGeneration';
import useSurveyGenerationJob from 'api/survey_generations/useSurveyGenerationJob';
import { isSurveyGenerationInProgress } from 'api/survey_generations/util';

import useLocale from 'hooks/useLocale';
import useOnQuerySuccess from 'hooks/useOnQuerySuccess';

import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isCLErrorsWrapper } from 'utils/errorUtils';
import { getBase64FromFile } from 'utils/fileUtils';

import Composer, { MAX_PROMPT_LENGTH } from './Composer';
import ConfirmGenerationModal from './ConfirmGenerationModal';
import EmptyState from './EmptyState';
import messages from './messages';
import Transcript from './Transcript';
import { Exchange } from './types';

// The survey is saved through a tool that only changes draft projects, except on
// demo and trial platforms.
const PUBLISHED_WRITABLE_LIFECYCLES = ['demo', 'trial'];

const getErrorCode = (error: unknown) =>
  isCLErrorsWrapper(error)
    ? Object.values(error.errors).flat().at(0)?.error
    : undefined;

type Props = {
  phase: IPhaseData;
  totalSubmissions: number;
  onSurveyGenerated: () => void;
};

const SurveyGenerator = ({
  phase,
  totalSubmissions,
  onSurveyGenerated,
}: Props) => {
  const phaseId = phase.id;
  const projectId = phase.relationships.project.data.id;
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  const { data: project } = useProjectById(projectId);
  const { data: appConfiguration } = useAppConfiguration();
  const jobsQuery = useSurveyGenerationJob(phaseId);
  const { mutateAsync: addFile } = useAddFile();
  const { mutateAsync: addSurveyGeneration } = useAddSurveyGeneration();

  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [confirmOpened, setConfirmOpened] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string>();
  // The running job this panel has seen, so that its completion is handled once.
  const watchedJobIdRef = useRef<string>();

  const newestJob = jobsQuery.data?.data.at(0);
  const runningJob = isSurveyGenerationInProgress(newestJob)
    ? newestJob
    : undefined;
  const lastExchange = exchanges.at(-1);

  const refreshBuilder = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: customFieldsKeys.all() }),
      queryClient.invalidateQueries({ queryKey: customFormKeys.all() }),
      queryClient.invalidateQueries({ queryKey: phasesKeys.item({ phaseId }) }),
    ]);
    onSurveyGenerated();
  };

  useOnQuerySuccess(jobsQuery, () => {
    if (!newestJob) return;

    if (isSurveyGenerationInProgress(newestJob)) {
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
      refreshBuilder();
    }
  });

  if (!project || !appConfiguration) return null;

  const lifecycleStage =
    appConfiguration.data.attributes.settings.core.lifecycle_stage;
  const isWritable =
    project.data.attributes.publication_status === 'draft' ||
    PUBLISHED_WRITABLE_LIFECYCLES.includes(lifecycleStage);
  const getLockedMessage = () => {
    if (totalSubmissions > 0) return messages.hasResponses;
    if (!isWritable) return messages.projectNotDraft;
    return undefined;
  };
  const lockedMessage = getLockedMessage();

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
      case 'too_long':
        return formatMessage(messages.errorPromptTooLong, {
          count: MAX_PROMPT_LENGTH,
        });
      default:
        return formatMessage(messages.errorGeneric);
    }
  };

  const send = async () => {
    setConfirmOpened(false);
    setSendError(undefined);
    setSending(true);

    try {
      const uploads = await Promise.allSettled(files.map(uploadFile));
      const failedIndex = uploads.findIndex(
        (upload) => upload.status === 'rejected'
      );
      if (failedIndex !== -1) {
        setSendError(
          formatMessage(messages.errorUpload, {
            fileName: files[failedIndex].name,
          })
        );
        return;
      }

      const fileIds = uploads.flatMap((upload) =>
        upload.status === 'fulfilled' ? [upload.value.data.id] : []
      );
      await addSurveyGeneration({
        phaseId,
        prompt: prompt.trim(),
        locale,
        fileIds,
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

  const showTranscript = exchanges.length > 0 || !!runningJob;

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={`calc(100vh - ${stylingConsts.menuHeight}px)`}
      p="20px"
      bgColor={colors.white}
      borderLeft={`1px solid ${colors.borderLight}`}
    >
      <Box display="flex" alignItems="center" gap="8px" mb="16px">
        <Icon name="stars" fill={colors.teal400} />
        <Title variant="h3" m="0px">
          <FormattedMessage {...messages.title} />
        </Title>
      </Box>
      <Box flex="1" overflowY="auto">
        {showTranscript ? (
          <Transcript
            exchanges={exchanges}
            runningJobStartedAt={runningJob?.attributes.created_at}
          />
        ) : (
          !lockedMessage && <EmptyState onSelectStarter={setPrompt} />
        )}
      </Box>
      <Box mt="16px">
        {lockedMessage ? (
          <Warning>
            <FormattedMessage {...lockedMessage} />
          </Warning>
        ) : (
          <Composer
            prompt={prompt}
            files={files}
            busy={sending || !!runningJob || jobsQuery.isLoading}
            onPromptChange={setPrompt}
            onFilesChange={setFiles}
            onSend={() => setConfirmOpened(true)}
          />
        )}
        {sendError && (
          <Text m="0px" mt="8px" color="error">
            {sendError}
          </Text>
        )}
      </Box>
      <ConfirmGenerationModal
        opened={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        onConfirm={send}
      />
    </Box>
  );
};

export default SurveyGenerator;
