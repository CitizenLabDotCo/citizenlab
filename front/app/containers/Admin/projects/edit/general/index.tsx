import React, { PureComponent, FormEvent } from 'react';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
import { isEmpty, get, set } from 'lodash-es';
import { adopt } from 'react-adopt';
import deepMerge from 'deepmerge';
import eventEmitter from 'utils/eventEmitter';
import { withRouter, WithRouterProps } from 'react-router';
import styled from 'styled-components';

// components
import { IconTooltip } from 'cl2-component-library';
import ProjectStatusPicker from './components/ProjectStatusPicker';
import ProjectNameInput from './components/ProjectNameInput';
import SlugInput from './components/SlugInput';
import ProjectTypePicker from './components/ProjectTypePicker';
import GeographicAreaInputs from './components/GeographicAreaInputs';
import ImagesDropzone from 'components/UI/ImagesDropzone';
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
  StyledFileUploader,
} from './components/styling';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import {
  IUpdatedProjectProperties,
  projectByIdStream,
  IProjectFormState,
} from 'services/projects';
import { areasStream } from 'services/areas';
import { localeStream } from 'services/locale';
import { currentAppConfigurationStream } from 'services/appConfiguration';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// utils
import { getDefaultState, initSubscriptions } from './utils/state';
import save from './utils/save';
import validate from './utils/validate';

// typings
import { IOption, Multiloc, UploadFile } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

export const timeout = 350;

