import React from 'react';

import Button from 'design-system/Button';
import 'design-system/tokens.css';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import NewIdeaButton from 'containers/Admin/projects/_shared/components/NewIdeaButton';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import Card from './Card';
import OfflineFormsButton from './OfflineFormsButton';
import styles from './RightColumn.module.css';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const OfflineCollection = ({ project, phase }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Card title={formatMessage(messages.offlineCollection)}>
      <div className={styles.actions}>
        <Button
          size={28}
          icon="file-16"
          onPress={() =>
            clHistory.push(
              `/admin/projects/${project.id}/phases/${phase.id}/input-importer`
            )
          }
        >
          {formatMessage(messages.importInputs)}
        </Button>
        <NewIdeaButton
          participationMethod={phase.attributes.participation_method}
          inputTerm={phase.attributes.input_term}
          to="/projects/$slug/ideas/new"
          params={{ slug: project.attributes.slug }}
          search={{ phase_id: phase.id }}
        />
        <OfflineFormsButton
          participationMethod={phase.attributes.participation_method}
        />
      </div>
    </Card>
  );
};

export default OfflineCollection;
