import React, { useState } from 'react';

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
import projectMessages from 'containers/Admin/projects/project/messages';
import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';
import { validateParticipation } from 'containers/Admin/projects/project/phaseSetup/validate';

import { useIntl } from 'utils/cl-intl';
import { isCLErrorsWrapper } from 'utils/errorUtils';

import { useRegisterPageSaver } from '../_shared/PageSaveContext';
import messages from '../messages';

import EditAccessButton from './EditAccessButton';
import PanelSettings from './PanelSettings';
import ParticipantActionsGroup from './ParticipantActionsGroup';
import PhaseNotifications from './PhaseNotifications';

const METHODS_WITH_ACTION_TOGGLES: ParticipationMethod[] = [
  'ideation',
  'proposals',
  'common_ground',
  'voting',
];

const ACCESS_ONLY_ACTIONS: Partial<
  Record<ParticipationMethod, AccessOnlyAction[]>
> = {
  information: [
    { action: 'attending_event', label: projectMessages.attendingEventAction },
  ],
  volunteering: [
    { action: 'volunteering', label: configMessages.volunteeringAction },
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
        <ParticipantActionsGroup
          phaseId={phase.id}
          actions={accessOnlyActions}
        />
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

      {!accessOnlyActions &&
        !METHODS_WITH_ACTION_TOGGLES.includes(participationMethod) && (
          <EditAccessButton phaseId={phase.id} />
        )}

      <PanelGroup label={formatMessage(messages.notifications)}>
        <PhaseNotifications phase={phase} />
      </PanelGroup>
    </PanelSettings>
  );
};

export default MethodSettings;
