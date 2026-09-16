import React, { lazy, Suspense, useState } from 'react';

import { Box, colors, Spinner } from '@citizenlab/cl2-component-library';
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
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import {
  SubmitStateType,
  ValidationErrors,
} from 'containers/Admin/projects/project/phaseSetup/typings';
import { validateParticipation } from 'containers/Admin/projects/project/phaseSetup/validate';

import SubmitWrapper from 'components/admin/SubmitWrapper';
import Centerer from 'components/UI/Centerer';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from '../messages';

import EditAccessButton from './EditAccessButton';
import PanelSettings from './PanelSettings';
import ParticipantActionsGroup from './ParticipantActionsGroup';

// Lazy so ArcGIS stays out of the chunk every workspace page loads, and only
// arrives once the map modal is opened.
const CustomMapConfigPage = lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);

// The methods that render the participant action toggles, each with a link to
// that action's access rights.
const ACTIONS_WITH_TOGGLES: ParticipationMethod[] = [
  'ideation',
  'proposals',
  'common_ground',
];

// The methods whose only settings are who may take each action.
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
  const { mutate: updatePhase } = useUpdatePhase();

  const [formData, setFormData] = useState<IUpdatedPhaseProperties>(
    phase.attributes
  );
  const [changes, setChanges] = useState<Partial<IUpdatedPhaseProperties>>({});
  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const [processing, setProcessing] = useState(false);
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
    setSubmitState('enabled');
    setChanges((changes) => ({ ...changes, ...changedFields }));
    setFormData(config);
  };

  const handleSave = () => {
    if (processing) return;

    const { isValidated, errors } = validateParticipation(
      formData,
      formatMessage
    );

    setValidationErrors(errors);
    if (!isValidated) return;

    setProcessing(true);
    updatePhase(
      { phaseId: phase.id, ...changes },
      {
        onSuccess: () => {
          setChanges({});
          setErrors(null);
          setProcessing(false);
          setSubmitState('success');
        },
        onError: ({ errors }: { errors: CLErrors }) => {
          setErrors(errors);
          setProcessing(false);
          setSubmitState('error');
        },
      }
    );
  };

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
          !ACTIONS_WITH_TOGGLES.includes(participationMethod) && (
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

      {!accessOnlyActions && (
        <Box
          position="sticky"
          bottom="0"
          px="20px"
          py="12px"
          background={colors.white}
          borderTop={`1px solid ${colors.grey200}`}
        >
          <SubmitWrapper
            onClick={handleSave}
            loading={processing}
            status={submitState}
            messages={{
              buttonSave: phaseSetupMessages.saveChangesLabel,
              buttonSuccess: phaseSetupMessages.saveSuccessLabel,
              messageError: phaseSetupMessages.saveErrorMessage,
              messageSuccess: phaseSetupMessages.saveSuccessMessage,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default PhaseRightPanel;
