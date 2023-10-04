import React, { useState, useEffect } from 'react';
import { Multiloc, UploadFile, CLErrors } from 'typings';
import { isEmpty, isString } from 'lodash-es';
import CSSTransition from 'react-transition-group/CSSTransition';
import { INewProjectCreatedEvent } from 'containers/Admin/projects/all/CreateProject';

// components
import ProjectStatusPicker from './components/ProjectStatusPicker';
import ProjectNameInput from './components/ProjectNameInput';
import SlugInput from 'components/admin/SlugInput';
import ProjectTypePicker from './components/ProjectTypePicker';
import TopicInputs from './components/TopicInputs';
import GeographicAreaInputs from './components/GeographicAreaInputs';
import HeaderBgUploader from 'components/admin/ProjectableHeaderBgUploader';
import ProjectCardImageDropzone from './components/ProjectCardImageDropzone';
import AttachmentsDropzone from './components/AttachmentsDropzone';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';
import {
  Section,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
  SectionField,
} from 'components/admin/Section';
import ParticipationContext, {
  IParticipationContextConfig,
} from '../participationContext';
import {
  StyledForm,
  ProjectType,
  StyledSectionField,
  ParticipationContextWrapper,
  TIMEOUT,
} from './components/styling';
import ProjectFolderSelect from './components/ProjectFolderSelect';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import ProjectCardImageTooltip from './components/ProjectCardImageTooltip';
import ProjectHeaderImageTooltip from './components/ProjectHeaderImageTooltip';
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useProjectFiles from 'api/project_files/useProjectFiles';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAddProject from 'api/projects/useAddProject';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import {
  IUpdatedProjectProperties,
  IProjectData,
  PublicationStatus,
} from 'api/projects/types';
import { queryClient } from 'utils/cl-react-query/queryClient';
import useAddProjectFile from 'api/project_files/useAddProjectFile';
import useDeleteProjectFile from 'api/project_files/useDeleteProjectFile';

// api
import useProjectImages, {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';
import projectPermissionKeys from 'api/project_permissions/keys';
import useAddProjectImage from 'api/project_images/useAddProjectImage';
import useDeleteProjectImage from 'api/project_images/useDeleteProjectImage';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { validateSlug } from 'utils/textUtils';
import validateTitle from './utils/validateTitle';
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFile, isUploadFile } from 'utils/fileUtils';
import useUpdateProject from 'api/projects/useUpdateProject';
import projectsKeys from 'api/projects/keys';

export type TOnProjectAttributesDiffChangeFunction = (
  projectAttributesDiff: IUpdatedProjectProperties,
  submitState?: ISubmitState
) => void;

