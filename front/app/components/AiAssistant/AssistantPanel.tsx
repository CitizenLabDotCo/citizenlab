import React, { useState } from 'react';

import {
  Box,
  Icon,
  Text,
  Title,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { AiAssistantContextKey } from 'api/ai_assistant_conversations/types';
import useAddAiAssistantConversation from 'api/ai_assistant_conversations/useAddAiAssistantConversation';
import useAiAssistantConversation from 'api/ai_assistant_conversations/useAiAssistantConversation';
import useAiAssistantConversations from 'api/ai_assistant_conversations/useAiAssistantConversations';
import useAddAiAssistantMessage from 'api/ai_assistant_messages/useAddAiAssistantMessage';

import useLocale from 'hooks/useLocale';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import Composer from './Composer';
import EmptyState from './EmptyState';
import { getErrorMessage, getRequestErrorCode } from './errors';
import messages from './messages';
import Transcript from './Transcript';

type Props = {
  contextKey: AiAssistantContextKey;
  // The record the conversation is about, e.g. the phase of a survey.
  contextId: string;
  intro: MessageDescriptor;
  starters: MessageDescriptor[];
};

const AssistantPanel = ({ contextKey, contextId, intro, starters }: Props) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { data: conversations } = useAiAssistantConversations({
    contextKey,
    contextId,
  });
  const conversationId = conversations?.data.at(0)?.id;
  const { data: conversation } = useAiAssistantConversation(conversationId);
  const { mutateAsync: addConversation, isPending: creatingConversation } =
    useAddAiAssistantConversation();
  const { mutateAsync: addMessage } = useAddAiAssistantMessage();

  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string>();

  const status = conversation?.data.attributes.status;
  const busy = sending || status === 'running';
  const hasMessages =
    (conversation?.data.relationships.messages.data.length ?? 0) > 0;

  const send = async () => {
    setSendError(undefined);
    setSending(true);
    try {
      const id =
        conversationId ??
        (await addConversation({ contextKey, contextId, locale })).data.id;
      await addMessage({ conversationId: id, content: prompt.trim() });
      setPrompt('');
    } catch (error) {
      setSendError(formatMessage(getErrorMessage(getRequestErrorCode(error))));
    } finally {
      setSending(false);
    }
  };

  const startNewChat = () => {
    setSendError(undefined);
    addConversation(
      { contextKey, contextId, locale },
      {
        onError: (error) =>
          setSendError(
            formatMessage(getErrorMessage(getRequestErrorCode(error)))
          ),
      }
    );
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={`calc(100vh - ${stylingConsts.menuHeight}px)`}
      p="20px"
      bgColor={colors.white}
      borderLeft={`1px solid ${colors.borderLight}`}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb="16px"
      >
        <Box display="flex" alignItems="center" gap="8px">
          <Icon name="stars" fill={colors.teal400} />
          <Title variant="h3" m="0px">
            <FormattedMessage {...messages.title} />
          </Title>
        </Box>
        {hasMessages && (
          <ButtonWithLink
            type="button"
            buttonStyle="secondary-outlined"
            size="s"
            icon="plus-circle"
            disabled={status === 'running' || sending}
            processing={creatingConversation}
            onClick={startNewChat}
          >
            <FormattedMessage {...messages.newChat} />
          </ButtonWithLink>
        )}
      </Box>
      <Box flex="1" overflowY="auto">
        {conversation && hasMessages ? (
          <Transcript conversation={conversation} />
        ) : (
          <EmptyState
            intro={intro}
            starters={starters}
            onSelectStarter={setPrompt}
          />
        )}
      </Box>
      <Box mt="16px">
        <Composer
          prompt={prompt}
          disabled={busy}
          sending={sending}
          onPromptChange={setPrompt}
          onSend={send}
        />
        {sendError && (
          <Text m="0px" mt="8px" color="error">
            {sendError}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default AssistantPanel;
