import React, { lazy, Suspense, useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import {
  IPhaseData,
  IUpdatedPhaseProperties,
  ParticipationMethod,
} from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { AccessOnlyAction } from 'containers/Admin/projects/_shared/components/PhaseActionAccessRow';
import PanelRowModal from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelRowModal';
import AdminPhaseEmailWrapper from 'containers/Admin/projects/project/admin_phase_email_wrapper';
import projectMessages from 'containers/Admin/projects/project/messages';
import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';
import { validateParticipation } from 'containers/Admin/projects/project/phaseSetup/validate';

import Centerer from 'components/UI/Centerer';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isCLErrorsWrapper } from 'utils/errorUtils';

import { useRegisterPhaseSaver } from '../_shared/PhaseSaveContext';
import messages from '../messages';

import EditAccessButton from './EditAccessButton';
import PanelSettings from './PanelSettings';
import ParticipantActionsGroup from './ParticipantActionsGroup';

// Lazy so ArcGIS stays out of the chunk every workspace page loads, and only
// arrives once the map modal is opened.
const CustomMapConfigPage = lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);

const METHODS_WITH_ACTION_TOGGLES: ParticipationMethod[] = [
  'ideation',
  'proposals',
  'common_ground',
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
};

interface Props {
  phase: IPhaseData;
}

const PhaseRightPanel = ({ phase }: Props) => {
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

  useRegisterPhaseSaver('settings', {
    dirty: Object.keys(changes).length > 0,
    save,
  });

  return (
    <Box display="flex" flexDirection="column" minHeight="100%">
      <PanelSettings flexGrow={1} p="20px">
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

        {getMethodConfig(participationMethod).supportsMapView && (
          <PanelRowModal
            label={formatMessage(messages.mapConfiguration)}
            width="1100px"
          >
            <Suspense
              fallback={
                <Centerer height="500px">
                  <Spinner />
                </Centerer>
              }
            >
              <CustomMapConfigPage />
            </Suspense>
          </PanelRowModal>
        )}

        <PanelRowModal label={formatMessage(messages.notifications)}>
          <AdminPhaseEmailWrapper />
        </PanelRowModal>
      </PanelSettings>
    </Box>
  );
};

export default PhaseRightPanel;
