import { useState } from 'react';

import { getToolCalls } from 'api/ai_assistant_conversations/constructTranscript';
import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import useAddAiAssistantConversation from 'api/ai_assistant_conversations/useAddAiAssistantConversation';
import useAddAiAssistantMessage from 'api/ai_assistant_messages/useAddAiAssistantMessage';
import useRejectAiAssistantToolCall from 'api/ai_assistant_tool_calls/useRejectAiAssistantToolCall';
import useAddProject from 'api/projects/useAddProject';

import useLocale from 'hooks/useLocale';

import {
  getErrorMessage,
  getRequestErrorCode,
} from 'components/AiAssistant/errors';
import assistantMessages from 'components/AiAssistant/messages';
import { hasOpenQuestions } from 'components/AiAssistant/questions';
import useUploadAssistantFiles from 'components/AiAssistant/useUploadAssistantFiles';

import { useIntl } from 'utils/cl-intl';

import { getProposedChanges } from '../draft';
import messages from '../messages';

type Parameters = {
  projectId?: string;
  isNewProject: boolean;
  conversation?: IAiAssistantConversation;
  onProjectCreated: (projectId: string) => void;
};

// Sends what the admin writes: a first message, a reply, or a request to refine a proposed change.
const useGeneratorChat = ({
  projectId,
  isNewProject,
  conversation,
  onProjectCreated,
}: Parameters) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { mutateAsync: addProject } = useAddProject();
  const { mutateAsync: addConversation } = useAddAiAssistantConversation();
  const { mutateAsync: addMessage } = useAddAiAssistantMessage();
  const { mutateAsync: reject } = useRejectAiAssistantToolCall();
  const { uploadFiles, deleteUploads } = useUploadAssistantFiles();

  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string>();

  const status = conversation?.data.attributes.status;
  const hasMessages =
    (conversation?.data.relationships.messages.data.length ?? 0) > 0;
  const toolCalls = conversation ? getToolCalls(conversation) : [];
  const waitingForAdmin = status === 'awaiting_user';
  const proposedChanges = waitingForAdmin ? getProposedChanges(toolCalls) : [];
  const openQuestions = waitingForAdmin && hasOpenQuestions(toolCalls);
  // While one proposed change waits, what the admin writes is a request to refine it.
  const changeToRefine =
    !openQuestions && proposedChanges.length === 1
      ? proposedChanges[0]
      : undefined;
  const blocked = status === 'running' || (waitingForAdmin && !changeToRefine);

  const getAwaitingHint = () => {
    if (!waitingForAdmin) return undefined;
    if (openQuestions) return assistantMessages.awaitingAnswersHint;
    return changeToRefine
      ? messages.awaitingOneHint
      : messages.awaitingManyHint;
  };

  const getPlaceholder = () => {
    if (changeToRefine) return formatMessage(messages.refinePlaceholder);
    if (hasMessages) return undefined;
    return formatMessage(
      isNewProject ? messages.briefPlaceholder : messages.editPlaceholder
    );
  };

  // For a new project, the first message creates the untitled draft the assistant works on.
  const startDraft = async () => {
    const draftProjectId =
      projectId ??
      (
        await addProject({
          title_multiloc: { [locale]: formatMessage(messages.untitledProject) },
          admin_publication_attributes: { publication_status: 'draft' },
        })
      ).data.id;
    if (!projectId) onProjectCreated(draftProjectId);

    const conversationId =
      conversation?.data.id ??
      (
        await addConversation({
          surfaceKey: 'project_generator',
          subjectId: draftProjectId,
          locale,
        })
      ).data.id;

    return { draftProjectId, conversationId };
  };

  const sendMessage = async () => {
    const { draftProjectId, conversationId } = await startDraft();
    const { fileIds, failedFile } = await uploadFiles(files, draftProjectId);
    if (failedFile) {
      await deleteUploads(fileIds);
      setSendError(
        formatMessage(assistantMessages.errorUpload, {
          fileName: failedFile.name,
        })
      );
      return;
    }

    try {
      await addMessage({ conversationId, content: prompt.trim(), fileIds });
    } catch (error) {
      await deleteUploads(fileIds);
      throw error;
    }
    setPrompt('');
    setFiles([]);
  };

  const refine = async (toolCallId: string, conversationId: string) => {
    await reject({ id: toolCallId, conversationId, reason: prompt.trim() });
    setPrompt('');
  };

  const send = async () => {
    setSendError(undefined);
    setSending(true);
    try {
      if (conversation && changeToRefine) {
        await refine(changeToRefine.id, conversation.data.id);
      } else {
        await sendMessage();
      }
    } catch (error) {
      setSendError(formatMessage(getErrorMessage(getRequestErrorCode(error))));
    } finally {
      setSending(false);
    }
  };

  return {
    prompt,
    setPrompt,
    files,
    setFiles,
    sending,
    sendError,
    hasMessages,
    blocked,
    refining: !!changeToRefine,
    awaitingHint: getAwaitingHint(),
    placeholder: getPlaceholder(),
    send,
  };
};

export default useGeneratorChat;
