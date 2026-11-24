import React, { useState } from 'react';

import PanelGroupHeader from 'design-system/PanelGroupHeader';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './ProjectDetails.module.css';
import SetupCards from './SetupCards';

interface Props {
  project: IProjectData;
  onOpenSettings: () => void;
}

const ProjectDetails = ({ project, onOpenSettings }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <PanelGroupHeader
        label={formatMessage(messages.projectDetails)}
        toggle={{
          id: 'e2e-project-details-toggle',
          expanded: opened,
          controls: 'project-details-cards',
          onPress: () => setOpened(!opened),
        }}
      />

      {opened && (
        <div id="project-details-cards" className={styles.cards}>
          <SetupCards project={project} onOpenSettings={onOpenSettings} />
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