// Would have loved to put this in styling.ts, but
// that results in some arcane typescript error
// (see https://stackoverflow.com/q/43900035)
const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-top: 2px;
`;

export interface InputProps {}

interface DataProps {
  isProjectFoldersEnabled: GetFeatureFlagChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

export type onProjectFormStateChange = (fieldUpdates: {
  [fieldPath: string]: any;
}) => void;

export type PublicationStatus = 'draft' | 'published' | 'archived';

class AdminProjectEditGeneral extends PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  IProjectFormState
> {
  projectId$: BehaviorSubject<string | null>;
  processing$: BehaviorSubject<boolean>;
  subscriptions: Subscription[] = [];

  constructor(props) {
    super(props);

    this.state = getDefaultState();

    this.projectId$ = new BehaviorSubject(null);
    this.processing$ = new BehaviorSubject(false);
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentAppConfigurationStream().observable;
    const areas$ = areasStream().observable;
    const project$ = this.projectId$.pipe(
      distinctUntilChanged(),
      switchMap((projectId) =>
        projectId ? projectByIdStream(projectId).observable : of(null)
      )
    );

    this.projectId$.next(
      get(this.props, 'params.projectId', null) as string | null
    );

    this.subscriptions = initSubscriptions.apply(this, [
      locale$,
      currentTenant$,
      areas$,
      project$,
    ]);
  }

  componentDidUpdate(prevProps: Props) {
    if (
      get(this.props, 'params.projectId') !== get(prevProps, 'params.projectId')
    ) {
      this.projectId$.next(get(this.props, 'params.projectId', null));
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleTitleMultilocOnChange = (titleMultiloc: Multiloc) => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        title_multiloc: titleMultiloc,
      },
    }));
  };

  handleParticipationContextOnChange = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        ...participationContextConfig,
      },
    }));
  };

  handleProjectTypeOnChange = (projectType: 'continuous' | 'timeline') => {
    this.setState(({ projectAttributesDiff }) => ({
      projectType,
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        process_type: projectType,
      },
    }));
  };

  handleHeaderOnAdd = (newHeader: UploadFile[]) => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        header_bg: newHeader[0].base64,
      },
      projectHeaderImage: [newHeader[0]],
    }));
  };

  handleHeaderOnRemove = async () => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        header_bg: null,
      },
      projectHeaderImage: null,
    }));
  };

  handleProjectFileOnAdd = (newProjectFile: UploadFile) => {
    this.setState((prevState) => {
      const isDuplicate = prevState.projectFiles.some(
        (file) => file.base64 === newProjectFile.base64
      );
      const projectFiles = isDuplicate
        ? prevState.projectFiles
        : [...prevState.projectFiles, newProjectFile];
      const submitState = isDuplicate ? prevState.submitState : 'enabled';

      return {
        projectFiles,
        submitState,
      };
    });
  };

  handleProjectFileOnRemove = (projectFileToRemove: UploadFile) => {
    this.setState(({ projectFiles, projectFilesToRemove }) => ({
      submitState: 'enabled',
      projectFiles: projectFiles.filter(
        (file) => file.base64 !== projectFileToRemove.base64
      ),
      projectFilesToRemove: [...projectFilesToRemove, projectFileToRemove],
    }));
  };

  handleProjectImagesOnAdd = (projectImages: UploadFile[]) => {
    this.setState({
      projectImages,
      submitState: 'enabled',
    });
  };

  handleProjectImageOnRemove = (projectImageToRemove: UploadFile) => {
    this.setState(({ projectImages, projectImagesToRemove }) => ({
      submitState: 'enabled',
      projectImages: projectImages.filter(
        (image) => image.base64 !== projectImageToRemove.base64
      ),
      projectImagesToRemove: [...projectImagesToRemove, projectImageToRemove],
    }));
  };

  handleAreaTypeChange = (value: 'all' | 'selection') => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      areaType: value,
      projectAttributesDiff: {
        ...projectAttributesDiff,
        area_ids: value === 'all' ? [] : projectAttributesDiff.area_ids,
      },
    }));
  };

  handleAreaSelectionChange = (values: IOption[]) => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...projectAttributesDiff,
        area_ids: values.map((value) => value.value),
      },
    }));
  };

  onSubmit = (event: FormEvent<any>) => {
    event.preventDefault();

    const { projectType } = this.state;

    // if it's a new project of type continuous
    if (projectType === 'continuous') {
      eventEmitter.emit('getParticipationContext');
    } else {
      this.save();
    }
  };

  handleParcticipationContextOnSubmit = (
    participationContextConfig: IParticipationContextConfig
  ) => {
    this.save(participationContextConfig);
  };

  handleStatusChange = (value: PublicationStatus) => {
    this.setState(({ projectAttributesDiff }) => ({
      submitState: 'enabled',
      publicationStatus: value,
      projectAttributesDiff: {
        ...projectAttributesDiff,
        admin_publication_attributes: {
          publication_status: value,
        },
      },
    }));
  };

  handleSlugOnChange = (slug: string) => {
    this.setState(({ projectAttributesDiff }) => {
      return {
        slug,
        projectAttributesDiff: {
          ...projectAttributesDiff,
          slug,
        },
      };
    });

    this.validateSlug(slug);
  };

  validate = () => {
    const { formatMessage } = this.props.intl;
    const { currentTenant, projectAttributesDiff, project } = this.state;

    const { hasErrors, titleError } = validate(
      currentTenant,
      projectAttributesDiff,
      project,
      formatMessage
    );

    this.setState({
      titleError: !isEmpty(titleError) ? titleError : null,
    });

    return !hasErrors;
  };

  save = async (
    participationContextConfig: IParticipationContextConfig | null = null
  ) => {
    await save.apply(this, [participationContextConfig]);
  };

  validateSlug = (slug: string) => {
    // Default slug rules including arabic character ranges
    const slugRexEx = RegExp(
      /^[a-z0-9\u0600-\u06FF\u0750-\u077F]+(?:-[a-z0-9\u0600-\u06FF\u0750-\u077F]+)*$/
    );
    const isSlugValid = slugRexEx.test(slug);

    this.setState({
      showSlugErrorMessage: !isSlugValid,
      submitState: isSlugValid ? 'enabled' : 'disabled',
    });
  };

  handleFieldUpdate = (fieldUpdates: { [fieldPath: string]: any }) => {
    this.setState((prevState) => {
      const newState = { ...prevState };
      set(newState, 'submitState', 'enabled');
      for (const fieldPath in fieldUpdates) {
        set(newState, fieldPath, fieldUpdates[fieldPath]);
      }
      return deepMerge(prevState, newState);
    });
  };

  render() {
    const {
      publicationStatus,
      projectType,
      titleError,
      project,
      projectHeaderImage,
      projectImages,
      projectFiles,
      processing,
      projectAttributesDiff,
      areasOptions,
      areaType,
      submitState,
      apiErrors,
      slug,
      showSlugErrorMessage,
      currentTenant,
      locale,
    } = this.state;

    const { authUser } = this.props;

    if (
      !isNilOrError(authUser) &&
      (!get(this.props, 'params.projectId') ||
        (get(this.props, 'params.projectId') && project !== undefined))
    ) {
      const projectAttrs = {
        ...(project ? project.data.attributes : {}),
        ...projectAttributesDiff,
      } as IUpdatedProjectProperties;
      const areaIds =
        projectAttrs.area_ids ||
        (project &&
          project.data.relationships.areas.data.map((area) => area.id)) ||
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

      return (
        <StyledForm
          className="e2e-project-general-form"
          onSubmit={this.onSubmit}
        >
          <Section>
            {get(this.props, 'params.projectId') && (
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
              handleStatusChange={this.handleStatusChange}
            />

            <ProjectNameInput
              projectAttrs={projectAttrs}
              titleError={titleError}
              apiErrors={this.state.apiErrors}
              handleTitleMultilocOnChange={this.handleTitleMultilocOnChange}
            />

            {/* Only show this field when slug is already saved to project (i.e. not when creating a new project, which uses this form as well) */}
            {currentTenant && project?.data.attributes.slug && (
              <SlugInput
                currentTenant={currentTenant}
                project={project}
                locale={locale}
                slug={slug}
                apiErrors={apiErrors}
                showSlugErrorMessage={showSlugErrorMessage}
                handleSlugOnChange={this.handleSlugOnChange}
              />
            )}

            <StyledSectionField>
              {!project ? (
                <ProjectTypePicker
                  projectType={projectType}
                  handleProjectTypeOnChange={this.handleProjectTypeOnChange}
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
                  timeout={timeout}
                  mountOnEnter={true}
                  unmountOnExit={true}
                  enter={true}
                  exit={false}
                >
                  <ParticipationContextWrapper>
                    <ParticipationContext
                      onSubmit={this.handleParcticipationContextOnSubmit}
                      onChange={this.handleParticipationContextOnChange}
                      apiErrors={apiErrors}
                    />
                  </ParticipationContextWrapper>
                </CSSTransition>
              )}
            </StyledSectionField>

            {project && projectType === 'continuous' && (
              <ParticipationContext
                projectId={project.data.id}
                onSubmit={this.handleParcticipationContextOnSubmit}
                onChange={this.handleParticipationContextOnChange}
                apiErrors={apiErrors}
              />
            )}

            <GeographicAreaInputs
              areaType={areaType}
              areasOptions={areasOptions}
              areasValues={areasValues}
              handleAreaTypeChange={this.handleAreaTypeChange}
              handleAreaSelectionChange={this.handleAreaSelectionChange}
            />

            <Outlet
              id="app.components.AdminPage.projects.form.additionalInputs.inputs"
              projectAttrs={projectAttrs}
              onChange={this.handleFieldUpdate}
              authUser={authUser}
            />

            <StyledSectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.headerImageLabelText} />
                <IconTooltip
                  content={
                    <FormattedMessage
                      {...messages.headerImageLabelTooltip}
                      values={{
                        imageSupportArticleLink: (
                          // tslint:disable-next-line:react-a11y-anchors
                          <a
                            target="_blank"
                            href={this.props.intl.formatMessage(
                              messages.imageSupportArticleLinkTarget
                            )}
                          >
                            <FormattedMessage
                              {...messages.imageSupportArticleLinkText}
                            />
                          </a>
                        ),
                      }}
                    />
                  }
                />
              </SubSectionTitle>
              <StyledImagesDropzone
                images={projectHeaderImage}
                imagePreviewRatio={240 / 952}
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxImagePreviewWidth="500px"
                onAdd={this.handleHeaderOnAdd}
                onRemove={this.handleHeaderOnRemove}
              />
            </StyledSectionField>

            <StyledSectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.projectCardImageLabelText} />
                <IconTooltip
                  content={
                    <FormattedMessage
                      {...messages.projectCardImageLabelTooltip}
                    />
                  }
                />
              </SubSectionTitle>
              <StyledImagesDropzone
                images={projectImages}
                imagePreviewRatio={960 / 1440}
                maxImagePreviewWidth="240px"
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                onAdd={this.handleProjectImagesOnAdd}
                onRemove={this.handleProjectImageOnRemove}
              />
            </StyledSectionField>

            <StyledSectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.fileUploadLabel} />
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.fileUploadLabelTooltip} />
                  }
                />
              </SubSectionTitle>
              <StyledFileUploader
                onFileAdd={this.handleProjectFileOnAdd}
                onFileRemove={this.handleProjectFileOnRemove}
                files={projectFiles}
                errors={apiErrors}
              />
            </StyledSectionField>

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
    }

    return null;
  }
}

const AdminProjectEditGeneralWithHocs = injectIntl(AdminProjectEditGeneral);
const Data = adopt({
  isProjectFoldersEnabled: <GetFeatureFlag name="project_folders" />,
  authUser: <GetAuthUser />,
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => (
      <AdminProjectEditGeneralWithHocs {...inputProps} {...dataProps} />
    )}
  </Data>
));
