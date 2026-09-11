import React, { useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { isTimelinePhase } from 'api/phases/utils';

import usePhaseFileAttachments, {
  fileAttachmentErrors,
} from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import PhaseDescription from 'containers/Admin/projects/project/phaseDescription';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import {
  SubmitStateType,
  ValidationErrors,
} from 'containers/Admin/projects/project/phaseSetup/typings';
import { validateDates } from 'containers/Admin/projects/project/phaseSetup/validate';

import SubmitWrapper from 'components/admin/SubmitWrapper';
import Error from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import FormSection from './FormSection';
import PanelField from './PanelField';
import PhaseDates from './PhaseDates';

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
        <PhaseDates
          formData={formData}
          errors={errors}
          validationErrors={validationErrors}
          standalone={standalone}
          onChange={(dates) => {
            setValidationErrors((errors) => ({
              ...errors,
              phaseDateError: undefined,
            }));
            updateFormData(dates);
          }}
        />

        <PanelField
          label={<FormattedMessage {...phaseSetupMessages.titleLabel} />}
        >
          <InputMultilocWithLocaleSwitcher
            id="phase-build-panel-title"
            type="text"
            valueMultiloc={formData.title_multiloc}
            onChange={(title_multiloc: Multiloc) =>
              updateFormData({ title_multiloc })
            }
            className="intercom-admin-phase-name"
          />
          <Error apiErrors={errors?.title_multiloc} />
        </PanelField>

        <Box mb="16px">
          <PhaseDescription />
        </Box>

        <PanelField
          label={<FormattedMessage {...phaseSetupMessages.uploadAttachments} />}
        >
          <FileRepositorySelectAndUpload
            id="phase-build-panel-file-uploader"
            onFileAdd={files.uploadFile}
            onFileRemove={files.removeFile}
            onFileReorder={files.reorderFiles}
            onFileAttach={files.attachFile}
            fileAttachments={files.attachments}
            enableDragAndDrop
            apiErrors={errors}
            maxSizeMb={10}
            isUploadingFile={files.isUploadingFile}
          />
        </PanelField>

        <FormSection projectId={projectId} phase={phase} />

        {errors?.base && <Error apiErrors={errors.base} />}
      </Box>

      <Box
        position="sticky"
        bottom="0"
        px="20px"
        py="12px"
        background={colors.white}
        borderTop={`1px solid ${colors.grey200}`}
        className="intercom-phase-save-button"
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
    </Box>
  );
};

export default BuildPanel;
