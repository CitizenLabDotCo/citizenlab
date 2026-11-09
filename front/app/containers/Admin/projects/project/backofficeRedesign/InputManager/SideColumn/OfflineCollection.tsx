import React, { ReactNode } from 'react';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import NewIdeaButton from 'containers/Admin/projects/_shared/components/NewIdeaButton';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { actionRowProps } from './actionRowProps';
import Card from './Card';
import OfflineFormsButton from './OfflineFormsButton';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
  /** Further actions, listed after the offline ones. */
  children?: ReactNode;
}

const OfflineCollection = ({ project, phase, children }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Card fillHeight>
      <NewIdeaButton
        participationMethod={phase.attributes.participation_method}
        inputTerm={phase.attributes.input_term}
        to="/projects/$slug/ideas/new"
        params={{ slug: project.attributes.slug }}
        search={{ phase_id: phase.id }}
        buttonProps={actionRowProps}
      />
      <ButtonWithLink
        {...actionRowProps}
        to="/admin/projects/$projectId/phases/$phaseId/input-importer"
        params={{ projectId: project.id, phaseId: phase.id }}
        icon="upload-file"
      >
        {formatMessage(messages.importInputs)}
      </ButtonWithLink>
      <OfflineFormsButton
        participationMethod={phase.attributes.participation_method}
      />
      {children}
    </Card>
  );
};

export default OfflineCollection;
