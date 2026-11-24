import React from 'react';

import { FormattedDate } from 'react-intl';

import Divider from 'design-system/Divider';
import Icon from 'design-system/Icon';
import Text from 'design-system/Text';

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
import styles from './SidePanel.module.css';
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
    <div className={styles.overview}>
      <div className={styles.summary}>
        <Text as="h2" variant="bodyStrong" tone="primary">
          {localize(attributes.title_multiloc)}
        </Text>
        <IdeaContent idea={idea} />
        <div className={styles.byline}>
          <span>
            <FormattedMessage
              {...messages.postedBy}
              values={{
                // UserName draws its own text, so it gets the size and colour of the line.
                author: (
                  <UserName
                    userId={relationships.author?.data?.id ?? null}
                    anonymous={attributes.anonymous}
                    fontSize={12}
                    color="var(--gv-text-primary)"
                  />
                ),
              }}
            />
          </span>
          {attributes.published_at && (
            <span>
              <FormattedDate
                value={attributes.published_at}
                year="numeric"
                month="long"
                day="numeric"
              />
            </span>
          )}
        </div>
        <div className={styles.reactionsRow}>
          <div className={styles.reactions}>
            <span className={styles.reaction}>
              <Icon name="arrow-up-16" className={styles.reactionIcon} />
              {attributes.likes_count}
            </span>
            {!isProposals && (
              <span className={styles.reaction}>
                <Icon name="arrow-down-16" className={styles.reactionIcon} />
                {attributes.dislikes_count}
              </span>
            )}
          </div>
          <QuickActions idea={idea} onEdit={onEdit} onDeleted={onDeleted} />
        </div>
      </div>

      <CommonGroundReactions phase={listedPhase} ideaId={idea.id} />

      <Divider />

      <div className={styles.properties}>
        <StatusProperty idea={idea} type={type} />
        <AssigneeProperty idea={idea} />
        <TagsProperty idea={idea} type={type} />
        {showPhases && <PhasesProperty idea={idea} />}
        <VotingDetails idea={idea} phase={listedPhase} />
      </div>

      <Divider />

      {/* Shared feedback and comment components; their 'panel' variant is the side-panel look. */}
      <OfficialFeedback postId={idea.id} permissionToPost variant="panel" />
      <CommentsVariantContext.Provider value="panel">
        <CommentsSection
          postId={idea.id}
          allowAnonymousParticipation={
            listedPhase?.attributes.allow_anonymous_participation
          }
          showInternalComments
        />
      </CommentsVariantContext.Provider>
      <IdeaOfficialFeedbackModal ideaId={idea.id} variant="panel" />
    </div>
  );
};

export default IdeaOverview;
