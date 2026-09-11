import React, { useState } from 'react';

import { Box, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { CLErrors } from 'typings';

import { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import CustomMapConfigPage from 'containers/Admin/CustomMapConfigPage';
import PanelRowModal from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelRowModal';

import { SubSectionTitle } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import AdminPhaseEmailWrapper from '../../../admin_phase_email_wrapper';
import ActionForms from '../../../permissions/Phase/ActionForms';
import PhaseParticipationConfig from '../../../phaseSetup/components/PhaseParticipationConfig';
import phaseSetupMessages from '../../../phaseSetup/messages';
import { SubmitStateType, ValidationErrors } from '../../../phaseSetup/typings';
import { validateParticipation } from '../../../phaseSetup/validate';
import messages from '../messages';

import ReportSection from './ReportSection';

// The settings are built for a full-width page, where their own titles carry
// the section. Here the group row carries it, so they step down to label scale.
const PanelSettings = styled(Box)`
  ${SubSectionTitle} {
    font-size: ${fontSizes.s}px;
    color: ${colors.textPrimary};
  }
`;

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const PhaseRightPanel = ({ projectId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phaseWithRelationships } = usePhase(phase.id);
  const { mutate: updatePhase } = useUpdatePhase();

  const [formData, setFormData] = useState<IUpdatedPhaseProperties>(
    phase.attributes
  );
  // The left panel edits the same phase, so only the fields this one changed
  // are sent: the whole attribute set would undo what the left panel saved.
  const [changes, setChanges] = useState<Partial<IUpdatedPhaseProperties>>({});
  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const participationMethod = phase.attributes.participation_method;
  const isInformation = participationMethod === 'information';

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
        {isInformation ? (
          <ReportSection projectId={projectId} phase={phase} />
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

        <PanelRowModal label={formatMessage(messages.accessRights)}>
          <ActionForms phaseId={phase.id} />
        </PanelRowModal>

        {getMethodConfig(participationMethod).supportsMapView && (
          <PanelRowModal
            label={formatMessage(messages.mapConfiguration)}
            width="1100px"
          >
            <CustomMapConfigPage />
          </PanelRowModal>
        )}

        <PanelRowModal label={formatMessage(messages.notifications)}>
          <AdminPhaseEmailWrapper />
        </PanelRowModal>
      </PanelSettings>

      {!isInformation && (
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
