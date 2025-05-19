import React, { useState, useEffect } from 'react';

import { Box, colors, IconTooltip } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useParams, useLocation } from 'react-router-dom';
import { Multiloc, UploadFile, CLErrors } from 'typings';

import useProjectFiles from 'api/project_files/useProjectFiles';
import useAddProjectImage from 'api/project_images/useAddProjectImage';
import useDeleteProjectImage from 'api/project_images/useDeleteProjectImage';
import useProjectImages, {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';
import useUpdateProjectImage from 'api/project_images/useUpdateProjectImage';
import projectPermissionKeys from 'api/project_permissions/keys';
import projectsKeys from 'api/projects/keys';
import { IUpdatedProjectProperties, IProjectData } from 'api/projects/types';
import useAddProject from 'api/projects/useAddProject';
import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import { useSyncProjectFiles } from 'hooks/files/useSyncProjectFiles';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useFeatureFlag from 'hooks/useFeatureFlag';

import { INewProjectCreatedEvent } from 'containers/Admin/projects/new';

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
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';
import Highlighter from 'components/Highlighter';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFile, isUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { usePermission } from 'utils/permissions';
import { defaultAdminCardPadding } from 'utils/styleConstants';
import { validateSlug } from 'utils/textUtils';

import { fragmentId } from '../projectHeader';
import { fragmentId as folderFragmentId } from '../projectHeader/LinkToFolderSettings';

import AttachmentsDropzone from './components/AttachmentsDropzone';
import GeographicAreaInputs from './components/GeographicAreaInputs';
import ProjectCardImageDropzone from './components/ProjectCardImageDropzone';
import ProjectCardImageTooltip from './components/ProjectCardImageTooltip';
import ProjectFolderSelect from './components/ProjectFolderSelect';
import ProjectHeaderImageTooltip from './components/ProjectHeaderImageTooltip';
import ProjectNameInput from './components/ProjectNameInput';
import {
  StyledForm,
  StyledInputMultiloc,
  StyledSectionField,
} from './components/styling';
import TopicInputs from './components/TopicInputs';
import messages from './messages';
import validateTitle from './utils/validateTitle';

export type TOnProjectAttributesDiffChangeFunction = (
  projectAttributesDiff: IUpdatedProjectProperties,
  submitState?: ISubmitState
) => void;

type FileOrdering = {
  [id: string]: number | undefined;
};

const AdminProjectsProjectGeneral = () => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams();
  const { data: project } = useProjectById(projectId);

  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const isProjectLibraryEnabled = useFeatureFlag({ name: 'project_library' });
  const appConfigLocales = useAppConfigurationLocales();
  const { width, containerRef } = useContainerWidthAndHeight();
  const { pathname } = useLocation();
  const showStickySaveButton = pathname.endsWith(
    `/admin/projects/${projectId}/settings`
  );

  const { data: remoteProjectImages } = useProjectImages(projectId || null);
  const { mutateAsync: addProjectImage } = useAddProjectImage();
  const { mutateAsync: updateProjectImage } = useUpdateProjectImage();
  const { mutateAsync: deleteProjectImage } = useDeleteProjectImage();
  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: addProject } = useAddProject();

  const { data: remoteProjectFiles } = useProjectFiles(projectId || null);
  const syncProjectFiles = useSyncProjectFiles();

  const [submitState, setSubmitState] = useState<ISubmitState>('disabled');

  const [processing, setProcessing] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [projectAttributesDiff, setProjectAttributesDiff] =
    useState<IUpdatedProjectProperties>({});
  const [titleError, setTitleError] = useState<Multiloc | null>(null);
  // We should probably not have slug, publicationStatus, etc.
  // both in projectAttributesDiff and as separate state.
  const [projectFiles, setProjectFiles] = useState<UploadFile[]>([]);
  const [initialProjectFilesOrdering, setInitialProjectFilesOrdering] =
    useState<FileOrdering>({});
  const [projectFilesToRemove, setProjectFilesToRemove] = useState<
    UploadFile[]
  >([]);
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

  const [slug, setSlug] = useState<string | null>(null);
  const [showSlugErrorMessage, setShowSlugErrorMessage] = useState(false);

  const showProjectFolderSelect =
    usePermission({
      item: 'project_folder',
      action: 'create_project_in_folder',
    }) && isProjectFoldersEnabled;

  useEffect(() => {
    (async () => {
      if (project) {
        setSlug(project.data.attributes.slug);
      }
    })();
  }, [project]);

  useEffect(() => {
    (async () => {
      if (remoteProjectFiles) {
        const nextProjectFilesPromises = remoteProjectFiles.data.map(
          (projectFile) => {
            const url = projectFile.attributes.file.url;
            const filename = projectFile.attributes.name;
            const id = projectFile.id;
            const projectUploadFilePromise = convertUrlToUploadFile(
              url,
              id,
              filename
            );
            return projectUploadFilePromise;
          }
        );

        const nextProjectFiles = (
          await Promise.all(nextProjectFilesPromises)
        ).filter(isUploadFile);

        setProjectFiles(nextProjectFiles);
        /*
         * Alternative deep copy methods like deepClone, structuredClone, and JSON.parse(JSON.stringify(obj))
         * have inconsistencies, so we create an object with only the necessary properties for ordering.
         * This approach is fine for now as the number of files is expected to be small. We can optimize if performance becomes an issue.
         * We are also using an object here so lookup is O(1).
         */
        setInitialProjectFilesOrdering(
          nextProjectFiles.reduce((acc, file) => {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (file?.id) {
              acc[file.id] = file.ordering;
            }
            return acc;
          }, {})
        );
      }
    })();
  }, [remoteProjectFiles]);

  useEffect(() => {
    (async () => {
      if (!isNilOrError(remoteProjectImages)) {
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

  const handleProjectFileOnAdd = (newProjectFile: UploadFile) => {
    let isDuplicate = false;

    setProjectFiles((projectFiles) => {
      isDuplicate = projectFiles.some(
        (file) => file.base64 === newProjectFile.base64
      );

      return isDuplicate ? projectFiles : [...projectFiles, newProjectFile];
    });
    setSubmitState((submitState) => (isDuplicate ? submitState : 'enabled'));
  };
  const handleProjectFileOnRemove = (projectFileToRemove: UploadFile) => {
    setSubmitState('enabled');
    setProjectFiles((projectFiles) =>
      projectFiles.filter((file) => file.base64 !== projectFileToRemove.base64)
    );
    setProjectFilesToRemove((projectFilesToRemove) => [
      ...projectFilesToRemove,
      projectFileToRemove,
    ]);
  };

  const handleTopicsChange = (topicIds: string[]) => {
    setSubmitState('enabled');
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      topic_ids: topicIds,
    }));
  };

  async function saveForm() {
    // Should be split. Same func for existing/new project
    // Makes things unnecessarily complicated (e.g. projectId below).
    let isNewProject = false;
    let latestProjectId = projectId;
    const isFormValid = validateForm();

    if (!isFormValid) {
      setSubmitState('error');
    }

    if (isFormValid && !processing) {
      const nextProjectAttributesDiff: IUpdatedProjectProperties = {
        admin_publication_attributes: {
          publication_status:
            project?.data.attributes.publication_status || 'draft',
        },
        ...projectAttributesDiff,
      };

      try {
        setProcessing(true);
        if (!isEmpty(nextProjectAttributesDiff)) {
          if (latestProjectId) {
            await updateProject({
              projectId: latestProjectId,
              ...nextProjectAttributesDiff,
            });
          } else {
            const response = await addProject(nextProjectAttributesDiff);
            latestProjectId = response.data.id;
            isNewProject = true;
          }
        }

        const cardImageToAddPromise =
          croppedProjectCardBase64 && latestProjectId
            ? addProjectImage({
                projectId: latestProjectId,
                image: {
                  image: croppedProjectCardBase64,
                  ...(projectCardImageAltText
                    ? { alt_text_multiloc: projectCardImageAltText }
                    : {}),
                },
              })
            : null;

        const cardImageToUpdatePromise =
          projectCardImage &&
          projectCardImage.id &&
          projectCardImageAltText &&
          latestProjectId
            ? updateProjectImage({
                projectId: latestProjectId,
                imageId: projectCardImage.id,
                image: {
                  image: projectCardImage.base64,
                  alt_text_multiloc: projectCardImageAltText,
                },
              })
            : null;

        const cardImageToRemovePromise =
          projectCardImageToRemove?.id && latestProjectId
            ? deleteProjectImage({
                projectId: latestProjectId,
                imageId: projectCardImageToRemove.id,
              })
            : null;

        const projectFilesPromise = latestProjectId
          ? syncProjectFiles({
              projectId: latestProjectId,
              projectFiles,
              filesToRemove: projectFilesToRemove,
              fileOrdering: initialProjectFilesOrdering,
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
        setProjectFilesToRemove([]);
        setProcessing(false);

        if (isNewProject && latestProjectId) {
          eventEmitter.emit<INewProjectCreatedEvent>('NewProjectCreated', {
            projectId: latestProjectId,
          });
        }
        queryClient.invalidateQueries({
          queryKey: projectPermissionKeys.list({ projectId: latestProjectId }),
        });
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({ slug: project?.data.attributes.slug }),
        });
      } catch (errors) {
        setSubmitState('error');
        setApiErrors(errors.errors);
        setProcessing(false);
      }
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

  const projectAttrs = {
    ...(!isNilOrError(project) ? project.data.attributes : {}),
    ...projectAttributesDiff,
  };

  const selectedTopicIds = getSelectedTopicIds(
    projectAttributesDiff,
    project?.data ?? null
  );

  const projectCardImageShouldBeSaved = projectCardImage
    ? !projectCardImage.remote
    : false;

  const handleFilesReorder = (updatedFiles: UploadFile[]) => {
    setProjectFiles(updatedFiles);
    setSubmitState('enabled');
  };

  const isNewProject = !projectId;

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

          {!isNewProject && (
            <Warning>
              {formatMessage(messages.publicationStatusWarning)}
            </Warning>
          )}

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

          {/* Only show this field when slug is already saved to project (i.e. not when creating a new project, which uses this form as well) */}
          {!isNilOrError(project) && slug && (
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
                onProjectAttributesDiffChange={
                  handleProjectAttributeDiffOnChange
                }
                isNewProject={isNewProject}
              />
            </Highlighter>
          )}

          <SectionField className="intercom-product-tour-project-header-image-field">
            <SubSectionTitle>
              <FormattedMessage {...messages.headerImageInputLabel} />
              <ProjectHeaderImageTooltip />
            </SubSectionTitle>
            <HeaderBgUploader
              imageUrl={project?.data.attributes.header_bg.large}
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

          <AttachmentsDropzone
            projectFiles={projectFiles}
            apiErrors={apiErrors}
            handleProjectFileOnAdd={handleProjectFileOnAdd}
            handleProjectFileOnRemove={handleProjectFileOnRemove}
            onFileReorder={handleFilesReorder}
          />
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

export default AdminProjectsProjectGeneral;

function getSelectedTopicIds(
  projectAttributesDiff: IUpdatedProjectProperties,
  project: IProjectData | null
) {
  if (projectAttributesDiff.topic_ids) return projectAttributesDiff.topic_ids;

  if (project) {
    return project.relationships.topics.data.map((topic) => topic.id);
  }

  return [];
}
