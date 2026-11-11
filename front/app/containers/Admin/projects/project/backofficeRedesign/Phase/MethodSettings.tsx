import React, { useEffect, useRef, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import {
  IPhaseData,
  IUpdatedPhaseProperties,
  ParticipationMethod,
} from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { AccessOnlyAction } from 'containers/Admin/projects/_shared/components/PhaseActionAccessRow';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import PanelHeading from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelHeading';
import projectMessages from 'containers/Admin/projects/project/messages';
import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import ModerationAssignee from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/inputs/_shared/ModerationAssignee';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';
import { validateParticipation } from 'containers/Admin/projects/project/phaseSetup/validate';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isCLErrorsWrapper } from 'utils/errorUtils';
import { useSearch } from 'utils/router';

import EditAccessButton from './EditAccessButton';
import messages from './messages';
import PanelSettings from './PanelSettings';
import ParticipantActionsGroup from './ParticipantActionsGroup';
import PhaseNotifications from './PhaseNotifications';

const METHODS_WITH_ACTION_ROWS: ParticipationMethod[] = [
  'ideation',
  'proposals',
  'common_ground',
  'voting',
  'native_survey',
  'poll',
  'survey',
];

const ACCESS_ONLY_ACTIONS: Partial<
  Record<ParticipationMethod, AccessOnlyAction[]>
> = {
  information: [
    { action: 'attending_event', label: projectMessages.attendingEventAction },
  ],
  volunteering: [
    { action: 'volunteering', label: configMessages.volunteeringAction2 },
    { action: 'attending_event', label: projectMessages.attendingEventAction },
  ],
  document_annotation: [
    { action: 'annotating_document', label: messages.annotatingDocumentAction },
    { action: 'attending_event', label: projectMessages.attendingEventAction },
  ],
};

interface Props {
  phase: IPhaseData;
}

const MethodSettings = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const { setup_action } = useSearch({ strict: false });
  const openedSection = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (setup_action) {
      const section =
        setup_action === 'moderation'
          ? document.getElementById('phase-moderation-settings')
          : openedSection.current;
      section?.scrollIntoView({ block: 'nearest' });
    }
  }, [setup_action]);
  const { data: phaseWithRelationships } = usePhase(phase.id);
  const { mutateAsync: updatePhase } = useUpdatePhase();

  const [formData, setFormData] = useState<IUpdatedPhaseProperties>(
    phase.attributes
  );
  const [changes, setChanges] = useState<Partial<IUpdatedPhaseProperties>>({});
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const participationMethod = phase.attributes.participation_method;
  const accessOnlyActions = ACCESS_ONLY_ACTIONS[participationMethod];

  const handleChange = (
    config: IUpdatedPhaseProperties,
    changedFields: Partial<IUpdatedPhaseProperties>
  ) => {
    setChanges((changes) => ({ ...changes, ...changedFields }));
    setFormData(config);
  };

  const save = async () => {
    const { isValidated, errors } = validateParticipation(
      formData,
      formatMessage
    );

    setValidationErrors(errors);
    if (!isValidated) throw new Error('Invalid participation settings');

    try {
      await updatePhase({ phaseId: phase.id, ...changes });
      setChanges({});
      setErrors(null);
    } catch (error) {
      if (isCLErrorsWrapper(error)) setErrors(error.errors);
      throw error;
    }
  };

  useRegisterPageSaver('settings', {
    dirty: Object.keys(changes).length > 0,
    save,
  });

  return (
    <PanelSettings p="0 18px 24px">
      {accessOnlyActions ? (
        <>
          <Box mb="10px">
            <PanelHeading label={formatMessage(configMessages.settingsGroup)} />
          </Box>
          <ParticipantActionsGroup
            phaseId={phase.id}
            actions={accessOnlyActions}
          />
        </>
      ) : (
        <PhaseParticipationConfig
          phase={phaseWithRelationships}
          formData={formData}
          validationErrors={validationErrors}
          apiErrors={errors}
          onChange={handleChange}
          setValidationErrors={setValidationErrors}
          hideMethodPicker
          layout="panel"
        />
      )}

      <EditAccessButton
        phaseId={phase.id}
        initialOpened={setup_action === 'access'}
        showButton={
          !accessOnlyActions &&
          !METHODS_WITH_ACTION_ROWS.includes(participationMethod)
        }
        onClose={() => {
          if (setup_action === 'access') removeSearchParams(['setup_action']);
        }}
      />

      <Box ref={setup_action === 'notifications' ? openedSection : undefined}>
        <PanelGroup
          label={formatMessage(messages.notifications)}
          defaultOpen={setup_action === 'notifications'}
        >
          <PhaseNotifications phase={phase} />
        </PanelGroup>
      </Box>

      {participationMethod === 'voting' && (
        <Box id="phase-moderation-settings">
          <PanelGroup
            label={formatMessage(configMessages.moderationGroup)}
            defaultOpen
          >
            <ModerationAssignee phaseId={phase.id} />
          </PanelGroup>
        </Box>
      )}
    </PanelSettings>
  );
};

export default MethodSettings;
