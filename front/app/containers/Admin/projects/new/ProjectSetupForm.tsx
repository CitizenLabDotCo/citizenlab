import React, { useState } from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { Multiloc, UploadFile, CLErrors } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';
import projectPermissionKeys from 'api/project_permissions/keys';
import { IUpdatedProjectProperties } from 'api/projects/types';
import useAddProject from 'api/projects/useAddProject';
import { IUser } from 'api/users/types';

import { useSyncFiles } from 'hooks/files/useSyncFiles';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useFeatureFlag from 'hooks/useFeatureFlag';

import GeographicAreaInputs from 'containers/Admin/projects/_shared/components/ProjectSetupForm/GeographicAreaInputs';
import ProjectCardImageDropzone from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectCardImageDropzone';
import ProjectCardImageTooltip from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectCardImageTooltip';
import ProjectHeaderImageTooltip from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectHeaderImageTooltip';
import ProjectNameInput from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectNameInput';
import {
  StyledForm,
  StyledInputMultiloc,
  StyledSectionField,
} from 'containers/Admin/projects/_shared/components/ProjectSetupForm/styling';
import TopicInputs from 'containers/Admin/projects/_shared/components/ProjectSetupForm/TopicInputs';
import { getSelectedTopicIds } from 'containers/Admin/projects/_shared/utils/getSelectedTopicIds';
import messages from 'containers/Admin/projects/project/general/messages';
import validateTitle from 'containers/Admin/projects/project/general/utils/validateTitle';
import { fragmentId } from 'containers/Admin/projects/project/projectHeader';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import HeaderBgUploader from 'components/admin/ProjectableHeaderBgUploader';
import {
  Section,
  SubSectionTitle,
  SectionField,
} from 'components/admin/Section';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';
import Highlighter from 'components/Highlighter';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import FileUploader from '../_shared/components/ProjectSetupForm/FileUploader';
import ProjectContextSection from '../_shared/components/ProjectSetupForm/ProjectContextSection';
import { ProjectContext } from '../_shared/components/ProjectSetupForm/ProjectContextSection/types';
import { validateProjectContext } from '../_shared/components/ProjectSetupForm/ProjectContextSection/utils';
import { TOnProjectAttributesDiffChangeFunction } from '../_shared/types';
import useSyncProjectImages from '../_shared/useSyncProjectImages';

interface Props {
  authUser: IUser;
}

