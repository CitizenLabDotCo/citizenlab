import React, { useState } from 'react';
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { IProjectFormState } from 'services/projects';
import { getSelectedTopicIds } from './utils/state';

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
import SubmitWrapper from 'components/admin/SubmitWrapper';
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
import { withRouter, WithRouterProps } from 'utils/withRouter';
import useProject from 'hooks/useProject';
import useAuthUser from 'hooks/useAuthUser';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';

import eventEmitter from 'utils/eventEmitter';

import { validateSlug } from 'utils/textUtils';

// typings
import { IOption, Multiloc, UploadFile } from 'typings';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';

export const TIMEOUT = 350;

interface Props {}

const AdminProjectEditGeneral = ({
  // projectId can also be undefined
  params: { projectId },
  intl: { formatMessage },
}: Props & InjectedIntlProps & WithRouterProps) => {
  const project = useProject({ projectId });
  const appConfiguration = useAppConfiguration();
  const authUser = useAuthUser();
  const [submitState, setSubmitState] = useState<ISubmitState>('disabled');
  const [processing, setProcessing] =
    useState<IProjectFormState['processing']>(false);
  // still used?
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
    // const newHeaderBg = newHeader[0].base64;

    setSubmitState('enabled');
    // setProjectAttributesDiff((projectAttributesDiff) => ({
    //   ...projectAttributesDiff,
    //   // don't think this is right
    //   header_bg: newHeaderBg,
    // }));
    setProjectHeaderImage([newHeader[0]]);
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
    setProjectFilesToRemove((projectImagesToRemove) => {
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

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // if it's a new project of type continuous
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
    // add submitState enabled?

    validateProjectSlug(slug);
  };

  // Does validate get used?

  // const validate = () => {
  //   const { hasErrors, titleError } = validate(
  //     appConfiguration,
  //     projectAttributesDiff,
  //     project,
  //     formatMessage
  //   );

  //   setTitleError(!isEmpty(titleError) ? titleError : null)

  //   return !hasErrors;
  // };

  const save = async (
    participationContextConfig: IParticipationContextConfig | null = null
  ) => {
    await save.apply(this, [participationContextConfig]);
  };

  const validateProjectSlug = (slug: string) => {
    const isSlugValid = validateSlug(slug);
    setSubmitState(isSlugValid ? 'enabled' : 'disabled');
    setShowSlugErrorMessage(!isSlugValid);
  };

  const handleProjectAttributeDiffOnChange = (
    projectAttributesDiff: IProjectFormState['projectAttributesDiff'],
    submitState: ISubmitState
  ) => {
    setProjectAttributesDiff((currentProjectAttributesDiff) => ({
      ...currentProjectAttributesDiff,
      projectAttributesDiff,
    }));
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

export default withRouter(injectIntl(AdminProjectEditGeneral));
