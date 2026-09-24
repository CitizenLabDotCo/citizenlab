import React from 'react';

import { NewBOText } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import PanelSettings from './PanelSettings';

interface Props {
  formData: IUpdatedPhaseProperties;
  validationErrors: ValidationErrors;
  apiErrors: CLErrors | null;
  onChange: (formData: IUpdatedPhaseProperties) => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const DraftPhaseRightPanel = ({
  formData,
  validationErrors,
  apiErrors,
  onChange,
  setValidationErrors,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <PanelSettings p="20px">
      {formData.participation_method !== 'information' && (
        <PhaseParticipationConfig
          formData={formData}
          validationErrors={validationErrors}
          apiErrors={apiErrors}
          onChange={onChange}
          setValidationErrors={setValidationErrors}
          hideMethodPicker
          layout="panel"
        />
      )}

      <NewBOText variant="helper">
        {formatMessage(messages.saveToEditSettings)}
      </NewBOText>
    </PanelSettings>
  );
};

export default DraftPhaseRightPanel;
