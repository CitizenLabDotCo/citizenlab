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
import { SurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';
import { validateDates } from 'containers/Admin/projects/project/phaseSetup/validate';

import { useIntl } from 'utils/cl-intl';

import { useRegisterPhaseSaver } from '../../_shared/PhaseSaveContext';

import BuildFields from './BuildFields';
import SwitchSurveyMethodModal from './SwitchSurveyMethodModal';
import useSurveyMethodLocks from './useSurveyMethodLocks';

interface Props {
  projectId: string;
  phase: IPhaseData;
  savedAttachments: IFileAttachmentData[];
}

const BuildPanel = ({ projectId, phase, savedAttachments }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(projectId);
  const { mutateAsync: updatePhase } = useUpdatePhase();

  const [formData, setFormData] = useState<IUpdatedPhaseProperties>(
    phase.attributes
  );
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [pendingSurveyMethod, setPendingSurveyMethod] =
    useState<SurveyMethod | null>(null);
  const surveyMethodLocks = useSurveyMethodLocks(phase);

  const files = usePhaseFileAttachments({
    projectId,
    phaseId: phase.id,
    savedAttachments,
    onStage: () => setDirty(true),
  });

  // Detached phases skip the timeline rules: their dates may overlap and stay
  // open-ended.
  const standalone = !isTimelinePhase(phase);

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setDirty(true);
    setFormData((formData) => ({ ...formData, ...newData }));
  };

  const save = async () => {
    const { isValidated, errors } = validateDates(
      formData,
      phases,
      formatMessage,
      phase.id,
      standalone
    );

    setValidationErrors(errors);
    if (!isValidated) throw new Error('Invalid phase dates');

    try {
      const response = await updatePhase({
        phaseId: phase.id,
        title_multiloc: formData.title_multiloc,
        start_at: formData.start_at,
        end_at: formData.end_at,
      });
      setFormData(response.data.attributes);
      await files.save(phase.id);
      setErrors(null);
      setDirty(false);
    } catch (reason) {
      setErrors(fileAttachmentErrors(reason));
      throw reason;
    }
  };

  useRegisterPhaseSaver('build', { dirty, save });

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
          surveyMethodSwitch={{
            disabledReasons: surveyMethodLocks,
            onSelect: setPendingSurveyMethod,
          }}
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

      <SwitchSurveyMethodModal
        phase={phase}
        method={pendingSurveyMethod}
        onClose={() => setPendingSurveyMethod(null)}
      />
    </Box>
  );
};

export default BuildPanel;
