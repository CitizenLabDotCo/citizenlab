import React, { useState } from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { Multiloc, UploadFile, CLErrors } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';
import useAuthUser from 'api/me/useAuthUser';
import useAddProjectImage from 'api/project_images/useAddProjectImage';
import useDeleteProjectImage from 'api/project_images/useDeleteProjectImage';
import {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';
import useUpdateProjectImage from 'api/project_images/useUpdateProjectImage';
import projectPermissionKeys from 'api/project_permissions/keys';
import { IUpdatedProjectProperties, IProjectData } from 'api/projects/types';
import useAddProject from 'api/projects/useAddProject';
import { HighestRole } from 'api/users/types';

import { useSyncFiles } from 'hooks/files/useSyncFiles';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useFeatureFlag from 'hooks/useFeatureFlag';

import GeographicAreaInputs from 'containers/Admin/projects/project/general/components/GeographicAreaInputs';
import ProjectCardImageDropzone from 'containers/Admin/projects/project/general/components/ProjectCardImageDropzone';
import ProjectCardImageTooltip from 'containers/Admin/projects/project/general/components/ProjectCardImageTooltip';
import ProjectFolderSelect from 'containers/Admin/projects/project/general/components/ProjectFolderSelect';
import ProjectHeaderImageTooltip from 'containers/Admin/projects/project/general/components/ProjectHeaderImageTooltip';
import ProjectNameInput from 'containers/Admin/projects/project/general/components/ProjectNameInput';
import {
  StyledForm,
  StyledInputMultiloc,
  StyledSectionField,
} from 'containers/Admin/projects/project/general/components/styling';
import TopicInputs from 'containers/Admin/projects/project/general/components/TopicInputs';
import messages from 'containers/Admin/projects/project/general/messages';
import validateTitle from 'containers/Admin/projects/project/general/utils/validateTitle';
import { fragmentId } from 'containers/Admin/projects/project/projectHeader';
import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import HeaderBgUploader from 'components/admin/ProjectableHeaderBgUploader';
import {
  Section,
  SubSectionTitle,
  SectionField,
} from 'components/admin/Section';
import SpaceSelectSection from 'components/admin/SpaceSelectSection';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';
import Highlighter from 'components/Highlighter';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import { generateTemporaryFileAttachment } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { isSpaceModerator } from 'utils/permissions/roles';

export type TOnProjectAttributesDiffChangeFunction = (
  projectAttributesDiff: IUpdatedProjectProperties,
  submitState?: ISubmitState
) => void;

const FOLDER_SELECT_ALLOWED_HIGHEST_ROLES: (string | undefined)[] = [
  'super_admin',
  'admin',
  'space_moderator',
  'project_folder_moderator',
] satisfies HighestRole[];

const ProjectSetupForm = () => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const isProjectLibraryEnabled = useFeatureFlag({ name: 'project_library' });
  const appConfigLocales = useAppConfigurationLocales();
  const { containerRef } = useContainerWidthAndHeight();

  const { mutateAsync: addProjectImage } = useAddProjectImage();
  const { mutateAsync: updateProjectImage } = useUpdateProjectImage();
  const { mutateAsync: deleteProjectImage } = useDeleteProjectImage();
  const { mutateAsync: addProject } = useAddProject();

  const syncProjectFiles = useSyncFiles();

  // File Attachments
  const { mutate: addFile, isLoading: isAddingFile } = useAddFile();
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

  const showProjectFolderSelect =
    FOLDER_SELECT_ALLOWED_HIGHEST_ROLES.includes(
      authUser?.data.attributes.highest_role
    ) && isProjectFoldersEnabled;

  const handleTitleMultilocOnChange = (titleMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      title_multiloc: titleMultiloc,
    }));
    setTitleError(null);
  };

  const handleAltTextMultilocOnChange = (altTextMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setProjectCardImageAltText(altTextMultiloc);
  };

  const handleHeaderBgChange = (newImageBase64: string | null) => {
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      header_bg: newImageBase64,
    }));
    setSubmitState('enabled');
  };

  const handleHeaderBgAltTextChange = (altText: Multiloc) => {
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      header_bg_alt_text_multiloc: altText,
    }));
    setSubmitState('enabled');
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

  const handleProjectFileOnAdd = (fileToAdd: UploadFile) => {
    // Upload the file to the Data Repository, so we can make the attachment later.
    addFile(
      {
        content: fileToAdd.base64,
        name: fileToAdd.name,
        category: 'other', // Default to 'other' when added from phase setup
        ai_processing_allowed: false, // Default to false when added from phase setup
      },
      {
        onSuccess: (newFile) => {
          // Create a temporary file attachment to add to the state, so the user sees it in the list.
          const temporaryFileAttachment = generateTemporaryFileAttachment({
            fileId: newFile.data.id,
            attachableId: undefined,
            attachableType: 'Project',
            position: projectFileAttachments
              ? projectFileAttachments.length
              : 0,
          });

          const isDuplicate = projectFileAttachments?.some((fileAttachment) => {
            return (
              fileAttachment.relationships.file.data.id ===
              temporaryFileAttachment.relationships.file.data.id
            );
          });

          setProjectFileAttachments(
            isDuplicate
              ? projectFileAttachments
              : [...(projectFileAttachments || []), temporaryFileAttachment]
          );

          setSubmitState(isDuplicate ? submitState : 'enabled');
        },
      }
    );
  };

  const handleProjectFileOnRemove = (
    projectFileToRemove: IFileAttachmentData
  ) => {
    setProjectFileAttachments((projectFileAttachments) =>
      projectFileAttachments?.filter(
        (fileAttachment) => fileAttachment.id !== projectFileToRemove.id
      )
    );
    setProjectFileAttachmentsToRemove((projectFileAttachmentsToRemove) => [
      ...projectFileAttachmentsToRemove,
      projectFileToRemove,
    ]);

    setSubmitState('enabled');
  };

  const handleFilesReorder = (updatedFiles: IFileAttachmentData[]) => {
    setProjectFileAttachments(updatedFiles);
    setSubmitState('enabled');
  };

  const handleProjectFileOnAttach = (fileToAttach: IFileData) => {
    const temporaryFileAttachment = generateTemporaryFileAttachment({
      fileId: fileToAttach.id,
      attachableId: undefined,
      attachableType: 'Project',
      position: projectFileAttachments ? projectFileAttachments.length : 0,
    });

    setProjectFileAttachments((projectFileAttachments) => [
      ...(projectFileAttachments || []),
      temporaryFileAttachment,
    ]);
    setSubmitState('enabled');
  };

  const handleTopicsChange = (topicIds: string[]) => {
    setSubmitState('enabled');
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      global_topic_ids: topicIds,
    }));
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

      const cardImageToAddPromise = croppedProjectCardBase64
        ? addProjectImage({
            projectId,
            image: {
              image: croppedProjectCardBase64,
              ...(projectCardImageAltText
                ? { alt_text_multiloc: projectCardImageAltText }
                : {}),
            },
          })
        : null;

      const cardImageToUpdatePromise =
        projectCardImage && projectCardImage.id && projectCardImageAltText
          ? updateProjectImage({
              projectId,
              imageId: projectCardImage.id,
              image: {
                image: projectCardImage.base64,
                alt_text_multiloc: projectCardImageAltText,
              },
            })
          : null;

      const cardImageToRemovePromise = projectCardImageToRemove?.id
        ? deleteProjectImage({
            projectId,
            imageId: projectCardImageToRemove.id,
          })
        : null;

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
        cardImageToAddPromise,
        cardImageToUpdatePromise,
        cardImageToRemovePromise,
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

    const { space_id, folder_id } = projectAttributesDiff;

    if (isSpaceModerator(authUser) && !space_id && !folder_id) {
      return false;
    }

    return formIsValid;
  };

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

  const handleSpaceSelectChange = (spaceId: string | null) => {
    setProjectAttributesDiff((projectAttributesDiff) => {
      return {
        ...projectAttributesDiff,
        space_id: spaceId,
      };
    });

    setSubmitState('enabled');
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

          {showProjectFolderSelect && (
            <Highlighter fragmentId={folderFragmentId}>
              <ProjectFolderSelect
                projectAttrs={projectAttrs}
                onProjectAttributesDiffChange={(change, submitState) => {
                  if (change.folder_id) {
                    // If a folder is chosen, the project will automatically
                    // inherit the folder's space. So we clear
                    // any previously chosen space.
                    handleProjectAttributeDiffOnChange(
                      { ...change, space_id: undefined },
                      submitState
                    );
                  } else {
                    handleProjectAttributeDiffOnChange(change, submitState);
                  }
                }}
                isNewProject={true}
              />
            </Highlighter>
          )}

          <SpaceSelectSection
            spaceId={projectAttrs.space_id ?? null}
            isProjectInsideFolder={!!projectAttrs.folder_id}
            onChange={handleSpaceSelectChange}
          />

          <SectionField className="intercom-product-tour-project-header-image-field">
            <SubSectionTitle>
              <FormattedMessage {...messages.headerImageInputLabel} />
              <ProjectHeaderImageTooltip />
            </SubSectionTitle>
            <HeaderBgUploader
              imageUrl={undefined}
              headerImageAltText={undefined}
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
            <FileRepositorySelectAndUpload
              id="project-edit-form-file-uploader"
              onFileAdd={handleProjectFileOnAdd}
              onFileRemove={handleProjectFileOnRemove}
              onFileReorder={handleFilesReorder}
              onFileAttach={handleProjectFileOnAttach}
              fileAttachments={projectFileAttachments}
              enableDragAndDrop
              apiErrors={apiErrors}
              maxSizeMb={50}
              isUploadingFile={isAddingFile}
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

function getSelectedTopicIds(
  projectAttributesDiff: IUpdatedProjectProperties,
  project: IProjectData | null
) {
  if (projectAttributesDiff.global_topic_ids) {
    return projectAttributesDiff.global_topic_ids;
  }

  if (project) {
    return project.relationships.global_topics.data.map((topic) => topic.id);
  }

  return [];
}
