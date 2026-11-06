import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import CardSkeleton from './CardSkeleton';
import DraftStatus from './DraftStatus';
import ProjectCard from './ProjectCard';
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
  const {
    status,
    projectSetUp,
    draftProject,
    draftPhases,
    draftEvents,
    timelineLoading,
  } = useDraft({ projectId, isNewProject, conversation });

  return (
    <Box
      flex="1"
      minWidth="0"
      display="flex"
      flexDirection="column"
      bgColor={colors.grey100}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px="32px"
        py="16px"
        borderBottom={`1px solid ${colors.grey200}`}
      >
        <Title variant="h5" as="h2" m="0px">
          {formatMessage(messages.draft)}
        </Title>
        {status && <DraftStatus status={status} />}
      </Box>

      <Box flex="1" overflowY="auto" px="32px" py="24px">
        <Box
          maxWidth="760px"
          mx="auto"
          display="flex"
          flexDirection="column"
          gap="32px"
        >
          <Box as="section" display="flex" flexDirection="column" gap="12px">
            <Title variant="h4" as="h3" m="0px">
              {formatMessage(messages.projectSetup)}
            </Title>
            {projectId &&
            draftProject &&
            (projectSetUp || draftProject.change) ? (
              <ProjectCard
                projectId={projectId}
                draft={draftProject}
                conversationId={conversation?.data.id}
                status={status}
              />
            ) : (
              <CardSkeleton
                working={status === 'running'}
                caption={formatMessage(
                  projectId ? messages.cardPending : messages.emptyDraft
                )}
              />
            )}
          </Box>

          <Box as="section" display="flex" flexDirection="column" gap="12px">
            <Title variant="h4" as="h3" m="0px">
              {formatMessage(messages.timeline)}
            </Title>
            <Timeline
              phases={draftPhases}
              events={draftEvents}
              loading={timelineLoading}
              projectSetUp={projectSetUp}
              conversationId={conversation?.data.id}
              status={status}
            />
          </Box>
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
          icon="arrow-right"
          iconPos="right"
          disabled={!projectId}
          onClick={onOpenProject}
        >
          {formatMessage(messages.openProject)}
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default DraftPreview;
