import React, { useState, useEffect } from 'react';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { useParams } from 'react-router-dom';
// components
import ProjectStatusPicker from './components/ProjectStatusPicker';
import ProjectNameInput from './components/ProjectNameInput';
import SlugInput from 'components/admin/SlugInput';
import ProjectTypePicker from './components/ProjectTypePicker';
import TopicInputs from './components/TopicInputs';
import GeographicAreaInputs from './components/GeographicAreaInputs';
import HeaderImageDropzone from './components/HeaderImageDropzone';
import ProjectImageDropzone from './components/ProjectImageDropzone';
import AttachmentsDropzone from './components/AttachmentsDropzone';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';
import {
  Section,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import ParticipationContext, {
  IParticipationContextConfig,
} from '../participationContext';
import Outlet from 'components/Outlet';
import {
  StyledForm,
  ProjectType,
  StyledSectionField,
  ParticipationContextWrapper,
} from './components/styling';
// hooks
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';
import useAreas from 'hooks/useAreas';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
// animation
import CSSTransition from 'react-transition-group/CSSTransition';

import { validateSlug } from 'utils/textUtils';
import validateTitle from './utils/validateTitle';

// typings
import { IOption, Multiloc, UploadFile } from 'typings';
import { isNilOrError } from 'utils/helperUtils';
import useProjectFiles from 'hooks/useProjectFiles';
import useProjectImages from 'hooks/useProjectImages';
import { isEmpty, get, isString } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';

// services
import {
  IUpdatedProjectProperties,
  addProject,
  updateProject,
  IProjectFormState,
  IProjectData,
} from 'services/projects';
import { addProjectFile, deleteProjectFile } from 'services/projectFiles';
import { addProjectImage, deleteProjectImage } from 'services/projectImages';

// typings
import { INewProjectCreatedEvent } from '../../all/CreateProject';

export const TIMEOUT = 350;

const AdminProjectsProjectGeneral = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const params = useParams();
  const localize = useLocalize();
  const project = useProject({ projectId: params.projectId });
  const appConfigLocales = useAppConfigurationLocales();
  const remoteProjectFiles = useProjectFiles(params.projectId);
  const remoteProjectImages = useProjectImages({
    projectId: params.projectId || null,
  });
  const areas = useAreas();
  const [submitState, setSubmitState] = useState<ISubmitState>('disabled');
  const [processing, setProcessing] =
    useState<IProjectFormState['processing']>(false);
  const [apiErrors, setApiErrors] = useState({});
  const [projectAttributesDiff, setProjectAttributesDiff] = useState<
    IProjectFormState['projectAttributesDiff']
  >({
    admin_publication_attributes: {
      publication_status: 'draft',
    },
  });
  const [titleError, setTitleError] =
    useState<IProjectFormState['titleError']>(null);
  // We should probably not have projectType, slug, publicationStatus, etc.
  // both in projectAttributesDiff and as separate state.
  const [projectType, setProjectType] =
    useState<IProjectFormState['projectType']>('timeline');
  const [projectHeaderImage, setProjectHeaderImage] =
    useState<IProjectFormState['projectHeaderImage']>(null);
  const [projectFiles, setProjectFiles] = useState<
    IProjectFormState['projectFiles']
  >([]);
  const [projectFilesToRemove, setProjectFilesToRemove] = useState<
    IProjectFormState['projectFilesToRemove']
  >([]);
  const [projectImages, setProjectImages] = useState<
    IProjectFormState['projectImages']
  >([]);
  const [projectImagesToRemove, setProjectImagesToRemove] = useState<
    IProjectFormState['projectImagesToRemove']
  >([]);
  const [slug, setSlug] = useState<IProjectFormState['slug']>(null);
  const [showSlugErrorMessage, setShowSlugErrorMessage] =
    useState<IProjectFormState['showSlugErrorMessage']>(false);
  const [publicationStatus, setPublicationStatus] =
    useState<IProjectFormState['publicationStatus']>('draft');
  const [areaType, setAreaType] =
    useState<IProjectFormState['areaType']>('all');
  const [areasOptions, setAreasOptions] = useState<
    IProjectFormState['areasOptions']
  >([]);

  useEffect(() => {
    (async () => {
      if (!isNilOrError(project)) {
        setPublicationStatus(project.attributes.publication_status);
        setProjectType(project.attributes.process_type);
        setAreaType(
          project.relationships.areas.data.length > 0 ? 'selection' : 'all'
        );
        setSlug(project.attributes.slug);
        setProjectAttributesDiff({
          admin_publication_attributes: {
            publication_status: publicationStatus,
          },
        });
        const headerUrl = project.attributes.header_bg.large;
        const projectHeaderImage = headerUrl
          ? await convertUrlToUploadFile(headerUrl, null, null)
          : null;
        setProjectHeaderImage(projectHeaderImage ? [projectHeaderImage] : null);
      }
    })();
  }, [project, publicationStatus]);

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
        const nextProjectImagesPromises = remoteProjectImages.map(
          (projectImage) => {
            const url = projectImage.attributes.versions.large;
            // to be tested
            if (url) {
              return convertUrlToUploadFile(url, projectImage.id, null);
            }

            return;
          }
        );

        const nextProjectImages = (
          await Promise.all(nextProjectImagesPromises)
        ).filter(isUploadFile);

        setProjectImages(nextProjectImages);
      }
    })();
  }, [remoteProjectImages]);

  function isUploadFile(file: UploadFile | null): file is UploadFile {
    return file !== null;
  }

  useEffect(() => {
    if (!isNilOrError(areas)) {
      setAreasOptions(
        areas.map((area) => ({
          value: area.id,
          label: localize(area.attributes.title_multiloc),
        }))
      );
    }
  }, [areas, localize]);

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

  const handleHeaderOnAdd = (newHeader: UploadFile[]) => {
    const newHeaderFile = newHeader[0];

    setSubmitState('enabled');
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      header_bg: newHeaderFile.base64,
    }));
    setProjectHeaderImage([newHeaderFile]);
  };

  const handleHeaderOnRemove = async () => {
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      header_bg: null,
    }));
    setSubmitState('enabled');
    setProjectHeaderImage(null);
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

  const handleProjectImagesOnAdd = (projectImages: UploadFile[]) => {
    setSubmitState('enabled');
    setProjectImages(projectImages);
  };

  const handleProjectImageOnRemove = (projectImageToRemove: UploadFile) => {
    setProjectImages((projectImages) => {
      return projectImages.filter(
        (image) => image.base64 !== projectImageToRemove.base64
      );
    });
    setProjectImagesToRemove((projectImagesToRemove) => {
      return [...projectImagesToRemove, projectImageToRemove];
    });
    setSubmitState('enabled');
  };

  const handleTopicsChange = (topicIds: string[]) => {
    setSubmitState('enabled');
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      topic_ids: topicIds,
    }));
  };

  const handleAreaTypeChange = (areaType: 'all' | 'selection') => {
    setSubmitState('enabled');
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      area_ids: areaType === 'all' ? [] : projectAttributesDiff.area_ids,
    }));
    setAreaType(areaType);
  };

  const handleAreaSelectionChange = (values: IOption[]) => {
    setSubmitState('enabled');
    setProjectAttributesDiff((projectAttributesDiff) => ({
      ...projectAttributesDiff,
      area_ids: values.map((value) => value.value),
    }));
  };

  async function saveForm(
    participationContextConfig: IParticipationContextConfig | null
  ) {
    // Should be split. Same func for existing/new project
    // Makes things unnecessarily complicated (e.g. projectId below).
    let projectId = params.projectId;
    let isNewProject = false;
    const isFormValid = validateForm();

    if (!isFormValid) {
      setSubmitState('error');
    }

    if (isFormValid && !processing) {
      const nextProjectAttributesDiff: IUpdatedProjectProperties = {
        ...projectAttributesDiff,
        ...participationContextConfig,
      };

      try {
        setProcessing(true);
        if (!isEmpty(nextProjectAttributesDiff)) {
          if (projectId) {
            await updateProject(projectId, nextProjectAttributesDiff);
          } else {
            const project = await addProject(nextProjectAttributesDiff);
            projectId = project.data.id;
            isNewProject = true;
          }
        }

        if (isString(projectId)) {
          const imagesToAddPromises = projectImages
            .filter((file) => !file.remote)
            .map((file) => addProjectImage(projectId as string, file.base64));
          const imagesToRemovePromises = projectImagesToRemove
            .filter((file) => file.remote === true && isString(file.id))
            .map((file) =>
              deleteProjectImage(projectId as string, file.id as string)
            );
          const filesToAddPromises = projectFiles
            .filter((file) => !file.remote)
            .map((file) =>
              addProjectFile(projectId as string, file.base64, file.name)
            );
          const filesToRemovePromises = projectFilesToRemove
            .filter((file) => file.remote === true && isString(file.id))
            .map((file) =>
              deleteProjectFile(projectId as string, file.id as string)
            );

          await Promise.all([
            ...imagesToAddPromises,
            ...imagesToRemovePromises,
            ...filesToAddPromises,
            ...filesToRemovePromises,
          ] as Promise<any>[]);

          setSubmitState('success');
          setProjectImagesToRemove([]);
          setProjectFilesToRemove([]);
          setProcessing(false);

          if (isNewProject && projectId) {
            eventEmitter.emit<INewProjectCreatedEvent>('NewProjectCreated', {
              projectId,
            });
          }
        }
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
      save();
    }
  };

  const handleParcticipationContextOnSubmit = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    save(participationContextConfig);
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

  // We should look into only having 1 save function (saveForm)
  // And refactor this out
  const save = async (
    participationContextConfig: IParticipationContextConfig | null = null
  ) => {
    await saveForm(participationContextConfig);
  };

  const handleProjectAttributeDiffOnChange = (
    projectAttributesDiff: IProjectFormState['projectAttributesDiff'],
    submitState: ISubmitState
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
  const areaIds =
    projectAttrs.area_ids ||
    (!isNilOrError(project) &&
      project.relationships.areas.data.map((area) => area.id)) ||
    [];
  const areasValues = areaIds
    .filter((id) => {
      return areasOptions.some((areaOption) => areaOption.value === id);
    })
    .map((id) => {
      return areasOptions.find(
        (areaOption) => areaOption.value === id
      ) as IOption;
    });

  const selectedTopicIds = getSelectedTopicIds(
    projectAttributesDiff,
    !isNilOrError(project) ? project : null
  );

  return (
    <StyledForm className="e2e-project-general-form" onSubmit={onSubmit}>
      <Section>
        {params.projectId && (
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
        {!isNilOrError(project) && project.attributes.slug && (
          <SlugInput
            slug={slug}
            resource="project"
            apiErrors={apiErrors}
            showSlugErrorMessage={showSlugErrorMessage}
            handleSlugOnChange={handleSlugOnChange}
          />
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
                  onSubmit={handleParcticipationContextOnSubmit}
                  onChange={handleParticipationContextOnChange}
                  apiErrors={apiErrors}
                />
              </ParticipationContextWrapper>
            </CSSTransition>
          )}
        </StyledSectionField>

        {!isNilOrError(project) && projectType === 'continuous' && (
          <ParticipationContext
            projectId={project.id}
            onSubmit={handleParcticipationContextOnSubmit}
            onChange={handleParticipationContextOnChange}
            apiErrors={apiErrors}
          />
        )}

        <TopicInputs
          selectedTopicIds={selectedTopicIds}
          onChange={handleTopicsChange}
        />

        <GeographicAreaInputs
          areaType={areaType}
          areasOptions={areasOptions}
          areasValues={areasValues}
          handleAreaTypeChange={handleAreaTypeChange}
          handleAreaSelectionChange={handleAreaSelectionChange}
        />

        <Outlet
          id="app.components.AdminPage.projects.form.additionalInputs.inputs"
          projectAttrs={projectAttrs}
          onProjectAttributesDiffChange={handleProjectAttributeDiffOnChange}
        />

        <HeaderImageDropzone
          projectHeaderImage={projectHeaderImage}
          handleHeaderOnAdd={handleHeaderOnAdd}
          handleHeaderOnRemove={handleHeaderOnRemove}
        />

        <ProjectImageDropzone
          projectImages={projectImages}
          handleProjectImagesOnAdd={handleProjectImagesOnAdd}
          handleProjectImageOnRemove={handleProjectImageOnRemove}
        />

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

export default injectIntl(AdminProjectsProjectGeneral);

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
