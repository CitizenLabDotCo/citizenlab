import React, { useState, useEffect } from 'react';

import { Box, colors, IconTooltip } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useLocation, useParams } from 'react-router-dom';
import { Multiloc, UploadFile, CLErrors } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import useFileAttachments from 'api/file_attachments/useFileAttachments';
import { IFileData } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';
import useAuthUser from 'api/me/useAuthUser';
import useAddProjectImage from 'api/project_images/useAddProjectImage';
import useDeleteProjectImage from 'api/project_images/useDeleteProjectImage';
import useProjectImages, {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';
import useUpdateProjectImage from 'api/project_images/useUpdateProjectImage';
import projectPermissionKeys from 'api/project_permissions/keys';
import projectsKeys from 'api/projects/keys';
import { IUpdatedProjectProperties, IProject } from 'api/projects/types';
import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';
import { HighestRole } from 'api/users/types';

import { useSyncFiles } from 'hooks/files/useSyncFiles';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useFeatureFlag from 'hooks/useFeatureFlag';

import { getSelectedTopicIds } from 'containers/Admin/projects/_shared/utils/getSelectedTopicIds';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import HeaderBgUploader from 'components/admin/ProjectableHeaderBgUploader';
import {
  Section,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
  SectionField,
} from 'components/admin/Section';
import SlugInput from 'components/admin/SlugInput';
import SpaceSelectSection from 'components/admin/SpaceSelectSection';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';
import DescriptionBuilderToggle from 'components/DescriptionBuilder/DescriptionBuilderToggle';
import Highlighter from 'components/Highlighter';
import Error from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import Link from 'utils/cl-router/Link';
import {
  convertUrlToUploadFile,
  generateTemporaryFileAttachment,
  isUploadFile,
} from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { isSpaceModerator } from 'utils/permissions/roles';
import { defaultAdminCardPadding } from 'utils/styleConstants';
import { validateSlug } from 'utils/textUtils';

import { TOnProjectAttributesDiffChangeFunction } from '..';
import { fragmentId } from '../../projectHeader';
import { fragmentId as folderFragmentId } from '../../projectHeader/FolderProjectDropdown';
import GeographicAreaInputs from '../components/GeographicAreaInputs';
import ProjectCardImageDropzone from '../components/ProjectCardImageDropzone';
import ProjectCardImageTooltip from '../components/ProjectCardImageTooltip';
import ProjectFolderSelect from '../components/ProjectFolderSelect';
import ProjectHeaderImageTooltip from '../components/ProjectHeaderImageTooltip';
import ProjectNameInput from '../components/ProjectNameInput';
import {
  StyledForm,
  StyledInputMultiloc,
  StyledSectionField,
} from '../components/styling';
import TopicInputs from '../components/TopicInputs';
import messages from '../messages';
import validateTitle from '../utils/validateTitle';

const FOLDER_SELECT_ALLOWED_HIGHEST_ROLES: (string | undefined)[] = [
  'super_admin',
  'admin',
  'space_moderator',
  'project_folder_moderator',
] satisfies HighestRole[];

interface Props {
  project: IProject;
}

const AdminProjectsProjectGeneral = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const projectId = project.data.id;

  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const isProjectLibraryEnabled = useFeatureFlag({ name: 'project_library' });
  const appConfigLocales = useAppConfigurationLocales();
  const { width, containerRef } = useContainerWidthAndHeight();
  const { pathname } = useLocation();
  const showStickySaveButton = pathname.endsWith(
    `/admin/projects/${projectId}/general`
  );

  const { data: remoteProjectImages } = useProjectImages(projectId);
  const { mutateAsync: addProjectImage } = useAddProjectImage();
  const { mutateAsync: updateProjectImage } = useUpdateProjectImage();
  const { mutateAsync: deleteProjectImage } = useDeleteProjectImage();
  const { mutateAsync: updateProject } = useUpdateProject();

  const syncProjectFiles = useSyncFiles();

  // File Attachments
  const { mutate: addFile, isLoading: isAddingFile } = useAddFile();
  const { data: remoteProjectFileAttachments } = useFileAttachments({
    attachable_id: projectId,
    attachable_type: 'Project',
  });
  const [projectFileAttachments, setProjectFileAttachments] = useState<
    IFileAttachmentData[] | undefined
  >(remoteProjectFileAttachments?.data);
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

  const [slug, setSlug] = useState<string>(project.data.attributes.slug);
  const [showSlugErrorMessage, setShowSlugErrorMessage] = useState(false);

  // Description state
  const [descriptionMultiloc, setDescriptionMultiloc] = useState<Multiloc>(
    project.data.attributes.description_multiloc
  );
  const [descriptionPreviewMultiloc, setDescriptionPreviewMultiloc] =
    useState<Multiloc | null>(
      project.data.attributes.description_preview_multiloc
    );

  const showProjectFolderSelect =
    FOLDER_SELECT_ALLOWED_HIGHEST_ROLES.includes(
      authUser?.data.attributes.highest_role
    ) && isProjectFoldersEnabled;

  useEffect(() => {
    if (remoteProjectFileAttachments) {
      setProjectFileAttachments(remoteProjectFileAttachments.data);
    }
  }, [remoteProjectFileAttachments]);

  useEffect(() => {
    (async () => {
      if (remoteProjectImages) {
        for (const projectImage of remoteProjectImages.data) {
          const url = projectImage.attributes.versions.large;
          const altTextValue = projectImage.attributes.alt_text_multiloc;

          if (url) {
            const uploadFile = await convertUrlToUploadFile(
              url,
              projectImage.id,
              null
            );
            if (isUploadFile(uploadFile)) {
              setProjectCardImage(uploadFile);
              setProjectCardImageAltText(altTextValue);
              break;
            }
          }
        }
      }
    })();
  }, [remoteProjectImages]);

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
            attachableId: projectId,
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
      attachableId: projectId,
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

  const handleDescriptionChange = (description_multiloc: Multiloc) => {
    setSubmitState('enabled');
    setDescriptionMultiloc(description_multiloc);
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      description_multiloc,
    }));
  };

  const handleDescriptionPreviewChange = (
    description_preview_multiloc: Multiloc
  ) => {
    setSubmitState('enabled');
    setDescriptionPreviewMultiloc(description_preview_multiloc);
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      description_preview_multiloc,
    }));
  };

  async function saveForm() {
    const isFormValid = validateForm();

    if (!isFormValid) {
      setSubmitState('error');
      return;
    }

    if (processing) return;

    try {
      setProcessing(true);
      if (!isEmpty(projectAttributesDiff)) {
        await updateProject({
          projectId,
          ...projectAttributesDiff,
        });
      }

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

      const initialFileAttachmentOrdering: Record<string, number | undefined> =
        Object.fromEntries(
          remoteProjectFileAttachments?.data
            .filter((file) => file.id)
            .map((file) => [file.id!, file.attributes.position]) ?? []
        );

      const projectFilesPromise = projectFileAttachments
        ? syncProjectFiles({
            attachableId: projectId,
            attachableType: 'Project',
            fileAttachments: projectFileAttachments,
            fileAttachmentsToRemove: projectFileAttachmentsToRemove,
            fileAttachmentOrdering: initialFileAttachmentOrdering,
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

      queryClient.invalidateQueries({
        queryKey: projectPermissionKeys.list({ projectId }),
      });
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ slug: project.data.attributes.slug }),
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

  const handleSlugOnChange = (slug: string) => {
    setProjectAttributesDiff((projectAttributesDiff) => {
      return {
        ...projectAttributesDiff,
        slug,
      };
    });
    setSlug(slug);
    // This validation part should move to validateForm
    // Look out for complication with new project (where there's)
    // no slug and form should validate without.
    const isSlugValid = validateSlug(slug);
    setShowSlugErrorMessage(!isSlugValid);
    setSubmitState(isSlugValid ? 'enabled' : 'disabled');
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
    ...(!isNilOrError(project) ? project.data.attributes : {}),
    ...projectAttributesDiff,
  };

  const selectedTopicIds = getSelectedTopicIds(
    projectAttributesDiff,
    project.data
  );

  const projectCardImageShouldBeSaved = projectCardImage
    ? !projectCardImage.remote
    : false;

  return (
    <Box ref={containerRef}>
      <StyledForm
        className="e2e-project-general-form intercom-projects-new-project-form"
        onSubmit={onSubmit}
        showStickySaveButton={showStickySaveButton}
      >
        <Section>
          {projectId && (
            <>
              <SectionTitle>
                <FormattedMessage {...messages.titleGeneral} />
              </SectionTitle>
              <SectionDescription>
                <FormattedMessage {...messages.subtitleGeneral} />
              </SectionDescription>
            </>
          )}

          <Highlighter fragmentId={fragmentId}>
            <ProjectNameInput
              titleMultiloc={projectAttrs.title_multiloc}
              titleError={titleError}
              apiErrors={apiErrors}
              handleTitleMultilocOnChange={handleTitleMultilocOnChange}
            />
          </Highlighter>

          {/* Project Description Section */}
          <Section>
            <SubSectionTitle>
              <FormattedMessage {...messages.projectDescriptionSectionTitle} />
            </SubSectionTitle>
            <SectionDescription>
              <FormattedMessage
                {...messages.projectDescriptionSectionDescription}
              />
            </SectionDescription>
          </Section>

          {/* Main Description */}
          <SectionField>
            <Highlighter fragmentId="description-multiloc">
              <DescriptionBuilderToggle
                valueMultiloc={descriptionMultiloc}
                onChange={handleDescriptionChange}
                label={formatMessage(messages.descriptionLabel)}
                contentBuildableType="project"
              />
            </Highlighter>
            <Error
              fieldName="description_multiloc"
              apiErrors={apiErrors.description_multiloc}
            />
          </SectionField>

          {/* Homepage Description */}
          <SectionField>
            <Highlighter fragmentId="description-preview-multiloc">
              <TextAreaMultilocWithLocaleSwitcher
                valueMultiloc={descriptionPreviewMultiloc}
                onChange={handleDescriptionPreviewChange}
                label={formatMessage(messages.homepageDescriptionLabel)}
                labelTooltipText={formatMessage(
                  messages.homepageDescriptionTooltip
                )}
              />
            </Highlighter>
            <Error
              fieldName="description_preview_multiloc"
              apiErrors={apiErrors.description_preview_multiloc}
            />
          </SectionField>

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

          <StyledSectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.url} />
            </SubSectionTitle>
            <SlugInput
              intercomLabelClassname="intercom-product-tour-project-slug-label"
              slug={slug}
              pathnameWithoutSlug={'projects'}
              apiErrors={apiErrors}
              showSlugErrorMessage={showSlugErrorMessage}
              onSlugChange={handleSlugOnChange}
              showSlugChangedWarning={slug !== project.data.attributes.slug}
            />
          </StyledSectionField>

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
                isNewProject={false}
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
              imageUrl={project.data.attributes.header_bg.large}
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
        <Box
          {...(showStickySaveButton && {
            position: 'fixed',
            borderTop: `1px solid ${colors.divider}`,
            bottom: '0',
            w: `calc(${width}px + ${defaultAdminCardPadding * 2}px)`,
            ml: `-${defaultAdminCardPadding}px`,
            background: colors.white,
            display: 'flex',
            justifyContent: 'flex-start',
            px: `${defaultAdminCardPadding}px`,
          })}
          py="8px"
        >
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

const AdminProjectsProjectGeneralWrapper = () => {
  const { projectId } = useParams();
  const { data: project } = useProjectById(projectId);
  if (!project) return null;

  return <AdminProjectsProjectGeneral project={project} />;
};

export default AdminProjectsProjectGeneralWrapper;
