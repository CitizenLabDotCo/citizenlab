import React from 'react';

// components
import Button from 'components/UI/Button';
import { Box } from '@citizenlab/cl2-component-library';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// hooks
import { useParams } from 'react-router-dom';
import usePhases from 'api/phases/usePhases';
import useLocale from 'hooks/useLocale';

// utils
import { getCurrentPhase } from 'api/phases/utils';
import { saveIdeaFormAsPDF } from './saveIdeaFormAsPDF';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IPhaseData } from 'api/phases/types';
import { ParticipationMethod } from 'services/participationContexts';

export const IdeaForm = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const locale = useLocale();
  const { data: phases } = usePhases(projectId);

  const phaseToUse = phases ? getCurrentOrLastIdeationPhase(phases.data) : null;

  const ideaFormLink = phaseToUse
    ? `/admin/projects/${projectId}/phases/${phaseToUse.id}/ideaform/edit`
    : `/admin/projects/${projectId}/ideaform/edit`;

  const saveIdeaForm = async () => {
    if (isNilOrError(locale)) return;
    await saveIdeaFormAsPDF({ projectId, locale });
  };

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
      <Box display="flex" flexDirection="row">
        <Button
          linkTo={ideaFormLink}
          width="auto"
          icon="edit"
          data-cy="e2e-edit-input-form"
        >
          <FormattedMessage {...messages.editInputForm} />
        </Button>
        <Box ml="8px">
          <Button
            onClick={saveIdeaForm}
            width="auto"
            icon="download"
            data-cy="e2e-save-input-form-pdf"
          >
            <FormattedMessage {...messages.downloadInputForm} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

const isIdeationContext = (
  participationContext: ParticipationMethod | undefined
) => {
  return (
    participationContext === 'ideation' || participationContext === 'voting'
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
