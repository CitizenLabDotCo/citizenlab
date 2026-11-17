import React, { useState } from 'react';

import { Button } from 'react-aria-components';

import Icon from 'design-system/Icon';

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
      <Button
        id="e2e-project-details-toggle"
        className={styles.toggle}
        aria-expanded={opened}
        aria-controls="project-details-cards"
        onPress={() => setOpened((opened) => !opened)}
      >
        {formatMessage(messages.projectDetails)}
        <Icon name="chevron-down-16" className={styles.chevron} />
      </Button>

      {opened && (
        <div id="project-details-cards" className={styles.cards}>
          <SetupCards project={project} onOpenSettings={onOpenSettings} />
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
