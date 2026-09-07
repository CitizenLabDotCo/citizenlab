import React, { useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { isTimelinePhase } from 'api/phases/utils';

import SubmitWrapper from 'components/admin/SubmitWrapper';

import { useIntl } from 'utils/cl-intl';

import PhaseParticipationConfig from '../../../phaseSetup/components/PhaseParticipationConfig';
import phaseSetupMessages from '../../../phaseSetup/messages';
import { SubmitStateType, ValidationErrors } from '../../../phaseSetup/typings';
import validate from '../../../phaseSetup/validate';

import ReportSection from './ReportSection';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const PhaseRightPanel = ({ projectId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(projectId);
  const { data: phaseWithRelationships } = usePhase(phase.id);
  const { mutate: updatePhase } = useUpdatePhase();

  const [formData, setFormData] = useState<IUpdatedPhaseProperties>(
    phase.attributes
  );
  // The method settings are spread across many fields, so the panel tracks
  // what it actually changed rather than sending the whole attribute set and
  // undoing what the left panel saved.
  const [changes, setChanges] = useState<IUpdatedPhaseProperties>({});
  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const handleChange = (config: IUpdatedPhaseProperties) => {
    setSubmitState('enabled');
    setFormData((formData) => ({ ...formData, ...config }));
    setChanges((changes) => ({ ...changes, ...config }));
  };

  const handleSave = () => {
    if (processing) return;

    const { isValidated, errors } = validate(
      formData,
      phases,
      formatMessage,
      phase.id,
      !isTimelinePhase(phase)
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

  // An information phase has no participation to configure, so its panel holds
  // the report instead, which saves through its own builder.
  const isInformation = phase.attributes.participation_method === 'information';

  return (
    <Box display="flex" flexDirection="column" minHeight="100%">
      <Box flexGrow={1} p="20px">
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
          />
        )}
      </Box>

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
