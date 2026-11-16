import React from 'react';

import { FormattedDate } from 'react-intl';

import Divider from 'design-system/Divider';
import Icon from 'design-system/Icon';

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

  return (
    <div className={styles.overview}>
      <div>
        <h2 className={styles.title}>{localize(attributes.title_multiloc)}</h2>
        <div className={styles.byline}>
          <span>
            {/* UserName draws its own text, so it gets the size and colour of the line. */}
            <UserName
              userId={relationships.author?.data?.id ?? null}
              anonymous={attributes.anonymous}
              fontSize={13}
              color="var(--gv-text-secondary)"
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

      <Divider />

      <div className={styles.properties}>
        <StatusProperty idea={idea} type={type} />
        <AssigneeProperty idea={idea} />
        <TagsProperty idea={idea} type={type} />
        {!isProposals && <PhasesProperty idea={idea} />}
        <VotingDetails idea={idea} phase={listedPhase} />
      </div>

      <Divider />

      <IdeaContent idea={idea} />

      <Divider />

      <OfficialFeedback postId={idea.id} permissionToPost />
      <CommentsSection
        postId={idea.id}
        allowAnonymousParticipation={
          listedPhase?.attributes.allow_anonymous_participation
        }
        showInternalComments
      />
      <IdeaOfficialFeedbackModal ideaId={idea.id} />
    </div>
  );
};

export default IdeaOverview;
