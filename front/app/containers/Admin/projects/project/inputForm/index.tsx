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

export const IdeaForm = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const phases = usePhases(projectId);
  const ideationPhases = !isNilOrError(phases)
    ? phases.filter(
        (phase) => phase.attributes.participation_method === 'ideation'
      )
    : [];
  const ideationPhaseId = ideationPhases.length > 0 ? ideationPhases[0].id : '';

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
            ideationPhaseId
              ? clHistory.push(
                  `/admin/projects/${projectId}/phases/${ideationPhaseId}/ideaform/edit`
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

export default IdeaForm;
