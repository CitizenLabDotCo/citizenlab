import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';

import Composer from 'components/AiAssistant/Composer';
import Transcript from 'components/AiAssistant/Transcript';

import { useIntl } from 'utils/cl-intl';

import { Appear } from '../animations';
import messages from '../messages';
import useRefreshDraft from '../useRefreshDraft';

import ChatHeader from './ChatHeader';
import { TOOL_DISPLAYS } from './toolDisplays';
import useGeneratorChat from './useGeneratorChat';

type Props = {
  projectId?: string;
  isNewProject: boolean;
  conversation?: IAiAssistantConversation;
  titleId: string;
  onProjectCreated: (projectId: string) => void;
  onStartFromScratch?: () => void;
  onClose: () => void;
};

const GeneratorChat = ({
  projectId,
  isNewProject,
  conversation,
  titleId,
  onProjectCreated,
  onStartFromScratch,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const refreshDraft = useRefreshDraft();
  const {
    prompt,
    setPrompt,
    files,
    setFiles,
    sending,
    sendError,
    hasMessages,
    blocked,
    refining,
    awaitingHint,
    placeholder,
    send,
  } = useGeneratorChat({
    projectId,
    isNewProject,
    conversation,
    onProjectCreated,
  });

  return (
    <Box
      width="420px"
      flexShrink={0}
      display="flex"
      flexDirection="column"
      borderRight={`1px solid ${colors.grey200}`}
      bgColor={colors.white}
    >
      <ChatHeader
        titleId={titleId}
        onStartFromScratch={projectId ? undefined : onStartFromScratch}
        onClose={onClose}
      />

      <Box flex="1" overflowY="auto" px="20px" py="16px">
        {conversation && hasMessages ? (
          <Transcript
            conversation={conversation}
            toolDisplays={TOOL_DISPLAYS}
            onToolExecuted={refreshDraft}
          />
        ) : (
          <Appear display="flex" flexDirection="column" gap="8px" pt="8px">
            <Title variant="h4" as="h3" m="0px">
              {formatMessage(
                isNewProject ? messages.introTitle : messages.editIntroTitle
              )}
            </Title>
            <Text m="0px" color="textSecondary">
              {formatMessage(
                isNewProject ? messages.introText : messages.editIntroText
              )}
            </Text>
          </Appear>
        )}
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        gap="8px"
        px="20px"
        pt="12px"
        pb="20px"
      >
        {awaitingHint && (
          <Text m="0px" fontSize="s" color="textSecondary">
            {formatMessage(awaitingHint)}
          </Text>
        )}
        <Composer
          prompt={prompt}
          files={files}
          allowFiles={!refining}
          disabled={blocked || sending}
          sending={sending}
          placeholder={placeholder}
          onPromptChange={setPrompt}
          onFilesChange={setFiles}
          onSend={send}
        />
        {sendError && (
          <Text m="0px" color="error">
            {sendError}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default GeneratorChat;
