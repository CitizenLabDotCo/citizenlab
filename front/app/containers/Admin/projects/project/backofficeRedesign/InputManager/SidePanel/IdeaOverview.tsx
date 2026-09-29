import React from 'react';

import {
  Box,
  colors,
  Divider,
  Icon,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';

import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import { ManagerType } from 'components/admin/PostManager';
import IdeaOfficialFeedbackModal from 'components/admin/PostManager/components/IdeaOfficialFeedbackModal';
import CommentsSection from 'components/PostShowComponents/Comments/CommentsSection';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import UserName from 'components/UI/UserName';

import AssigneeProperty from './AssigneeProperty';
import IdeaContent from './IdeaContent';
import PhasesProperty from './PhasesProperty';
import QuickActions from './QuickActions';
import StatusProperty from './StatusProperty';
import TagsProperty from './TagsProperty';
import VotingDetails from './VotingDetails';

interface Props {
  idea: IIdeaData;
  type: ManagerType;
  /** The phase whose inputs are listed. Absent when all phases are listed. */
  listedPhase: IPhaseData | undefined;
  onEdit: () => void;
  onDeleted: () => void;
}

const IdeaOverview = ({
  idea,
  type,
  listedPhase,
  onEdit,
  onDeleted,
}: Props) => {
  const localize = useLocalize();
  const { attributes, relationships } = idea;
  const isProposals = type === 'ProjectProposals';

  return (
    <Box display="flex" flexDirection="column" gap="16px" p="24px">
      <Box>
        <Title variant="h3" as="h2" m="0" mb="8px" color="textPrimary">
          {localize(attributes.title_multiloc)}
        </Title>
        <Box display="flex" alignItems="center" gap="8px">
          <Text m="0" fontSize="s" color="coolGrey600">
            <UserName
              userId={relationships.author?.data?.id ?? null}
              anonymous={attributes.anonymous}
              fontSize={14}
            />
          </Text>
          {attributes.published_at && (
            <Text m="0" fontSize="s" color="coolGrey600">
              <FormattedDate
                value={attributes.published_at}
                year="numeric"
                month="long"
                day="numeric"
              />
            </Text>
          )}
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap="12px">
          <Box display="flex" alignItems="center" gap="4px">
            <Icon name="vote-up" width="16px" fill={colors.coolGrey600} />
            <Text m="0" fontSize="s">
              {attributes.likes_count}
            </Text>
          </Box>
          {!isProposals && (
            <Box display="flex" alignItems="center" gap="4px">
              <Icon name="vote-down" width="16px" fill={colors.coolGrey600} />
              <Text m="0" fontSize="s">
                {attributes.dislikes_count}
              </Text>
            </Box>
          )}
        </Box>
        <QuickActions idea={idea} onEdit={onEdit} onDeleted={onDeleted} />
      </Box>

      <Divider m="0" />

      <Box display="flex" flexDirection="column" gap="8px">
        <StatusProperty idea={idea} type={type} />
        <AssigneeProperty idea={idea} />
        <TagsProperty idea={idea} type={type} />
        {!isProposals && <PhasesProperty idea={idea} />}
        <VotingDetails idea={idea} phase={listedPhase} />
      </Box>

      <Divider m="0" />

      <IdeaContent idea={idea} />

      <Divider m="0" />

      <OfficialFeedback postId={idea.id} permissionToPost />
      <CommentsSection
        postId={idea.id}
        allowAnonymousParticipation={
          listedPhase?.attributes.allow_anonymous_participation
        }
        showInternalComments
      />
      <IdeaOfficialFeedbackModal ideaId={idea.id} />
    </Box>
  );
};

export default IdeaOverview;
