import React from 'react';

import {
  bo,
  Box,
  colors,
  Divider,
  Icon,
  Text,
} from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';

import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import { ManagerType } from 'components/admin/PostManager';
import IdeaOfficialFeedbackModal from 'components/admin/PostManager/components/IdeaOfficialFeedbackModal';
import CommentsSection from 'components/PostShowComponents/Comments/CommentsSection';
import { CommentsVariantContext } from 'components/PostShowComponents/Comments/commentsVariant';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import UserName from 'components/UI/UserName';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import AssigneeProperty from './AssigneeProperty';
import CommonGroundReactions from './CommonGroundReactions';
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
  // Statements can't move into other phases, which only list idea phases.
  const showPhases =
    !isProposals &&
    listedPhase?.attributes.participation_method !== 'common_ground';

  return (
    <Box display="flex" flexDirection="column" gap="24px" p="16px 24px 24px">
      <Box display="flex" flexDirection="column" gap="12px">
        <Text
          as="p"
          variant="boControl"
          fontWeight="semi-bold"
          fontSize="s"
          m="0"
        >
          {localize(attributes.title_multiloc)}
        </Text>
        <IdeaContent idea={idea} />
        <Box display="flex" alignItems="center" gap="24px">
          <Text variant="boHelper" fontSize="xs" m="0">
            <FormattedMessage
              {...messages.postedBy}
              values={{
                author: (
                  <UserName
                    userId={relationships.author?.data?.id ?? null}
                    anonymous={attributes.anonymous}
                    fontSize={12}
                    color={bo.colors.textHeadingStrong}
                  />
                ),
              }}
            />
          </Text>
          {attributes.published_at && (
            <Text variant="boHelper" fontSize="xs" m="0">
              <FormattedDate
                value={attributes.published_at}
                year="numeric"
                month="long"
                day="numeric"
              />
            </Text>
          )}
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap="14px">
            <Box display="flex" alignItems="center" gap="5px">
              <Icon
                name="thumb-up"
                width="14px"
                height="14px"
                fill={colors.coolGrey500}
              />
              <Text variant="boHelper" fontSize="xs" m="0">
                {attributes.likes_count}
              </Text>
            </Box>
            {!isProposals && (
              <Box display="flex" alignItems="center" gap="5px">
                <Icon
                  name="thumb-down"
                  width="14px"
                  height="14px"
                  fill={colors.coolGrey500}
                />
                <Text variant="boHelper" fontSize="xs" m="0">
                  {attributes.dislikes_count}
                </Text>
              </Box>
            )}
          </Box>
          <QuickActions idea={idea} onEdit={onEdit} onDeleted={onDeleted} />
        </Box>
      </Box>

      <CommonGroundReactions phase={listedPhase} ideaId={idea.id} />

      <Divider m="0" />

      <Box display="flex" flexDirection="column" gap="10px">
        <StatusProperty idea={idea} type={type} />
        <AssigneeProperty idea={idea} />
        <TagsProperty idea={idea} type={type} />
        {showPhases && <PhasesProperty idea={idea} />}
        <VotingDetails idea={idea} phase={listedPhase} />
      </Box>

      <Divider m="0" />

      <OfficialFeedback postId={idea.id} permissionToPost variant="bo" />
      <CommentsVariantContext.Provider value="bo">
        <CommentsSection
          postId={idea.id}
          allowAnonymousParticipation={
            listedPhase?.attributes.allow_anonymous_participation
          }
          showInternalComments
        />
      </CommentsVariantContext.Provider>
      <IdeaOfficialFeedbackModal ideaId={idea.id} variant="bo" />
    </Box>
  );
};

export default IdeaOverview;
