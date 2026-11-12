import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import DraftSection from './DraftSection';
import Events from './Events';
import ParticipationMethods from './ParticipationMethods';
import ProjectSetupCard from './ProjectSetupCard';
import Timeline from './Timeline';
import useDraft from './useDraft';

type Props = {
  projectId?: string;
  isNewProject: boolean;
  conversation?: IAiAssistantConversation;
  onOpenProject: () => void;
};

// The saved project, however it was made, with the proposed changes on top.
const DraftPreview = ({
  projectId,
  isNewProject,
  conversation,
  onOpenProject,
}: Props) => {
  const { formatMessage } = useIntl();
  const { draftProject, draftPhases, draftEvents } = useDraft({
    projectId,
    conversation,
  });
  const conversationId = conversation?.data.id;

  return (
    <Box
      flex="1"
      minWidth="0"
      display="flex"
      flexDirection="column"
      bgColor={colors.grey100}
    >
      <Box flex="1" overflowY="auto" px="32px" py="24px">
        <Box
          maxWidth="760px"
          mx="auto"
          display="flex"
          flexDirection="column"
          gap="28px"
        >
          <DraftSection title={formatMessage(messages.projectSetup)}>
            <ProjectSetupCard
              project={draftProject}
              conversationId={conversationId}
            />
          </DraftSection>
          <Timeline phases={draftPhases} />
          <ParticipationMethods
            phases={draftPhases}
            conversationId={conversationId}
          />
          <Events events={draftEvents} conversationId={conversationId} />
        </Box>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="16px"
        px="32px"
        py="16px"
        bgColor={colors.white}
        borderTop={`1px solid ${colors.grey200}`}
      >
        <Text m="0px" fontSize="s" color="textSecondary">
          {formatMessage(messages.footerNote)}
        </Text>
        <ButtonWithLink
          type="button"
          buttonStyle="bo-primary"
          disabled={!projectId}
          onClick={onOpenProject}
        >
          {formatMessage(
            isNewProject ? messages.createProject : messages.openProject
          )}
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default DraftPreview;
