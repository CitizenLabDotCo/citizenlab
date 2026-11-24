import React, { useState } from 'react';

import Divider from 'design-system/Divider';
import Icon from 'design-system/Icon';
import IconButton from 'design-system/IconButton';
import PanelGroupHeader from 'design-system/PanelGroupHeader';
import Text from 'design-system/Text';
import UnstyledButton from 'design-system/UnstyledButton';

import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import projectPageMessages from 'containers/Admin/projects/project/projectPage/messages';
import SpotlightSurveys from 'containers/Admin/projects/project/projectPage/SpotlightSurveys';
import TimelinePhases from 'containers/Admin/projects/project/projectPage/TimelinePhases';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import PanelToggleButton from './PanelToggleButton';
import SelectMethodModal from './ProjectSetupPanel/SelectMethodModal';
import styles from './ProjectTimeline.module.css';
import TimelineEvents from './TimelineEvents';

interface Props {
  projectId: string;
  withNewMethod: boolean;
}

const ProjectTimeline = ({ projectId, withNewMethod }: Props) => {
  const { formatMessage } = useIntl();
  const [methodModalOpened, setMethodModalOpened] = useState(false);
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);
  const hasPhases = !!phases && phases.data.length > 0;
  const showEmptyAddRow =
    withNewMethod &&
    phases?.data.length === 0 &&
    project?.data.attributes.publication_status === 'draft';
  const addMethodLabel = formatMessage(
    projectPageMessages.newParticipationMethod
  );

  return (
    <div className={styles.timeline}>
      <div className={styles.header}>
        <Text as="h4" variant="uiStrong" tone="primary">
          {formatMessage(messages.participation)}
        </Text>
        <div className={styles.actions}>
          <PanelToggleButton variant="ghost" />
          {withNewMethod && !showEmptyAddRow && (
            // IconButton takes no class, so the product tour anchors on this wrapper.
            <span className="intercom-product-tour-project-timeline-new-phase">
              <IconButton
                icon="plus-16"
                tone="strong"
                aria-label={addMethodLabel}
                onPress={() => setMethodModalOpened(true)}
              />
            </span>
          )}
        </div>
      </div>
      <div className="intercom-product-tour-project-timeline">
        <TimelinePhases
          projectId={projectId}
          variant="panel"
          heading={
            hasPhases && (
              <div className={styles.groupHeader}>
                <PanelGroupHeader
                  context="rail"
                  level={4}
                  label={formatMessage(projectPageMessages.timeline)}
                />
              </div>
            )
          }
          withPhaseOptions
        />
        {showEmptyAddRow && (
          <UnstyledButton
            className={`${styles.addRow} intercom-product-tour-project-timeline-new-phase`}
            onPress={() => setMethodModalOpened(true)}
          >
            <span className={styles.addRowIcon}>
              <Icon name="plus-16" />
            </span>
            {addMethodLabel}
          </UnstyledButton>
        )}
      </div>
      <SpotlightSurveys
        projectId={projectId}
        variant="panel"
        withPhaseOptions
      />
      <div className={styles.divider}>
        <Divider />
      </div>
      <TimelineEvents projectId={projectId} />
      <SelectMethodModal
        projectId={projectId}
        opened={methodModalOpened}
        onClose={() => setMethodModalOpened(false)}
      />
    </div>
  );
};

export default ProjectTimeline;
