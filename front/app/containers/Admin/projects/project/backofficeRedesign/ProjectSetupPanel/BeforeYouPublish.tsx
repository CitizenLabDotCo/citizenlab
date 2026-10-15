import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useProjectReview from 'api/project_reviews/useProjectReview';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import projectPageMessages from 'containers/Admin/projects/project/projectPage/messages';

import { useIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from '../messages';

import PanelHeading from './PanelHeading';
import SelectMethodModal from './SelectMethodModal';
import SetupCard from './SetupCard';
import SetupCards from './SetupCards';
import { getMissingItems, SETUP_ITEMS } from './setupItems';
import useSetupReadiness from './useSetupReadiness';

interface Props {
  project: IProjectData;
  onOpenSettings: () => void;
}

const BeforeYouPublish = ({ project, onOpenSettings }: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const projectId = project.id;
  const readiness = useSetupReadiness(project);
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
    <Box>
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
        <Text variant="boMicro" m="0" mb="8px">
          {formatMessage(messages.scheduledToPublish, {
            date: formatDate(scheduled_at, {
              day: 'numeric',
              month: 'long',
              hour: 'numeric',
              minute: '2-digit',
            }),
          })}
        </Text>
      )}

      <Box display="flex" flexDirection="column" gap="8px">
        <SetupCards
          project={project}
          readiness={readiness}
          onOpenSettings={onOpenSettings}
        />
        <SetupCard
          id="e2e-setup-card-methods"
          title={formatMessage(messages.participationMethods)}
          ready={readiness.methods}
          behaviour={{
            kind: 'action',
            icon: 'plus',
            actionLabel: formatMessage(
              projectPageMessages.newParticipationMethod
            ),
            onClick: () => setMethodModalOpened(true),
          }}
        />
      </Box>

      <SelectMethodModal
        projectId={projectId}
        opened={methodModalOpened}
        onClose={() => setMethodModalOpened(false)}
      />
    </Box>
  );
};

export default BeforeYouPublish;
