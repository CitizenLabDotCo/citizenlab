import React, { useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc, UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';
import { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { isTimelinePhase } from 'api/phases/utils';

import { useSyncFiles } from 'hooks/files/useSyncFiles';

import SubmitWrapper from 'components/admin/SubmitWrapper';
import Error from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { generateTemporaryFileAttachment } from 'utils/fileUtils';

import PhaseDescription from '../../../../phaseDescription';
import phaseSetupMessages from '../../../../phaseSetup/messages';
import {
  SubmitStateType,
  ValidationErrors,
} from '../../../../phaseSetup/typings';
import validate from '../../../../phaseSetup/validate';

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
  const { mutate: addFile, isPending: isAddingFile } = useAddFile();
  const syncPhaseFiles = useSyncFiles();

  const [formData, setFormData] = useState<IUpdatedPhaseProperties>(
    phase.attributes
  );
  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  // Attachments are staged here until the panel is saved. Falling back to the
  // saved list means a successful save drops the temporary ids in one go.
  const [stagedAttachments, setStagedAttachments] = useState<
    IFileAttachmentData[] | null
  >(null);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<
    IFileAttachmentData[]
  >([]);
  const attachments = stagedAttachments ?? savedAttachments;

  // Detached phases skip the timeline rules: their dates may overlap and stay
  // open-ended.
  const standalone = !isTimelinePhase(phase);

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setSubmitState('enabled');
    setFormData((formData) => ({ ...formData, ...newData }));
  };

  const stageAttachments = (next: IFileAttachmentData[]) => {
    setStagedAttachments(next);
    setSubmitState('enabled');
  };

  const handleFileAttach = (file: IFileData) => {
    const isDuplicate = attachments.some(
      (attachment) => attachment.relationships.file.data.id === file.id
    );
    if (isDuplicate) return;

    stageAttachments([
      ...attachments,
      generateTemporaryFileAttachment({
        fileId: file.id,
        attachableId: phase.id,
        attachableType: 'Phase',
        position: attachments.length,
      }),
    ]);
  };

  // The file itself goes to the Data Repository straight away; only the
  // attachment to this phase waits for the save.
  const handleFileAdd = (fileToAdd: UploadFile) => {
    addFile(
      {
        content: fileToAdd.base64,
        project: projectId,
        name: fileToAdd.name,
        category: 'other',
        ai_processing_allowed: false,
      },
      { onSuccess: (newFile) => handleFileAttach(newFile.data) }
    );
  };

  const handleFileRemove = (attachmentToRemove: IFileAttachmentData) => {
    stageAttachments(
      attachments.filter(
        (attachment) => attachment.id !== attachmentToRemove.id
      )
    );
    setAttachmentsToRemove((toRemove) => [...toRemove, attachmentToRemove]);
  };

  const handleFileReorder = (reordered: IFileAttachmentData[]) => {
    stageAttachments(
      reordered.map((attachment, position) => ({
        ...attachment,
        attributes: { ...attachment.attributes, position },
      }))
    );
  };

  const savedOrdering = savedAttachments.reduce<Record<string, number>>(
    (ordering, attachment) => {
      ordering[attachment.id] = attachment.attributes.position;
      return ordering;
    },
    {}
  );

  const saveFiles = async () => {
    await syncPhaseFiles({
      attachableId: phase.id,
      attachableType: 'Phase',
      fileAttachments: attachments,
      fileAttachmentsToRemove: attachmentsToRemove,
      fileAttachmentOrdering: savedOrdering,
    });

    setAttachmentsToRemove([]);
    setStagedAttachments(null);
    setErrors(null);
    setProcessing(false);
    setSubmitState('success');
  };

  const handleFileError = ({ errors }: { errors: CLErrors }) => {
    // The API adds a 'blank' error next to extension_whitelist_error, which
    // would otherwise be the one shown.
    setErrors(
      errors.file[0].error === 'extension_whitelist_error'
        ? { file: [errors.file[0]] }
        : errors
    );
    setProcessing(false);
    setSubmitState('error');
  };

  const handleSave = () => {
    if (processing) return;

    const { isValidated, errors } = validate(
      formData,
      phases,
      formatMessage,
      phase.id,
      standalone
    );

    setValidationErrors(errors);
    if (!isValidated) return;

    setProcessing(true);
    // Only the fields this panel owns are sent. The right panel edits the same
    // phase, so sending the whole attribute set would undo its saved changes.
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
          saveFiles().catch(handleFileError);
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
    // Not a <form>: the description publishes and discards through its own
    // buttons, which would submit this one along with them.
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
            onFileAdd={handleFileAdd}
            onFileRemove={handleFileRemove}
            onFileReorder={handleFileReorder}
            onFileAttach={handleFileAttach}
            fileAttachments={attachments}
            enableDragAndDrop
            apiErrors={errors}
            maxSizeMb={10}
            isUploadingFile={isAddingFile}
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
