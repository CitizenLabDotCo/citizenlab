import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import NewIdeaButton from 'containers/Admin/projects/_shared/components/NewIdeaButton';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import Card from './Card';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const OfflineCollection = ({ project, phase }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Card title={formatMessage(messages.offlineCollection)}>
      <Box display="flex" flexDirection="column" gap="8px">
        <ButtonWithLink
          to="/admin/projects/$projectId/phases/$phaseId/input-importer"
          params={{ projectId: project.id, phaseId: phase.id }}
          icon="page"
          buttonStyle="bo-secondary"
          width="100%"
        >
          {formatMessage(messages.importInputs)}
        </ButtonWithLink>
        <NewIdeaButton
          participationMethod={phase.attributes.participation_method}
          inputTerm={phase.attributes.input_term}
          to="/projects/$slug/ideas/new"
          params={{ slug: project.attributes.slug }}
          search={{ phase_id: phase.id }}
        />
      </Box>
    </Card>
  );
};

export default OfflineCollection;
