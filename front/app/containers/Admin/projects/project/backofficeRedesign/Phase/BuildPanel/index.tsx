import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { isTimelinePhase } from 'api/phases/utils';

import usePhaseFileAttachments, {
  fileAttachmentErrors,
} from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import {
  SubmitStateType,
  ValidationErrors,
} from 'containers/Admin/projects/project/phaseSetup/typings';
import { validateDates } from 'containers/Admin/projects/project/phaseSetup/validate';

import { useIntl } from 'utils/cl-intl';

import BuildFields from './BuildFields';
import SaveBar from './SaveBar';

interface Props {
  projectId: string;
  phase: IPhaseData;
  savedAttachments: IFileAttachmentData[];
}

const BuildPanel = ({ projectId, phase, savedAttachments }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(projectId);
  const { mutate: updatePhase } = useUpdatePhase();

  const [formData, setFormData] = useState<IUpdatedPhaseProperties>(
    phase.attributes
  );
  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const files = usePhaseFileAttachments({
    projectId,
    phaseId: phase.id,
    savedAttachments,
    onStage: () => setSubmitState('enabled'),
  });

  // Detached phases skip the timeline rules: their dates may overlap and stay
  // open-ended.
  const standalone = !isTimelinePhase(phase);

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setSubmitState('enabled');
    setFormData((formData) => ({ ...formData, ...newData }));
  };

  const handleSaveError = (reason: unknown) => {
    setErrors(fileAttachmentErrors(reason));
    setProcessing(false);
    setSubmitState('error');
  };

  const handleSave = () => {
    if (processing) return;

    const { isValidated, errors } = validateDates(
      formData,
      phases,
      formatMessage,
      phase.id,
      standalone
    );

    setValidationErrors(errors);
    if (!isValidated) return;

    setProcessing(true);
    updatePhase(
      {
        phaseId: phase.id,
        title_multiloc: formData.title_multiloc,
        start_at: formData.start_at,
        end_at: formData.end_at,
      },
      {
        onSuccess: (response) => {
          setFormData(response.data.attributes);
          files
            .save(phase.id)
            .then(() => {
              setErrors(null);
              setProcessing(false);
              setSubmitState('success');
            })
            .catch(handleSaveError);
        },
        onError: handleSaveError,
      }
    );
  };

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} minHeight="0">
      <Box flexGrow={1} px="20px" pb="20px">
        <BuildFields
          projectId={projectId}
          phaseId={phase.id}
          participationMethod={phase.attributes.participation_method}
          formData={formData}
          errors={errors}
          validationErrors={validationErrors}
          standalone={standalone}
          files={files}
          onChange={updateFormData}
          onDatesChange={(dates) => {
            setValidationErrors((errors) => ({
              ...errors,
              phaseDateError: undefined,
            }));
            updateFormData(dates);
          }}
        />
      </Box>

      <SaveBar status={submitState} loading={processing} onClick={handleSave} />
    </Box>
  );
};

export default BuildPanel;
