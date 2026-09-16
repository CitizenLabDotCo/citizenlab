import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import { IUpdatedPhaseProperties, ParticipationMethod } from 'api/phases/types';

import usePhaseFileAttachments from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import PhaseDescription from 'containers/Admin/projects/project/phaseDescription';
import { PhaseDates as Dates } from 'containers/Admin/projects/project/phaseSetup/components/PhaseDatePicker';
import { isSurveyMethod } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/SurveyMethodChoices';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';

import Error from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';

import MethodSection from './MethodSection';
import PanelField from './PanelField';
import PhaseDates from './PhaseDates';
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
}: Props) => (
  <>
    <PhaseDates
      formData={formData}
      errors={errors}
      validationErrors={validationErrors}
      standalone={standalone}
      onChange={onDatesChange}
    />

    <PanelField label={<FormattedMessage {...phaseSetupMessages.titleLabel} />}>
      <InputMultilocWithLocaleSwitcher
        id="phase-build-panel-title"
        type="text"
        valueMultiloc={formData.title_multiloc}
        onChange={(title_multiloc: Multiloc) => onChange({ title_multiloc })}
        className="intercom-admin-phase-name"
      />
      <Error apiErrors={errors?.title_multiloc} />
    </PanelField>

    {/* The description saves itself against an existing phase. */}
    {phaseId && (
      <Box mb="16px">
        <PhaseDescription />
      </Box>
    )}

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

    {/* Only timeline phases can switch: a standalone phase must stay a
        native survey. */}
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

    {errors?.base && <Error apiErrors={errors.base} />}
  </>
);

export default BuildFields;
