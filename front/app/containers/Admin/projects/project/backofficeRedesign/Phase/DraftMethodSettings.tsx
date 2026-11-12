import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import assigneeMessages from 'components/admin/ProjectAssignee/messages';
import ErrorMessage from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import PanelSettings from './PanelSettings';

// Information has nothing to set here, and document annotation's Konveio link
// sits in the build panel.
const METHODS_WITHOUT_SETTINGS: ParticipationMethod[] = [
  'information',
  'document_annotation',
];

export type SetupSettingsAction = 'access' | 'notifications' | 'moderation';

interface Props {
  onOpenSetting: (action: SetupSettingsAction) => Promise<void>;
  saving: boolean;
  uploading: boolean;
  saveError?: string;
  formData: IUpdatedPhaseProperties;
  validationErrors: ValidationErrors;
  apiErrors: CLErrors | null;
  onChange: (formData: IUpdatedPhaseProperties) => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

const DraftMethodSettings = ({
  onOpenSetting,
  saving,
  uploading,
  saveError,
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
      buttonStyle="bo-secondary"
      width="100%"
      data-cy="draft-moderation-settings"
      disabled={saving || uploading}
      processing={opening === 'moderation'}
      onClick={() => open('moderation')}
    >
      {formatMessage(assigneeMessages.assignee)}
    </Button>
  );

  return (
    <PanelSettings p="0 18px 24px">
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
        />
      )}

      <Box display="flex" flexDirection="column" gap="10px">
        <Button
          buttonStyle="bo-secondary"
          width="100%"
          data-cy="draft-access-settings"
          disabled={saving || uploading}
          processing={opening === 'access'}
          onClick={() => open('access')}
        >
          {formatMessage(messages.editAccess)}
        </Button>
        <PanelGroup label={formatMessage(messages.notifications)} defaultOpen>
          <Button
            buttonStyle="bo-secondary"
            width="100%"
            data-cy="draft-notification-settings"
            disabled={saving || uploading}
            processing={opening === 'notifications'}
            onClick={() => open('notifications')}
          >
            {formatMessage(messages.notifications)}
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
        {saveError && <ErrorMessage text={saveError} />}
      </Box>
    </PanelSettings>
  );
};

export default DraftMethodSettings;
