import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
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

// The settings of a phase that isn't saved yet. They are sent along when the
// build panel creates the phase, so there is no save button here.
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

      <Text fontSize="s" color="textSecondary">
        {formatMessage(messages.saveToEditSettings)}
      </Text>
    </PanelSettings>
  );
};

export default DraftPhaseRightPanel;
