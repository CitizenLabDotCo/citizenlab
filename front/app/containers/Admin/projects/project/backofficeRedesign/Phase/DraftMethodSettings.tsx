import React from 'react';

import 'design-system/tokens.css';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import { useIntl } from 'utils/cl-intl';

import styles from './DraftMethodSettings.module.css';
import messages from './messages';

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
    <div className={styles.panel}>
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

      <p className={styles.hint}>
        {formatMessage(messages.saveToEditSettings)}
      </p>
    </div>
  );
};

export default DraftMethodSettings;
