import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import PanelHeading from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelHeading';
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
import messages from '../../messages';

import DescriptionField from './DescriptionField';
import InputTermCard from './InputTermCard';
import MethodSection from './MethodSection';
import PanelField from './PanelField';
import PhaseDates from './PhaseDates';
import setupTitle from './setupTitle';
import SurveyMethodSection, { SurveyMethodSwitch } from './SurveyMethodSection';

// The methods whose submissions participants name with an input term.
const USES_INPUT_TERM: ParticipationMethod[] = ['ideation', 'proposals'];

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
    <Box display="flex" flexDirection="column" gap="10px" p="16px 18px 10px">
      <Box display="flex" alignItems="center" minHeight="32px" mb="6px">
        <Text variant="boSection" fontSize="m" m="0">
          {formatMessage(setupTitle(participationMethod))}
        </Text>
      </Box>

      <PhaseDates
        formData={formData}
        errors={errors}
        validationErrors={validationErrors}
        standalone={standalone}
        onChange={onDatesChange}
      />

      <Box display="flex" flexDirection="column" gap="10px">
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

      <Box display="flex" flexDirection="column" gap="10px">
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

        {USES_INPUT_TERM.includes(participationMethod) && (
          <>
            <PanelHeading
              label={formatMessage(
                participationMethod === 'proposals'
                  ? messages.proposalsAndParticipantData
                  : messages.ideasAndParticipantData
              )}
            />
            <InputTermCard
              value={formData.input_term}
              onChange={(input_term) => onChange({ input_term })}
            />
          </>
        )}

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
          inputTerm={formData.input_term}
        />
      </Box>

      <Error apiErrors={errors?.base} />
    </Box>
  );
};

export default BuildFields;
