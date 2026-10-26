import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import PanelSettings from './PanelSettings';

// Information has nothing to set here, and document annotation's Konveio link
// sits in the build panel.
const METHODS_WITHOUT_SETTINGS: ParticipationMethod[] = [
  'information',
  'document_annotation',
];

interface Props {
  formData: IUpdatedPhaseProperties;
  validationErrors: ValidationErrors;
  apiErrors: CLErrors | null;
  onChange: (formData: IUpdatedPhaseProperties) => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const DraftMethodSettings = ({
  formData,
  validationErrors,
  apiErrors,
  onChange,
  setValidationErrors,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <PanelSettings p="0 18px 24px">
      {!METHODS_WITHOUT_SETTINGS.some(
        (method) => method === formData.participation_method
      ) && (
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

      <Text variant="boHelper">
        {formatMessage(messages.saveToEditSettings)}
      </Text>
    </PanelSettings>
  );
};

export default DraftMethodSettings;
