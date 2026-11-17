import React, { ReactNode, useState } from 'react';

import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import assigneeMessages from 'components/admin/ProjectAssignee/messages';

import Button from 'design-system/Button';

import { useIntl } from 'utils/cl-intl';

import styles from './DraftMethodSettings.module.css';
import messages from './messages';
import 'design-system/tokens.css';

// Information has nothing to set here, and document annotation's Konveio link
// sits in the build panel.
const METHODS_WITHOUT_SETTINGS: ParticipationMethod[] = [
  'information',
  'document_annotation',
];

export type SetupSettingsAction = 'access' | 'notifications' | 'moderation';

interface Props {
  surveyPlacement?: ReactNode;
  onOpenSetting: (action: SetupSettingsAction) => Promise<void>;
  saving: boolean;
  uploading: boolean;
  formData: IUpdatedPhaseProperties;
  validationErrors: ValidationErrors;
  apiErrors: CLErrors | null;
  onChange: (formData: IUpdatedPhaseProperties) => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const DraftMethodSettings = ({
  surveyPlacement,
  onOpenSetting,
  saving,
  uploading,
  formData,
  validationErrors,
  apiErrors,
  onChange,
  setValidationErrors,
}: Props) => {
  const { formatMessage } = useIntl();
  const [opening, setOpening] = useState<SetupSettingsAction>();

  const open = async (action: SetupSettingsAction) => {
    if (saving || uploading || opening) return;

    setOpening(action);
    try {
      await onOpenSetting(action);
    } finally {
      setOpening(undefined);
    }
  };

  const moderationAction = (
    <Button
      variant="secondary"
      size={32}
      data-cy="draft-moderation-settings"
      isDisabled={saving || uploading}
      isPending={opening === 'moderation'}
      onPress={() => open('moderation')}
    >
      {formatMessage(assigneeMessages.assignee)}
    </Button>
  );

  return (
    <div className={styles.panel}>
      {!METHODS_WITHOUT_SETTINGS.some(
        (method) => method === formData.participation_method
      ) && (
        <PhaseParticipationConfig
          moderationAction={moderationAction}
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
        <Button
          variant="secondary"
          size={32}
          data-cy="draft-access-settings"
          isDisabled={saving || uploading}
          isPending={opening === 'access'}
          onPress={() => open('access')}
        >
          {formatMessage(messages.editAccess)}
        </Button>
        <PanelGroup
          label={formatMessage(messages.participantCommunications)}
          defaultOpen
        >
          <Button
            variant="secondary"
            size={32}
            data-cy="draft-notification-settings"
            isDisabled={saving || uploading}
            isPending={opening === 'notifications'}
            onPress={() => open('notifications')}
          >
            {formatMessage(messages.participantCommunications)}
          </Button>
        </PanelGroup>
        {formData.participation_method === 'voting' && (
          <PanelGroup
            label={formatMessage(configMessages.moderationGroup)}
            defaultOpen
          >
            {moderationAction}
          </PanelGroup>
        )}
      </div>
    </div>
  );
};

export default DraftMethodSettings;