const AdminProjectsProjectGeneral = () => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const { projectId } = useParams();
  const { data: project } = useProjectById(projectId);
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const appConfigLocales = useAppConfigurationLocales();

  const { data: remoteProjectImages } = useProjectImages(projectId || null);
  const { mutateAsync: addProjectImage } = useAddProjectImage();
  const { mutateAsync: deleteProjectImage } = useDeleteProjectImage();
  const { mutateAsync: updateProject } = useUpdateProject();
  const { mutateAsync: addProject } = useAddProject();

  const { data: remoteProjectFiles } = useProjectFiles(projectId || null);
  const { mutateAsync: addProjectFile } = useAddProjectFile();
  const { mutateAsync: deleteProjectFile } = useDeleteProjectFile();
  const [submitState, setSubmitState] = useState<ISubmitState>('disabled');

  const [processing, setProcessing] = useState(false);
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [projectAttributesDiff, setProjectAttributesDiff] =
    useState<IUpdatedProjectProperties>({});
  const [titleError, setTitleError] = useState<Multiloc | null>(null);
  // We should probably not have projectType, slug, publicationStatus, etc.
  // both in projectAttributesDiff and as separate state.
  const [projectType, setProjectType] = useState<'continuous' | 'timeline'>(
    'timeline'
  );
  const [projectFiles, setProjectFiles] = useState<UploadFile[]>([]);
  const [projectFilesToRemove, setProjectFilesToRemove] = useState<
    UploadFile[]
  >([]);
  const [projectCardImage, setProjectCardImage] = useState<UploadFile | null>(
    null
  );
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
  const [publicationStatus, setPublicationStatus] =
    useState<PublicationStatus>('draft');

  useEffect(() => {
    (async () => {
      if (project) {
        setPublicationStatus(project.data.attributes.publication_status);
        setProjectType(project.data.attributes.process_type);
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
      }
    })();
  }, [remoteProjectFiles]);

  useEffect(() => {
    (async () => {
      if (!isNilOrError(remoteProjectImages)) {
        const nextProjectImagesPromises = remoteProjectImages.data.map(
          (projectImage) => {
            const url = projectImage.attributes.versions.large;

            if (url) {
              return convertUrlToUploadFile(url, projectImage.id, null);
            }

            return;
          }
        );

        const nextProjectImages = (
          await Promise.all(nextProjectImagesPromises)
        ).filter(isUploadFile);

        setProjectCardImage(nextProjectImages[0]);
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

  const handleParticipationContextOnChange = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    setSubmitState('enabled');
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      ...participationContextConfig,
    }));
  };

  const handleProjectTypeOnChange = (
    projectType: 'continuous' | 'timeline'
  ) => {
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      process_type: projectType,
    }));
    setSubmitState('enabled');
    setProjectType(projectType);
  };

  const handleHeaderBgChange = (newImageBase64: string | null) => {
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      header_bg: newImageBase64,
    }));
    setSubmitState('enabled');
  };

  const handleProjectCardImageOnAdd = (projectImages: UploadFile[]) => {
    setSubmitState('enabled');
    setProjectCardImage(projectImages[0]);
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

  async function saveForm(
    participationContextConfig: IParticipationContextConfig | null = null
  ) {
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
        ...participationContextConfig,
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
                image: { image: croppedProjectCardBase64 },
              })
            : null;

        const cardImageToRemovePromise =
          projectCardImageToRemove?.id && latestProjectId
            ? deleteProjectImage({
                projectId: latestProjectId,
                imageId: projectCardImageToRemove.id,
              })
            : null;

        const filesToAddPromises = projectFiles
          .filter((file) => !file.remote)
          .map((file) => {
            if (latestProjectId) {
              return addProjectFile({
                projectId: latestProjectId,
                file: { file: file.base64, name: file.name },
              });
            }

            return;
          });
        const filesToRemovePromises = projectFilesToRemove
          .filter((file) => file.remote === true && isString(file.id))
          .map((file) => {
            if (latestProjectId && file.id) {
              return deleteProjectFile({
                projectId: latestProjectId,
                fileId: file.id,
              });
            }

            return;
          });

        await Promise.all([
          cardImageToAddPromise,
          cardImageToRemovePromise,
          ...filesToAddPromises,
          ...filesToRemovePromises,
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

    // Simplify or document.
    // Not clear what this means.
    if (projectType === 'continuous') {
      eventEmitter.emit('getParticipationContext');
    } else {
      saveForm();
    }
  };

  const handleParticipationContextOnSubmit = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    saveForm(participationContextConfig);
  };

  const handleStatusChange = (publicationStatus: PublicationStatus) => {
    setSubmitState('enabled');
    setPublicationStatus(publicationStatus);
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      admin_publication_attributes: {
        publication_status: publicationStatus,
      },
    }));
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

  return (
    <StyledForm className="e2e-project-general-form" onSubmit={onSubmit}>
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

        <ProjectStatusPicker
          publicationStatus={publicationStatus}
          handleStatusChange={handleStatusChange}
        />

        <ProjectNameInput
          titleMultiloc={projectAttrs.title_multiloc}
          titleError={titleError}
          apiErrors={apiErrors}
          handleTitleMultilocOnChange={handleTitleMultilocOnChange}
        />

        {/* Only show this field when slug is already saved to project (i.e. not when creating a new project, which uses this form as well) */}
        {!isNilOrError(project) && slug && (
          <StyledSectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.url} />
            </SubSectionTitle>
            <SlugInput
              slug={slug}
              pathnameWithoutSlug={'projects'}
              apiErrors={apiErrors}
              showSlugErrorMessage={showSlugErrorMessage}
              onSlugChange={handleSlugOnChange}
              showSlugChangedWarning={slug !== project.data.attributes.slug}
            />
          </StyledSectionField>
        )}

        <StyledSectionField>
          {!project ? (
            <ProjectTypePicker
              projectType={projectType}
              handleProjectTypeOnChange={handleProjectTypeOnChange}
            />
          ) : (
            <>
              <SubSectionTitle>
                <FormattedMessage {...messages.projectTypeTitle} />
              </SubSectionTitle>
              <ProjectType>
                {<FormattedMessage {...messages[projectType]} />}
              </ProjectType>
            </>
          )}

          {!project && (
            <CSSTransition
              classNames="participationcontext"
              in={projectType === 'continuous'}
              timeout={TIMEOUT}
              mountOnEnter={true}
              unmountOnExit={true}
              enter={true}
              exit={false}
            >
              <ParticipationContextWrapper>
                <ParticipationContext
                  project={project}
                  onSubmit={handleParticipationContextOnSubmit}
                  onChange={handleParticipationContextOnChange}
                  apiErrors={apiErrors}
                  appConfig={appConfig}
                />
              </ParticipationContextWrapper>
            </CSSTransition>
          )}
        </StyledSectionField>

        {!isNilOrError(project) && projectType === 'continuous' && (
          <ParticipationContext
            project={project}
            onSubmit={handleParticipationContextOnSubmit}
            onChange={handleParticipationContextOnChange}
            apiErrors={apiErrors}
            appConfig={appConfig}
          />
        )}

        <TopicInputs
          selectedTopicIds={selectedTopicIds}
          onChange={handleTopicsChange}
        />

        <GeographicAreaInputs
          areaIds={projectAttrs.area_ids}
          onProjectAttributesDiffChange={handleProjectAttributeDiffOnChange}
        />

        {isProjectFoldersEnabled && (
          <ProjectFolderSelect
            projectAttrs={projectAttrs}
            onProjectAttributesDiffChange={handleProjectAttributeDiffOnChange}
          />
        )}

        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.headerImageInputLabel} />
            <ProjectHeaderImageTooltip />
          </SubSectionTitle>
          <HeaderBgUploader
            imageUrl={project?.data.attributes.header_bg.large}
            onImageChange={handleHeaderBgChange}
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

        <AttachmentsDropzone
          projectFiles={projectFiles}
          apiErrors={apiErrors}
          handleProjectFileOnAdd={handleProjectFileOnAdd}
          handleProjectFileOnRemove={handleProjectFileOnRemove}
        />

        <SubmitWrapper
          loading={processing}
          status={submitState}
          messages={{
            buttonSave: messages.saveProject,
            buttonSuccess: messages.saveSuccess,
            messageError: messages.saveErrorMessage,
            messageSuccess: messages.saveSuccessMessage,
          }}
        />
      </Section>
    </StyledForm>
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
