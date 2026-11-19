import React, { useState } from 'react';

import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import projectPageMessages from 'containers/Admin/projects/project/projectPage/messages';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import backofficeRedesignMessages from '../messages';
import { useParticipationPanel } from '../ParticipationPanelContext';

import styles from './BeforeYouPublish.module.css';
import messages from './messages';
import PanelHeading from './PanelHeading';
import SelectMethodModal from './SelectMethodModal';
import SetupCard from './SetupCard';
import SetupCards from './SetupCards';
import setupCardMessages from './SetupCards/messages';
import { getMissingItems, SETUP_ITEMS } from './setupItems';
import useSetupReadiness from './useSetupReadiness';

interface Props {
  project: IProjectData;
  onOpenSettings: () => void;
}

const BeforeYouPublish = ({ project, onOpenSettings }: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const participationPanel = useParticipationPanel();
  const projectId = project.id;
  const { readiness } = useSetupReadiness(project);
  const [methodModalOpened, setMethodModalOpened] = useState(false);

  const isProjectReviewEnabled = useFeatureFlag({ name: 'project_review' });
  const { data: projectReview } = useProjectReview(projectId);
  const canPublish = usePermission({
    item: project,
    action: 'publish',
    context: projectReview?.data.attributes.state === 'approved',
  });

  const missingCount = getMissingItems(readiness).length;
  const allReady = missingCount === 0;

  const needsReview =
    isProjectReviewEnabled &&
    !canPublish &&
    !project.attributes.first_published_at;

  const getTitle = () => {
    if (!allReady) return formatMessage(messages.beforeYouPublish);
    return formatMessage(
      needsReview ? messages.readyForReview : messages.readyToPublish
    );
  };

  const { scheduled_at } = project.attributes;

  return (
    <div>
      <PanelHeading
        title={getTitle()}
        meta={
          allReady
            ? undefined
            : formatMessage(messages.itemsReady, {
                ready: SETUP_ITEMS.length - missingCount,
                total: SETUP_ITEMS.length,
              })
        }
      />
      {scheduled_at && (
        <p className={styles.scheduled}>
          {formatMessage(messages.scheduledToPublish, {
            date: formatDate(scheduled_at, {
              day: 'numeric',
              month: 'long',
              hour: 'numeric',
              minute: '2-digit',
            }),
          })}
        </p>
      )}

      <div className={styles.cards}>
        <SetupCards
          project={project}
          readiness={readiness}
          onOpenSettings={onOpenSettings}
        />
        <SetupCard
          id="e2e-setup-card-methods"
          tooltip={formatMessage(setupCardMessages.methodsTooltip)}
          title={formatMessage(setupCardMessages.methodsTitle)}
          ready={readiness.methods}
          behaviour={
            participationPanel.collapsed
              ? {
                  kind: 'action',
                  icon: 'chevron-right-16',
                  actionLabel: formatMessage(
                    backofficeRedesignMessages.showPanel
                  ),
                  onClick: () => participationPanel.setCollapsed(false),
                }
              : {
                  kind: 'action',
                  icon: 'plus-16',
                  actionLabel: formatMessage(
                    projectPageMessages.newParticipationMethod
                  ),
                  onClick: () => setMethodModalOpened(true),
                }
          }
        />
      </div>

      <SelectMethodModal
        projectId={projectId}
        opened={methodModalOpened}
        onClose={() => setMethodModalOpened(false)}
      />
    </div>
  );
};

export default BeforeYouPublish;
