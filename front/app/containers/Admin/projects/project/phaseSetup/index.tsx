import React, { FormEvent, useEffect, useState } from 'react';

import {
  Box,
  Title,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { CLErrors, Multiloc, UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IFileData } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';
import { IPhase, IUpdatedPhaseProperties } from 'api/phases/types';
import useAddPhase from 'api/phases/useAddPhase';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { useSyncFiles } from 'hooks/files/useSyncFiles';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useFeatureFlag from 'hooks/useFeatureFlag';

import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Error from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import {
  FormattedMessage,
  useFormatMessageWithLocale,
  useIntl,
} from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { generateTemporaryFileAttachment } from 'utils/fileUtils';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import DateSetup from './components/DateSetup';
import PhaseParticipationConfig from './components/PhaseParticipationConfig';
import { ideationDefaultConfig } from './components/PhaseParticipationConfig/utils/participationMethodConfigs';
import messages from './messages';
import { SubmitStateType, ValidationErrors } from './typings';
import { getTimelineTab } from './utils';
import validate from './validate';

interface Props {
  projectId: string;
  phase: IPhase | undefined;
}

const AdminPhaseEdit = ({ projectId, phase }: Props) => {
  const phaseId = phase?.data.id;
  const { data: phaseFileAttachments } = useFileAttachments({
    attachable_id: phaseId,
    attachable_type: 'Phase',
  });
  const { data: phases } = usePhases(projectId);
  const { mutate: addPhase } = useAddPhase();
  const { mutate: updatePhase } = useUpdatePhase();
  const { mutate: addFile, isLoading: isAddingFile } = useAddFile();
  const syncPhaseFiles = useSyncFiles();
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [inStatePhaseFileAttachments, setInStatePhaseFileAttachments] =
    useState<IFileAttachmentData[] | undefined>(phaseFileAttachments?.data);
  const [phaseFileAttachmentsToRemove, setPhaseFileAttachmentsToRemove] =
    useState<IFileAttachmentData[]>([]);

  const [submitState, setSubmitState] = useState<SubmitStateType>('disabled');
  const [formData, setFormData] = useState<IUpdatedPhaseProperties>();
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const { formatMessage } = useIntl();
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const { width, containerRef } = useContainerWidthAndHeight();
  const tenantLocales = useAppConfigurationLocales();
  const phaseInsightsEnabled = useFeatureFlag({ name: 'phase_insights' });

  useEffect(() => {
    // Whenever the selected phase changes, we reset the form data.
    // If no phase is selected, we initialize the form data with default values.
    setFormData(phase ? phase.data.attributes : ideationDefaultConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phaseFileAttachments) {
      setInStatePhaseFileAttachments(phaseFileAttachments.data);
    }
  }, [phaseFileAttachments]);

  if (!formatMessageWithLocale) return null;

  const handlePhaseParticipationConfigChange = (
    participationContextConfig: IUpdatedPhaseProperties
  ) => {
    const surveyCTALabel = tenantLocales?.reduce((acc, locale) => {
      acc[locale] = formatMessageWithLocale(
        locale,
        messages.defaultSurveyCTALabel
      );
      return acc;
    }, {});

    const surveyTitle = tenantLocales?.reduce((acc, locale) => {
      acc[locale] = formatMessageWithLocale(
        locale,
        messages.defaultSurveyTitleLabel
      );
      return acc;
    }, {});

    setSubmitState('enabled');
    // Important to keep the order of the spread operators
    setFormData((formData) => ({
      ...formData,
      ...participationContextConfig,
      ...(participationContextConfig.participation_method === 'native_survey' &&
        !formData?.native_survey_button_multiloc &&
        !phase?.data.attributes.native_survey_button_multiloc && {
          native_survey_button_multiloc: surveyCTALabel,
        }),
      ...(participationContextConfig.participation_method === 'native_survey' &&
        !formData?.native_survey_title_multiloc &&
        !phase?.data.attributes.native_survey_button_multiloc && {
          native_survey_title_multiloc: surveyTitle,
        }),
    }));
  };

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setSubmitState('enabled');
    setFormData((formData) => ({
      ...formData,
      ...newData,
    }));
  };

  const handleTitleMultilocOnChange = (title_multiloc: Multiloc) => {
    updateFormData({ title_multiloc });
  };

  const handleEditorOnChange = (description_multiloc: Multiloc) => {
    updateFormData({ description_multiloc });
  };

  const handlePhaseFileOnAttach = (file: IFileData) => {
    const isDuplicate = inStatePhaseFileAttachments?.some((fileAttachment) => {
      return fileAttachment.relationships.file.data.id === file.id;
    });

    if (isDuplicate) return;

    const temporaryFileAttachment = generateTemporaryFileAttachment({
      fileId: file.id,
      attachableId: phaseId,
      attachableType: 'Phase',
      position: inStatePhaseFileAttachments
        ? inStatePhaseFileAttachments.length
        : 0,
    });

    setInStatePhaseFileAttachments((inStatePhaseFileAttachments) => [
      ...(inStatePhaseFileAttachments || []),
      temporaryFileAttachment,
    ]);
    setSubmitState('enabled');
  };

  const handlePhaseFileOnAdd = (fileToAdd: UploadFile) => {
    // Upload the file to the Data Repository, so we can make the attachment later.
    addFile(
      {
        content: fileToAdd.base64,
        project: projectId,
        name: fileToAdd.name,
        category: 'other', // Default to 'other' when added from phase setup
        ai_processing_allowed: false, // Default to false when added from phase setup
      },
      {
        onSuccess: (newFile) => {
          // Create a temporary file attachment to add to the state, so the user sees it in the list.
          const temporaryFileAttachment = generateTemporaryFileAttachment({
            fileId: newFile.data.id,
            attachableId: phaseId,
            attachableType: 'Phase',
            position: inStatePhaseFileAttachments
              ? inStatePhaseFileAttachments.length
              : 0,
          });

          const isDuplicate = inStatePhaseFileAttachments?.some(
            (fileAttachment) => {
              return (
                fileAttachment.relationships.file.data.id ===
                temporaryFileAttachment.relationships.file.data.id
              );
            }
          );

          setInStatePhaseFileAttachments(
            isDuplicate
              ? inStatePhaseFileAttachments
              : [
                  ...(inStatePhaseFileAttachments || []),
                  temporaryFileAttachment,
                ]
          );

          setSubmitState(isDuplicate ? submitState : 'enabled');
        },
      }
    );
  };

  const handlePhaseFileOnRemove = (
    fileAttachmentToRemove: IFileAttachmentData
  ) => {
    setInStatePhaseFileAttachments(
      inStatePhaseFileAttachments?.filter(
        (fileAttachment) => fileAttachment.id !== fileAttachmentToRemove.id
      )
    );
    setPhaseFileAttachmentsToRemove([
      ...phaseFileAttachmentsToRemove,
      fileAttachmentToRemove,
    ]);
    setSubmitState('enabled');
  };

  const handleFilesReorder = (
    updatedFileAttachments: IFileAttachmentData[]
  ) => {
    // Update the position of the updated file attachments
    const updatedFileAttachmentsWithPosition = updatedFileAttachments.map(
      (fileAttachment, index) => ({
        ...fileAttachment,
        attributes: {
          ...fileAttachment.attributes,
          position: index,
        },
      })
    );

    setInStatePhaseFileAttachments(updatedFileAttachmentsWithPosition);
    setSubmitState('enabled');
  };

  const handleOnSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();
    if (!formData) return;

    const { isValidated, errors } = validate(formData, phases, formatMessage);

    setValidationErrors(errors);

    if (isValidated) {
      save(formData);
    }
  };

  const handleError = (error: { errors: CLErrors }) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    setErrors(error.errors || null);
    setProcessing(false);
    setSubmitState('error');
  };

  const handleSaveResponse = async (
    response: IPhase,
    redirectAfterSave: boolean
  ) => {
    const phaseResponse = response.data;
    const phaseId = phaseResponse.id;

    const initialFileAttachmentOrdering = phaseFileAttachments?.data.reduce(
      (acc, file) => {
        if (file.id) {
          acc[file.id] = file.attributes.position;
        }
        return acc;
      },
      {}
    );

    await syncPhaseFiles({
      attachableId: phaseId,
      attachableType: 'Phase',
      fileAttachments: inStatePhaseFileAttachments || [],
      fileAttachmentsToRemove: phaseFileAttachmentsToRemove,
      fileAttachmentOrdering: initialFileAttachmentOrdering || {},
    })
      .then(() => {
        setPhaseFileAttachmentsToRemove([]);
        setProcessing(false);
        setErrors(null);
        setSubmitState('success');

        if (redirectAfterSave) {
          const redirectTab = getTimelineTab(
            phaseResponse,
            phaseInsightsEnabled
          );
          window.scrollTo(0, 0);
          clHistory.push(
            `/admin/projects/${projectId}/phases/${phaseId}/${redirectTab}`
          );
        } else {
          setFormData(response.data.attributes);
        }
      })
      .catch(({ errors }) => {
        // For some reason, the BE adds a 'blank' error
        // to the file errors array when the real error is
        // extension_whitelist_error. So if we get that error,
        // we filter out the blank error and only show the
        // extension_whitelist_error.
        errors.file[0].error === 'extension_whitelist_error'
          ? setErrors({ file: [errors.file[0]] })
          : setErrors({ ...errors });

        setProcessing(false);
        setSubmitState('error');
      });
  };

  const save = async (formData: IUpdatedPhaseProperties) => {
    if (processing) return;
    setProcessing(true);

    if (phase) {
      updatePhase(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          phaseId: phase?.data.id,
          ...formData,
        },
        {
          onSuccess: (response) => {
            handleSaveResponse(response, false);
          },
          onError: handleError,
        }
      );
    } else if (projectId) {
      addPhase(
        {
          projectId,
          ...formData,
        },
        {
          onSuccess: (response) => {
            handleSaveResponse(response, true);
          },
          onError: handleError,
        }
      );
    }
  };

  if (!formData) return null;

  return (
    <Box ref={containerRef}>
      <Title variant="h3" color="primary">
        {phase && <FormattedMessage {...messages.editPhaseTitle} />}
        {!phase && <FormattedMessage {...messages.newPhaseTitle} />}
      </Title>
      <form onSubmit={handleOnSubmit}>
        <Section>
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.titleLabel} />
            </SubSectionTitle>
            <InputMultilocWithLocaleSwitcher
              id="title"
              type="text"
              valueMultiloc={formData.title_multiloc}
              placeholder={
                phaseId
                  ? undefined
                  : formatMessage(messages.phaseTitlePlaceholder)
              }
              onChange={handleTitleMultilocOnChange}
            />
            <Error apiErrors={errors && errors.title_multiloc} />
          </SectionField>
          <DateSetup
            formData={formData}
            errors={errors}
            validationErrors={validationErrors}
            setSubmitState={setSubmitState}
            setFormData={setFormData}
            setValidationErrors={setValidationErrors}
          />
          <PhaseParticipationConfig
            phase={phase}
            formData={formData}
            validationErrors={validationErrors}
            apiErrors={errors}
            onChange={handlePhaseParticipationConfigChange}
            setValidationErrors={setValidationErrors}
          />
          <SectionField className="fullWidth">
            <Box display="flex" alignItems="center">
              <SubSectionTitle>
                <FormattedMessage {...messages.descriptionLabel} />
              </SubSectionTitle>
              {phases && phases.data.length < 2 && (
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.emptyDescriptionWarning} />
                  }
                />
              )}
            </Box>
            <QuillMultilocWithLocaleSwitcher
              id="description"
              valueMultiloc={formData.description_multiloc}
              onChange={handleEditorOnChange}
              withCTAButton
            />
            <Error apiErrors={errors && errors.description_multiloc} />
          </SectionField>
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.uploadAttachments} />
            </SubSectionTitle>
            <FileRepositorySelectAndUpload
              id="project-timeline-edit-form-file-uploader"
              onFileAdd={handlePhaseFileOnAdd}
              onFileRemove={handlePhaseFileOnRemove}
              onFileReorder={handleFilesReorder}
              onFileAttach={handlePhaseFileOnAttach}
              fileAttachments={inStatePhaseFileAttachments}
              enableDragAndDrop
              apiErrors={errors}
              maxSizeMb={10}
              isUploadingFile={isAddingFile}
            />
          </SectionField>

          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {errors && errors.project && (
            <SectionField>
              <Error apiErrors={errors.project} />
            </SectionField>
          )}
          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {errors && errors.base && (
            <SectionField>
              <Error apiErrors={errors.base} />
            </SectionField>
          )}
        </Section>

        <Box
          position="fixed"
          borderTop={`1px solid ${colors.divider}`}
          bottom="0"
          w={`calc(${width}px + ${defaultAdminCardPadding * 2}px)`}
          ml={`-${defaultAdminCardPadding}px`}
          background={colors.white}
          display="flex"
          justifyContent="flex-start"
        >
          <Box py="8px" px={`${defaultAdminCardPadding}px`}>
            <SubmitWrapper
              loading={processing}
              status={submitState}
              messages={{
                buttonSave: messages.saveChangesLabel,
                buttonSuccess: messages.saveSuccessLabel,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />
          </Box>
        </Box>
      </form>
    </Box>
  );
};

const AdminPhaseEditWrapper = () => {
  const { projectId, phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);

  if (!projectId) return null;

  const phaseLoading = phaseId && phase?.data.id !== phaseId;
  if (phaseLoading) return null;

  return (
    <AdminPhaseEdit projectId={projectId} phase={phaseId ? phase : undefined} />
  );
};

export default AdminPhaseEditWrapper;
