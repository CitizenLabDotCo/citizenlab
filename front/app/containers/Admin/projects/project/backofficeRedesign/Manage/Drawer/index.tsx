import React, { useState } from 'react';

import { Box, Button, colors, Text } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import { IInputTopicData } from 'api/input_topics/types';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import IdeaOfficialFeedbackModal from 'components/admin/PostManager/components/IdeaOfficialFeedbackModal';
import AssigneeSelect from 'components/admin/PostManager/components/PostTable/AssigneeSelect';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import SideModal from 'components/UI/SideModal';

import { useIntl } from 'utils/cl-intl';
import { stripHtml } from 'utils/textUtils';

import Engagement from '../Engagement';
import messages from '../messages';
import RespondedBadge from '../RespondedBadge';
import { isAwaitingReply } from '../utils';

import DrawerPhases from './DrawerPhases';
import DrawerSection from './DrawerSection';
import DrawerStatus from './DrawerStatus';
import DrawerTags from './DrawerTags';

interface Props {
  ideaId: string | null;
  projectId: string;
  phases: IPhaseData[];
  statuses: IIdeaStatusData[];
  topics: IInputTopicData[];
  onClose: () => void;
  onOpenFullView: (ideaId: string) => void;
}

const IdeaDrawer = ({
  ideaId,
  projectId,
  phases,
  statuses,
  topics,
  onClose,
  onOpenFullView,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const { mutate: updateIdea } = useUpdateIdea();
  const { mutate: deleteIdea } = useDeleteIdea();
  const [responding, setResponding] = useState(false);

  const close = () => {
    setResponding(false);
    onClose();
  };

  const remove = (id: string) => {
    if (window.confirm(formatMessage(messages.removeIdeaConfirmation))) {
      deleteIdea(id, { onSuccess: close });
    }
  };

  const data = idea?.data.id === ideaId ? idea.data : undefined;

  return (
    <SideModal opened={!!ideaId} close={close} width="480px">
      {data && (
        <Box p="24px" pt="48px" display="flex" flexDirection="column">
          <Text m="0" fontWeight="bold" fontSize="l" color="textPrimary">
            {localize(data.attributes.title_multiloc)}
          </Text>
          <Text m="0" mt="8px" color="textPrimary">
            {stripHtml(localize(data.attributes.body_multiloc), 600)}
          </Text>
          <Box display="flex" gap="12px" mt="8px" alignItems="center">
            <Engagement idea={data} />
            {!isAwaitingReply(data, statuses) && <RespondedBadge />}
          </Box>

          <DrawerSection label={formatMessage(messages.status)}>
            <DrawerStatus idea={data} statuses={statuses} />
          </DrawerSection>

          <DrawerSection label={formatMessage(messages.assignee)}>
            <AssigneeSelect
              projectId={projectId}
              assigneeId={data.relationships.assignee?.data?.id}
              onAssigneeChange={(assigneeId) =>
                updateIdea({
                  id: data.id,
                  requestBody: { assignee_id: assigneeId ?? null },
                })
              }
            />
          </DrawerSection>

          {topics.length > 0 && (
            <DrawerSection label={formatMessage(messages.tags)}>
              <DrawerTags idea={data} topics={topics} />
            </DrawerSection>
          )}

          <DrawerSection
            label={formatMessage(messages.phases)}
            hint={formatMessage(messages.phasesHint)}
          >
            <DrawerPhases idea={data} phases={phases} />
          </DrawerSection>

          <DrawerSection label={formatMessage(messages.actions)}>
            <Box display="flex" flexDirection="column" gap="8px">
              <Button
                buttonStyle="secondary-outlined"
                justify="left"
                icon="comments"
                onClick={() => setResponding((responding) => !responding)}
              >
                {formatMessage(messages.respond)}
              </Button>
              {responding && (
                <OfficialFeedback postId={data.id} permissionToPost />
              )}
              <Button
                buttonStyle="secondary-outlined"
                justify="left"
                icon="open-in-new"
                onClick={() => onOpenFullView(data.id)}
              >
                <Box style={{ textAlign: 'left' }}>
                  <Text as="span" m="0" display="block" fontWeight="semi-bold">
                    {formatMessage(messages.openFullView)}
                  </Text>
                  <Text as="span" m="0" fontSize="xs" color="coolGrey600">
                    {formatMessage(messages.openFullViewHint)}
                  </Text>
                </Box>
              </Button>
              <ButtonWithLink
                buttonStyle="secondary-outlined"
                justify="left"
                icon="eye"
                to="/ideas/$slug"
                params={{ slug: data.attributes.slug }}
                openLinkInNewTab
              >
                {formatMessage(messages.viewAsResident)}
              </ButtonWithLink>
              <Button
                buttonStyle="secondary-outlined"
                justify="left"
                icon="delete"
                textColor={colors.red600}
                iconColor={colors.red600}
                onClick={() => remove(data.id)}
              >
                {formatMessage(messages.removeIdea)}
              </Button>
            </Box>
          </DrawerSection>

          <IdeaOfficialFeedbackModal ideaId={data.id} />
        </Box>
      )}
    </SideModal>
  );
};

export default IdeaDrawer;
