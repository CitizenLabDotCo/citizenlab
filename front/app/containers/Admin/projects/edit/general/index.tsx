import React, { PureComponent, FormEvent } from 'react';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { switchMap, distinctUntilChanged } from 'rxjs/operators';
import { isEmpty, get, isString, set } from 'lodash-es';
import { adopt } from 'react-adopt';
import deepMerge from 'deepmerge';
import eventEmitter from 'utils/eventEmitter';
import { withRouter, WithRouterProps } from 'react-router';
import styled from 'styled-components';

// components
import Error from 'components/UI/Error';
import { Radio, IconTooltip } from 'cl2-component-library';
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
import Link from 'utils/cl-router/Link';
import {
  StyledForm,
  StyledInputMultiloc,
  ProjectType,
  StyledSectionField,
  ParticipationContextWrapper,
  StyledFileUploader,
  StyledMultipleSelect,
  StyledWarning,
  StyledInput,
  SlugPreview,
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
  addProject,
  updateProject,
  IProjectFormState,
} from 'services/projects';
import { addProjectFile, deleteProjectFile } from 'services/projectFiles';
import { addProjectImage, deleteProjectImage } from 'services/projectImages';
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

// typings
import { IOption, Multiloc, UploadFile } from 'typings';
import { isNilOrError } from 'utils/helperUtils';
import { INewProjectCreatedEvent } from '../../all/CreateProject';

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

  handeProjectTypeOnChange = (projectType: 'continuous' | 'timeline') => {
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

  handleStatusChange = (value: 'draft' | 'published' | 'archived') => {
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
    let hasErrors = false;
    const { formatMessage } = this.props.intl;
    const { currentTenant, projectAttributesDiff, project } = this.state;
    const currentTenantLocales = currentTenant
      ? currentTenant.data.attributes.settings.core.locales
      : null;
    const projectAttrs = {
      ...(project ? project.data.attributes : {}),
      ...projectAttributesDiff,
    } as IUpdatedProjectProperties;
    const titleError = {} as Multiloc;

    if (currentTenantLocales) {
      currentTenantLocales.forEach((currentTenantLocale) => {
        const title = get(projectAttrs.title_multiloc, currentTenantLocale);

        if (isEmpty(title)) {
          titleError[currentTenantLocale] = formatMessage(
            messages.noTitleErrorMessage
          );
          hasErrors = true;
        }
      });
    }

    this.setState({
      titleError: !isEmpty(titleError) ? titleError : null,
    });

    return !hasErrors;
  };

  save = async (
    participationContextConfig: IParticipationContextConfig | null = null
  ) => {
    if (this.validate() && !this.state.processing) {
      const { formatMessage } = this.props.intl;
      const {
        project,
        projectImages,
        projectImagesToRemove,
        projectFiles,
        projectFilesToRemove,
      } = this.state;
      const projectAttributesDiff: IUpdatedProjectProperties = {
        ...this.state.projectAttributesDiff,
        ...participationContextConfig,
      };

      try {
        this.setState({ saved: false });
        this.processing$.next(true);

        let isNewProject = false;
        let projectId = project ? project.data.id : null;

        if (!isEmpty(projectAttributesDiff)) {
          if (project) {
            await updateProject(project.data.id, projectAttributesDiff);
          } else {
            const project = await addProject(projectAttributesDiff);
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
        }

        this.setState({
          saved: true,
          submitState: 'success',
          projectImagesToRemove: [],
          projectFilesToRemove: [],
        });

        this.processing$.next(false);

        if (isNewProject && projectId) {
          eventEmitter.emit<INewProjectCreatedEvent>('NewProjectCreated', {
            projectId,
          });
        }
      } catch (errors) {
        // const cannotContainIdeasError = get(errors, 'json.errors.base', []).some((item) => get(item, 'error') === 'cannot_contain_ideas');
        const apiErrors = get(
          errors,
          'json.errors',
          formatMessage(messages.saveErrorMessage)
        );
        const submitState = 'error';
        this.setState({ apiErrors, submitState });
        this.processing$.next(false);
      }
    }
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

    const {
      intl: { formatMessage },
      authUser,
    } = this.props;

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

            <StyledSectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.statusLabel} />
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.publicationStatusTooltip} />
                  }
                />
              </SubSectionTitle>
              <Radio
                onChange={this.handleStatusChange}
                currentValue={publicationStatus}
                value="draft"
                name="projectstatus"
                id="projecstatus-draft"
                className="e2e-projecstatus-draft"
                label={<FormattedMessage {...messages.draftStatus} />}
              />
              <Radio
                onChange={this.handleStatusChange}
                currentValue={publicationStatus}
                value="published"
                name="projectstatus"
                id="projecstatus-published"
                className="e2e-projecstatus-published"
                label={<FormattedMessage {...messages.publishedStatus} />}
              />
              <Radio
                onChange={this.handleStatusChange}
                currentValue={publicationStatus}
                value="archived"
                name="projectstatus"
                id="projecstatus-archived"
                className="e2e-projecstatus-archived"
                label={<FormattedMessage {...messages.archivedStatus} />}
              />
            </StyledSectionField>

            <StyledSectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.projectName} />
                <IconTooltip
                  content={<FormattedMessage {...messages.titleLabelTooltip} />}
                />
              </SubSectionTitle>
              <StyledInputMultiloc
                id="project-title"
                type="text"
                valueMultiloc={projectAttrs.title_multiloc}
                label={<FormattedMessage {...messages.titleLabel} />}
                onChange={this.handleTitleMultilocOnChange}
                errorMultiloc={titleError}
              />
              <Error
                fieldName="title_multiloc"
                apiErrors={this.state.apiErrors.title_multiloc}
              />
            </StyledSectionField>

            {/* Only show this field when slug is already saved to project (i.e. not when creating a new project, which uses this form as well) */}
            {currentTenant && project?.data.attributes.slug && (
              <StyledSectionField>
                <SubSectionTitle>
                  <FormattedMessage {...messages.projectUrl} />
                  <IconTooltip
                    content={
                      <FormattedMessage
                        {...messages.urlSlugTooltip}
                        values={{
                          currentProjectURL: (
                            <em>
                              <b>
                                {currentTenant.data.attributes.host}/{locale}
                                /projects/{project.data.attributes.slug}
                              </b>
                            </em>
                          ),
                          currentProjectSlug: (
                            <em>
                              <b>{project.data.attributes.slug}</b>
                            </em>
                          ),
                        }}
                      />
                    }
                  />
                </SubSectionTitle>
                <StyledWarning>
                  <FormattedMessage {...messages.urlSlugBrokenLinkWarning} />
                </StyledWarning>
                <StyledInput
                  id="project-slug"
                  type="text"
                  label={<FormattedMessage {...messages.urlSlugLabel} />}
                  onChange={this.handleSlugOnChange}
                  value={slug}
                />
                <SlugPreview>
                  <b>{formatMessage(messages.resultingURL)}</b>:{' '}
                  {currentTenant?.data.attributes.host}/{locale}/projects/
                  {slug}
                </SlugPreview>
                {/* Backend error */}
                <Error fieldName="slug" apiErrors={this.state.apiErrors.slug} />
                {/* Frontend error */}
                {showSlugErrorMessage && (
                  <Error text={formatMessage(messages.regexError)} />
                )}
              </StyledSectionField>
            )}

            <StyledSectionField>
              {!project ? (
                <>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.projectTypeTitle} />
                    <IconTooltip
                      content={
                        <FormattedMessage {...messages.projectTypeTooltip} />
                      }
                    />
                  </SubSectionTitle>
                  <StyledWarning
                    text={<FormattedMessage {...messages.projectTypeWarning} />}
                  />
                  <Radio
                    className="e2e-project-type-timeline"
                    onChange={this.handeProjectTypeOnChange}
                    currentValue={projectType}
                    value="timeline"
                    name="projecttype"
                    id="projectype-timeline"
                    label={<FormattedMessage {...messages.timeline} />}
                  />
                  <Radio
                    className="e2e-project-type-continuous"
                    onChange={this.handeProjectTypeOnChange}
                    currentValue={projectType}
                    value="continuous"
                    name="projecttype"
                    id="projectype-continuous"
                    label={<FormattedMessage {...messages.continuous} />}
                  />
                </>
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

            <StyledSectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.areasLabel} />
                <IconTooltip
                  content={
                    <FormattedMessage
                      {...messages.areasLabelTooltip}
                      values={{
                        areasLabelTooltipLink: (
                          <Link to="/admin/settings/areas">
                            <FormattedMessage
                              {...messages.areasLabelTooltipLinkText}
                            />
                          </Link>
                        ),
                      }}
                    />
                  }
                />
              </SubSectionTitle>
              <Radio
                onChange={this.handleAreaTypeChange}
                currentValue={areaType}
                value="all"
                name="areas"
                id="areas-all"
                label={<FormattedMessage {...messages.areasAllLabel} />}
              />
              <Radio
                onChange={this.handleAreaTypeChange}
                currentValue={areaType}
                value="selection"
                name="areas"
                id="areas-selection"
                className="e2e-areas-selection"
                label={<FormattedMessage {...messages.areasSelectionLabel} />}
              />

              {areaType === 'selection' && (
                <StyledMultipleSelect
                  id="e2e-area-selector"
                  options={areasOptions}
                  value={areasValues}
                  onChange={this.handleAreaSelectionChange}
                  placeholder=""
                  disabled={areaType !== 'selection'}
                />
              )}
            </StyledSectionField>

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
