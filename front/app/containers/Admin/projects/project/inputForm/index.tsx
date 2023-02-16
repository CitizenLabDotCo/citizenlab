import { Button, Box } from '@citizenlab/cl2-component-library';
import React from 'react';

// components
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// router
import clHistory from 'utils/cl-router/history';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// hooks
import { useParams } from 'react-router-dom';
import usePhases from 'hooks/usePhases';
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentPhase, IPhaseData } from 'services/phases';

export const IdeaForm = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const phases = usePhases(projectId);
  let phaseToUse;
  if (!isNilOrError(phases)) {
    phaseToUse = getCurrentOrLastIdeationPhase(phases);
  }

  return (
    <Box gap="0px" flexWrap="wrap" width="100%" display="flex">
      <Box width="100%">
        <SectionTitle>
          <FormattedMessage {...messages.inputForm} />
        </SectionTitle>
        <SectionDescription style={{ marginRight: '600px' }}>
          <FormattedMessage {...messages.inputFormDescription} />
        </SectionDescription>
      </Box>
      <Box>
        <Button
          onClick={() => {
            phaseToUse
              ? clHistory.push(
                  `/admin/projects/${projectId}/phases/${phaseToUse.id}/ideaform/edit`
                )
              : clHistory.push(`/admin/projects/${projectId}/ideaform/edit`);
          }}
          width="auto"
          icon="edit"
          data-cy="e2e-edit-input-form"
        >
          <FormattedMessage {...messages.editInputForm} />
        </Button>
      </Box>
    </Box>
  );
};

const isIdeationContext = (participationContext: string | undefined) => {
  return (
    participationContext === 'ideation' || participationContext === 'budgeting'
  );
};

const getCurrentOrLastIdeationPhase = (phases: IPhaseData[]) => {
  const currentPhase = getCurrentPhase(phases);
  if (isIdeationContext(currentPhase?.attributes.participation_method)) {
    return currentPhase;
  }
  const ideationPhases = phases.filter((phase) =>
    isIdeationContext(phase.attributes.participation_method)
  );
  if (ideationPhases.length > 0) {
    return ideationPhases.pop();
  }
  return undefined;
};

export default IdeaForm;
