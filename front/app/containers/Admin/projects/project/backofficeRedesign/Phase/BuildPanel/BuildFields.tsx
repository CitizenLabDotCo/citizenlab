import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import usePhaseFileAttachments from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import { PhaseDates as Dates } from 'containers/Admin/projects/project/phaseSetup/components/PhaseDatePicker';
import { isSurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import Error from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import FileSelectOrUploadModal from 'components/UI/FileRepositorySelectAndUpload/components/FileSelectOrUploadModal';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import eventMessages from '../../Event/messages';

import DescriptionField from './DescriptionField';
import MethodSection from './MethodSection';
import PanelField from './PanelField';
import PhaseDates from './PhaseDates';
import setupTitle from './setupTitle';
import SurveyMethodSection, { SurveyMethodSwitch } from './SurveyMethodSection';

interface Props {
  projectId: string;
  /** Absent while the phase isn't saved yet. */
  phaseId?: string;
  participationMethod: ParticipationMethod;
  formData: IUpdatedPhaseProperties;
  errors: CLErrors | null;
  validationErrors: ValidationErrors;
  standalone: boolean;
  files: ReturnType<typeof usePhaseFileAttachments>;
  surveyMethodSwitch: SurveyMethodSwitch;
  onChange: (newData: Partial<IUpdatedPhaseProperties>) => void;
  onDatesChange: (dates: Dates) => void;
}

const BuildFields = ({
  projectId,
  phaseId,
  participationMethod,
  formData,
  errors,
  validationErrors,
  standalone,
  files,
  surveyMethodSwitch,
  onChange,
  onDatesChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const hasAttachmentsBody =
    files.attachments.length > 0 || files.isUploadingFile || !!errors?.file;

  return (
    <Box display="flex" flexDirection="column" gap="16px" p="24px 18px">
      <Text variant="boSection" m="0" mb="4px">
        {formatMessage(setupTitle(participationMethod))}
      </Text>

      <PhaseDates
        formData={formData}
        errors={errors}
        validationErrors={validationErrors}
        standalone={standalone}
        onChange={onDatesChange}
      />

      <Box display="flex" flexDirection="column" gap="8px">
        <Box>
          <InputMultilocWithLocaleSwitcher
            id="phase-build-panel-title"
            type="text"
            variant="bo"
            ariaLabel={formatMessage(phaseSetupMessages.titleLabel)}
            valueMultiloc={formData.title_multiloc}
            onChange={(title_multiloc: Multiloc) =>
              onChange({ title_multiloc })
            }
            className="intercom-admin-phase-name"
          />
          <Error apiErrors={errors?.title_multiloc} />
        </Box>

        {phaseId && (
          <DescriptionField
            projectId={projectId}
            value={formData.description_multiloc}
            errors={errors}
            onChange={(description_multiloc) =>
              onChange({ description_multiloc })
            }
          />
        )}
      </Box>

      <Box display="flex" flexDirection="column" gap="12px">
        <PanelField
          label={formatMessage(eventMessages.attachments)}
          action={
            <FileSelectOrUploadModal
              fileAttachments={files.attachments}
              onFileAdd={files.uploadFile}
              onFileAttach={files.attachFile}
              maxSizeMb={10}
              isDisabled={files.isUploadingFile}
              iconOnly
            />
          }
        >
          {hasAttachmentsBody && (
            <FileRepositorySelectAndUpload
              id="phase-build-panel-file-uploader"
              variant="bo"
              onFileAdd={files.uploadFile}
              onFileRemove={files.removeFile}
              onFileReorder={files.reorderFiles}
              onFileAttach={files.attachFile}
              fileAttachments={files.attachments}
              apiErrors={errors}
              maxSizeMb={10}
              isUploadingFile={files.isUploadingFile}
              hideTrigger
            />
          )}
        </PanelField>

        {!standalone && isSurveyMethod(participationMethod) && (
          <SurveyMethodSection
            selected={participationMethod}
            disabledReasons={surveyMethodSwitch.disabledReasons}
            onSelect={surveyMethodSwitch.onSelect}
          />
        )}

        <MethodSection
          projectId={projectId}
          participationMethod={participationMethod}
          phaseId={phaseId}
        />
      </Box>

      <Error apiErrors={errors?.base} />
    </Box>
  );
};

export default BuildFields;