const ProjectSetupForm = ({ authUser }: Props) => {
  const { formatMessage } = useIntl();

  const isProjectLibraryEnabled = useFeatureFlag({ name: 'project_library' });
  const appConfigLocales = useAppConfigurationLocales();
  const { containerRef } = useContainerWidthAndHeight();

  const { mutateAsync: addProject } = useAddProject();

  const syncProjectFiles = useSyncFiles();
  const syncProjectImages = useSyncProjectImages();

  // File Attachments
  const [projectFileAttachments, setProjectFileAttachments] = useState<
    IFileAttachmentData[] | undefined
  >();
  const [projectFileAttachmentsToRemove, setProjectFileAttachmentsToRemove] =
    useState<IFileAttachmentData[]>([]);

  const [submitState, setSubmitState] = useState<ISubmitState>('disabled');

  const [processing, setProcessing] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [projectAttributesDiff, setProjectAttributesDiff] =
    useState<IUpdatedProjectProperties>({});
  const [titleError, setTitleError] = useState<Multiloc | null>(null);
  const [projectContextError, setProjectContextError] = useState(false);

  // We should probably not have slug, publicationStatus, etc.
  // both in projectAttributesDiff and as separate state.
  const [projectCardImage, setProjectCardImage] = useState<UploadFile | null>(
    null
  );
  const [projectCardImageAltText, setProjectCardImageAltText] =
    useState<Multiloc | null>(null);
  // project_images should always store one record, but in practice it was (or is?) different (maybe because of a bug)
  // https://citizenlabco.slack.com/archives/C015M14HYSF/p1674228018666059
  const [projectCardImageToRemove, setProjectCardImageToRemove] =
    useState<UploadFile | null>(null);
  // If we use cropper, we need to store two different images:
  // original and cropped.
  const [croppedProjectCardBase64, setCroppedProjectCardBase64] = useState<
    string | null
  >(null);

  const { highest_role } = authUser.data.attributes;

  const [projectContext, setProjectContext] = useState<ProjectContext>(() => {
    if (highest_role === 'space_moderator') return 'space';
    if (highest_role === 'project_folder_moderator') return 'folder';
    return 'root';
  });

  const handleProjectAttributeDiffOnChange: TOnProjectAttributesDiffChangeFunction =
    (
      projectAttributesDiff: IUpdatedProjectProperties,
      submitState: ISubmitState = 'enabled'
    ) => {
      setProjectAttributesDiff((currentProjectAttributesDiff) => {
        return {
          ...currentProjectAttributesDiff,
          ...projectAttributesDiff,
        };
      });

      setSubmitState(submitState);
    };

  const handleTitleMultilocOnChange = (titleMultiloc: Multiloc) => {
    handleProjectAttributeDiffOnChange({ title_multiloc: titleMultiloc });
    setTitleError(null);
  };

  const handleAltTextMultilocOnChange = (altTextMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setProjectCardImageAltText(altTextMultiloc);
  };

  const handleHeaderBgChange = (newImageBase64: string | null) => {
    handleProjectAttributeDiffOnChange({ header_bg: newImageBase64 });
  };

  const handleHeaderBgAltTextChange = (altText: Multiloc) => {
    handleProjectAttributeDiffOnChange({
      header_bg_alt_text_multiloc: altText,
    });
  };

  const handleProjectCardImageOnAdd = (projectImages: UploadFile[]) => {
    setSubmitState('enabled');
    setProjectCardImage(projectImages[0]);
    setCroppedProjectCardBase64(projectImages[0].base64);
  };

  const handleProjectCardImageOnRemove = (
    projectCardImageToRemove: UploadFile
  ) => {
    setProjectCardImage(null);
    setCroppedProjectCardBase64(null);
    projectCardImageToRemove.remote &&
      setProjectCardImageToRemove(projectCardImageToRemove);
    setSubmitState('enabled');
  };

  const handleCroppedProjectCardImageOnRemove = () => {
    projectCardImage && handleProjectCardImageOnRemove(projectCardImage);
  };

  const handleProjectCardImageOnCompleteCropping = (base64: string) => {
    setSubmitState('enabled');
    setCroppedProjectCardBase64(base64);
  };

  const handleTopicsChange = (topicIds: string[]) => {
    handleProjectAttributeDiffOnChange({ global_topic_ids: topicIds });
  };

  async function saveForm() {
    const isFormValid = validateForm();

    if (!isFormValid) {
      setSubmitState('error');
      return;
    }

    if (processing) return;

    const nextProjectAttributesDiff: IUpdatedProjectProperties = {
      admin_publication_attributes: {
        publication_status: 'draft',
      },
      ...projectAttributesDiff,
    };

    try {
      setProcessing(true);
      const response = await addProject(nextProjectAttributesDiff);
      const projectId = response.data.id;

      const projectImagesPromise = syncProjectImages({
        croppedProjectCardBase64,
        projectCardImageAltText,
        projectCardImageToUpdate: projectCardImage,
        projectCardImageToRemove,
        projectId,
      });

      const projectFilesPromise = projectFileAttachments
        ? syncProjectFiles({
            attachableId: projectId,
            attachableType: 'Project',
            fileAttachments: projectFileAttachments,
            fileAttachmentsToRemove: projectFileAttachmentsToRemove,
            fileAttachmentOrdering: {},
          })
        : undefined;

      await Promise.all([
        projectImagesPromise,
        projectFilesPromise,
      ] as Promise<any>[]);

      setSubmitState('success');
      setProjectCardImageToRemove(null);
      setProjectFileAttachmentsToRemove([]);
      setProcessing(false);

      setTimeout(() => {
        clHistory.push({
          pathname: `${adminProjectsProjectPath(projectId)}/general`,
        });
      }, 1000);

      queryClient.invalidateQueries({
        queryKey: projectPermissionKeys.list({ projectId }),
      });
    } catch (errors) {
      setSubmitState('error');
      setApiErrors(errors.errors);
      setProcessing(false);
    }
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveForm();
  };

  const validateForm = () => {
    const titleError = !isNilOrError(appConfigLocales)
      ? validateTitle(
          appConfigLocales,
          projectAttrs.title_multiloc,
          formatMessage(messages.noTitleErrorMessage)
        )
      : null;
    const hasTitleError = !isEmpty(titleError);
    setTitleError(hasTitleError ? titleError : null);
    const formIsValid = !hasTitleError;

    if (!validateProjectContext(projectContext, projectAttrs)) {
      setProjectContextError(true);
      return false;
    }

    return formIsValid;
  };

  const projectAttrs = {
    ...projectAttributesDiff,
  };

  const selectedTopicIds = getSelectedTopicIds(projectAttributesDiff, null);

  const projectCardImageShouldBeSaved = projectCardImage
    ? !projectCardImage.remote
    : false;

  return (
    <Box ref={containerRef}>
      <StyledForm
        className="e2e-project-general-form intercom-projects-new-project-form"
        onSubmit={onSubmit}
        showStickySaveButton={false}
      >
        <Section>
          <Highlighter fragmentId={fragmentId}>
            <ProjectNameInput
              titleMultiloc={projectAttrs.title_multiloc}
              titleError={titleError}
              apiErrors={apiErrors}
              handleTitleMultilocOnChange={handleTitleMultilocOnChange}
            />
          </Highlighter>

          {isProjectLibraryEnabled && (
            <Box mb="20px">
              <Warning>
                <FormattedMessage
                  {...messages.needInspiration}
                  values={{
                    inspirationHubLink: (
                      <Link to="/admin/inspiration-hub" target="_blank">
                        <FormattedMessage {...messages.inspirationHub} />
                      </Link>
                    ),
                  }}
                />
              </Warning>
            </Box>
          )}

          <TopicInputs
            selectedTopicIds={selectedTopicIds}
            onChange={handleTopicsChange}
          />

          <GeographicAreaInputs
            areaIds={projectAttrs.area_ids}
            onProjectAttributesDiffChange={handleProjectAttributeDiffOnChange}
          />

          <ProjectContextSection
            projectContext={projectContext}
            space_id={projectAttrs.space_id}
            folder_id={projectAttrs.folder_id}
            formSituation="creating"
            error={projectContextError}
            onSetContext={(context) => {
              handleProjectAttributeDiffOnChange({
                space_id: null,
                folder_id: null,
              });
              setProjectContext(context);
              setProjectContextError(false);
            }}
            onChangeSpace={(spaceAndFolderId) => {
              handleProjectAttributeDiffOnChange(spaceAndFolderId);
              setProjectContextError(false);
            }}
            onChangeFolder={(spaceAndFolderId) => {
              handleProjectAttributeDiffOnChange(spaceAndFolderId);
              setProjectContextError(false);
            }}
          />

          <SectionField className="intercom-product-tour-project-header-image-field">
            <SubSectionTitle>
              <FormattedMessage {...messages.headerImageInputLabel} />
              <ProjectHeaderImageTooltip />
            </SubSectionTitle>
            <HeaderBgUploader
              imageUrl={undefined}
              headerImageAltText={projectAttrs.header_bg_alt_text_multiloc}
              onImageChange={handleHeaderBgChange}
              onHeaderImageAltTextChange={handleHeaderBgAltTextChange}
            />
          </SectionField>

          <StyledSectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.projectCardImageLabelText} />
              <ProjectCardImageTooltip />
            </SubSectionTitle>
            {projectCardImageShouldBeSaved ? (
              <Box display="flex" flexDirection="column" gap="8px">
                <ImageCropperContainer
                  image={projectCardImage}
                  onComplete={handleProjectCardImageOnCompleteCropping}
                  aspectRatioWidth={CARD_IMAGE_ASPECT_RATIO_WIDTH}
                  aspectRatioHeight={CARD_IMAGE_ASPECT_RATIO_HEIGHT}
                  onRemove={handleCroppedProjectCardImageOnRemove}
                />
              </Box>
            ) : (
              <ProjectCardImageDropzone
                images={projectCardImage && [projectCardImage]}
                onAddImages={handleProjectCardImageOnAdd}
                onRemoveImage={handleProjectCardImageOnRemove}
              />
            )}
          </StyledSectionField>
          {projectCardImage && (
            <StyledSectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.projectImageAltTextTitle} />
                <IconTooltip
                  content={
                    <FormattedMessage
                      {...messages.projectImageAltTextTooltip}
                    />
                  }
                />
              </SubSectionTitle>
              <StyledInputMultiloc
                type="text"
                valueMultiloc={projectCardImageAltText}
                label={<FormattedMessage {...messages.altText} />}
                onChange={handleAltTextMultilocOnChange}
              />
            </StyledSectionField>
          )}
          <StyledSectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.fileUploadLabel} />
              <IconTooltip
                content={
                  <FormattedMessage {...messages.fileUploadLabelTooltip} />
                }
              />
            </SubSectionTitle>
            <FileUploader
              projectFileAttachments={projectFileAttachments}
              setProjectFileAttachments={(...args) => {
                setSubmitState('enabled');
                setProjectFileAttachments(...args);
              }}
              setProjectFileAttachmentsToRemove={(...args) => {
                setSubmitState('enabled');
                setProjectFileAttachmentsToRemove(...args);
              }}
              apiErrors={apiErrors}
            />
          </StyledSectionField>
        </Section>
        <Box py="8px">
          <SubmitWrapper
            className="intercom-projects-new-project-save-button"
            loading={processing}
            status={submitState}
            messages={{
              buttonSave: messages.saveProject,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />
        </Box>
      </StyledForm>
    </Box>
  );
};

export default ProjectSetupForm;
