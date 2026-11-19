import React, { useState } from 'react';

import Divider from 'design-system/Divider';
import IconButton from 'design-system/IconButton';
import PanelGroupHeader from 'design-system/PanelGroupHeader';

import usePhases from 'api/phases/usePhases';

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
  const hasPhases = !!phases && phases.data.length > 0;

  return (
    <div className={styles.timeline}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          {formatMessage(messages.participation)}
        </h4>
        <div className={styles.actions}>
          <PanelToggleButton variant="ghost" />
          {withNewMethod && (
            // IconButton takes no class, so the product tour anchors on this wrapper.
            <span className="intercom-product-tour-project-timeline-new-phase">
              <IconButton
                icon="plus-16"
                tone="strong"
                aria-label={formatMessage(
                  projectPageMessages.newParticipationMethod
                )}
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
