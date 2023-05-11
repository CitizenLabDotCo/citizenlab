import React, { useState, useEffect } from 'react';
import { Multiloc, UploadFile } from 'typings';
import { isEmpty, get, isString } from 'lodash-es';
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
} from './components/styling';
import ProjectFolderSelect from './components/ProjectFolderSelect';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import ProjectCardImageTooltip from './components/ProjectCardImageTooltip';
import ProjectHeaderImageTooltip from './components/ProjectHeaderImageTooltip';
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import useProject from 'hooks/useProject';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useProjectFiles from 'hooks/useProjectFiles';
import useProjectImages from 'api/project_images/useProjectImages';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';

// api
import {
  IUpdatedProjectProperties,
  addProject,
  updateProject,
  IProjectFormState,
  IProjectData,
} from 'services/projects';
import { addProjectFile, deleteProjectFile } from 'services/projectFiles';
import {
  addProjectImage,
  deleteProjectImage,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
} from 'services/projectImages';
import { queryClient } from 'utils/cl-react-query/queryClient';
import projectPermissionKeys from 'api/project_permissions/keys';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { validateSlug } from 'utils/textUtils';
import validateTitle from './utils/validateTitle';
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFile, isUploadFile } from 'utils/fileUtils';

export const TIMEOUT = 350;

export type TOnProjectAttributesDiffChangeFunction = (
  projectAttributesDiff: IProjectFormState['projectAttributesDiff'],
  submitState?: ISubmitState
) => void;

const AdminProjectsProjectGeneral = () => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams();
  const project = useProject({ projectId });
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });
  const appConfigLocales = useAppConfigurationLocales();
  const remoteProjectFiles = useProjectFiles(projectId);
  const { data: remoteProjectImages } = useProjectImages(projectId || null);
  const [submitState, setSubmitState] = useState<ISubmitState>('disabled');
  const [processing, setProcessing] =
    useState<IProjectFormState['processing']>(false);
  const [apiErrors, setApiErrors] = useState({});
  const [projectAttributesDiff, setProjectAttributesDiff] = useState<
    IProjectFormState['projectAttributesDiff']
  >({});
  const [titleError, setTitleError] =
    useState<IProjectFormState['titleError']>(null);
  // We should probably not have projectType, slug, publicationStatus, etc.
  // both in projectAttributesDiff and as separate state.
  const [projectType, setProjectType] =
    useState<IProjectFormState['projectType']>('timeline');
  const [projectFiles, setProjectFiles] = useState<
    IProjectFormState['projectFiles']
  >([]);
  const [projectFilesToRemove, setProjectFilesToRemove] = useState<
    IProjectFormState['projectFilesToRemove']
  >([]);
  const [projectCardImage, setProjectCardImage] =
    useState<IProjectFormState['projectCardImage']>(null);
  // project_images should always store one record, but in practice it was (or is?) different (maybe because of a bug)
  // https://citizenlabco.slack.com/archives/C015M14HYSF/p1674228018666059
  const [projectCardImageToRemove, setProjectCardImageToRemove] =
    useState<IProjectFormState['projectCardImageToRemove']>(null);
  // If we use cropper, we need to store two different images:
  // original and cropped.
  const [croppedProjectCardBase64, setCroppedProjectCardBase64] = useState<
    string | null
  >(null);

  const [slug, setSlug] = useState<IProjectFormState['slug']>(null);
  const [showSlugErrorMessage, setShowSlugErrorMessage] =
    useState<IProjectFormState['showSlugErrorMessage']>(false);
  const [publicationStatus, setPublicationStatus] =
    useState<IProjectFormState['publicationStatus']>('draft');

  useEffect(() => {
    (async () => {
      if (!isNilOrError(project)) {
        setPublicationStatus(project.attributes.publication_status);
        setProjectType(project.attributes.process_type);
        setSlug(project.attributes.slug);
      }
    })();
  }, [project]);

  useEffect(() => {
    (async () => {
      if (!isNilOrError(remoteProjectFiles)) {
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
          publication_status: project?.attributes.publication_status || 'draft',
        },
        ...projectAttributesDiff,
        ...participationContextConfig,
      };

      try {
        setProcessing(true);
        if (!isEmpty(nextProjectAttributesDiff)) {
          if (latestProjectId) {
            await updateProject(latestProjectId, nextProjectAttributesDiff);
          } else {
            const project = await addProject(nextProjectAttributesDiff);
            latestProjectId = project.data.id;
            isNewProject = true;
          }
        }

        const cardImageToAddPromise =
          croppedProjectCardBase64 && latestProjectId
            ? addProjectImage(latestProjectId, croppedProjectCardBase64)
            : null;

        const cardImageToRemovePromise =
          projectCardImageToRemove?.id && latestProjectId
            ? deleteProjectImage(latestProjectId, projectCardImageToRemove.id)
            : null;

        const filesToAddPromises = projectFiles
          .filter((file) => !file.remote)
          .map((file) => {
            if (latestProjectId) {
              return addProjectFile(latestProjectId, file.base64, file.name);
            }

            return;
          });
        const filesToRemovePromises = projectFilesToRemove
          .filter((file) => file.remote === true && isString(file.id))
          .map((file) => {
            if (latestProjectId && file.id) {
              return deleteProjectFile(latestProjectId, file.id);
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
      } catch (errors) {
        const apiErrors = get(
          errors,
          'json.errors',
          formatMessage(messages.saveErrorMessage)
        );
        setSubmitState('error');
        setApiErrors(apiErrors);
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

  const handleStatusChange = (
    publicationStatus: IProjectFormState['publicationStatus']
  ) => {
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
      projectAttributesDiff: IProjectFormState['projectAttributesDiff'],
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
    ...(!isNilOrError(project) ? project.attributes : {}),
    ...projectAttributesDiff,
  };

  const selectedTopicIds = getSelectedTopicIds(
    projectAttributesDiff,
    !isNilOrError(project) ? project : null
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
              showSlugChangedWarning={slug !== project.attributes.slug}
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
                />
              </ParticipationContextWrapper>
            </CSSTransition>
          )}
        </StyledSectionField>

        {!isNilOrError(project) && projectType === 'continuous' && (
          <ParticipationContext
            project={project}
            projectId={project.id}
            onSubmit={handleParticipationContextOnSubmit}
            onChange={handleParticipationContextOnChange}
            apiErrors={apiErrors}
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
            imageUrl={project?.attributes.header_bg.large}
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
