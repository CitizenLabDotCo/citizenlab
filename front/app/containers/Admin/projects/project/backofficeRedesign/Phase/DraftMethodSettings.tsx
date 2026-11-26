import React, { ReactNode } from 'react';

import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import ExpandAllContext from 'containers/Admin/projects/_shared/components/SettingsPanel/ExpandAllContext';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import useExpandAll from 'containers/Admin/projects/_shared/components/SettingsPanel/useExpandAll';
import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import ModerationAssignee from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/inputs/_shared/ModerationAssignee';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import postManagerMessages from 'components/admin/PostManager/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './DraftMethodSettings.module.css';
import messages from './messages';
import SaveFirstCard from './SaveFirstCard';
import 'design-system/tokens.css';

// Information has nothing to set here, and document annotation's Konveio link
// sits in the build panel.
const METHODS_WITHOUT_SETTINGS: ParticipationMethod[] = [
  'information',
  'document_annotation',
];

interface Props {
  surveyPlacement?: ReactNode;
  formData: IUpdatedPhaseProperties;
  validationErrors: ValidationErrors;
  apiErrors: CLErrors | null;
  onChange: (formData: IUpdatedPhaseProperties) => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const DraftMethodSettings = ({
  surveyPlacement,
  formData,
  validationErrors,
  apiErrors,
  onChange,
  setValidationErrors,
}: Props) => {
  const { formatMessage } = useIntl();
  const expandAll = useExpandAll();

  return (
    <ExpandAllContext.Provider value={expandAll}>
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
            surveyPlacement={surveyPlacement}
          />
        )}

        <div className={styles.actions}>
          <SaveFirstCard
            title={formatMessage(messages.draftAccessTitle)}
            actionLabel={formatMessage(messages.editAccess)}
            reason={formatMessage(messages.saveFirstToEditAccess)}
          />
          <SaveFirstCard
            title={formatMessage(messages.participantCommunications)}
            actionLabel={formatMessage(messages.editCommunications)}
            reason={formatMessage(messages.saveFirstToEditCommunications)}
          />
          {formData.participation_method === 'voting' && (
            <PanelGroup label={formatMessage(postManagerMessages.assignee)}>
              <ModerationAssignee />
            </PanelGroup>
          )}
        </div>
      </div>
    </ExpandAllContext.Provider>
  );
};

export default DraftMethodSettings;
