import React, { PureComponent, FormEvent } from 'react';
import { Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import {
  switchMap,
  map,
  filter as rxFilter,
  distinctUntilChanged,
} from 'rxjs/operators';
import { isEmpty, get, isString, set } from 'lodash-es';
import { adopt } from 'react-adopt';
import deepMerge from 'deepmerge';
import eventEmitter from 'utils/eventEmitter';
import { withRouter, WithRouterProps } from 'react-router';

// components
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Error from 'components/UI/Error';
import { Radio, IconTooltip, Input } from 'cl2-component-library';
import MultipleSelect from 'components/UI/MultipleSelect';
import FileUploader from 'components/UI/FileUploader';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import {
  Section,
  SectionField,
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import ParticipationContext, {
  IParticipationContextConfig,
} from '../participationContext';
import Warning from 'components/UI/Warning';
import Outlet from 'components/Outlet';
import Link from 'utils/cl-router/Link';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { getLocalized } from 'utils/i18n';
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
import {
  projectFilesStream,
  addProjectFile,
  deleteProjectFile,
} from 'services/projectFiles';
import {
  projectImagesStream,
  addProjectImage,
  deleteProjectImage,
} from 'services/projectImages';
import { areasStream } from 'services/areas';
import { localeStream } from 'services/locale';
import { currentAppConfigurationStream } from 'services/appConfiguration';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// utils
import { convertUrlToUploadFileObservable } from 'utils/fileTools';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { IOption, Locale, Multiloc, UploadFile } from 'typings';
import { isNilOrError } from 'utils/helperUtils';
import { INewProjectCreatedEvent } from '../../all/CreateProject';

const timeout = 350;

const StyledForm = styled.form`
  width: 500px;
`;

const StyledInputMultiloc = styled(InputMultilocWithLocaleSwitcher)`
  width: 497px;
`;

const ProjectType = styled.div`
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;

  &:first-letter {
    text-transform: uppercase;
  }
`;

const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;

const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-top: 2px;
`;

const ParticipationContextWrapper = styled.div`
  width: 497px;
  position: relative;
  padding: 30px;
  padding-bottom: 15px;
  margin-top: 8px;
  display: inline-block;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
  transition: opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  ::before,
  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  ::after {
    top: -20px;
    left: 25px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 24px;
    border-color: transparent transparent #ddd transparent;
    border-width: 11px;
  }

  &.participationcontext-enter {
    opacity: 0;

    &.participationcontext-enter-active {
      opacity: 1;
    }
  }

  &.participationcontext-exit {
    opacity: 1;

    &.participationcontext-exit-active {
      opacity: 0;
    }
  }
`;

const StyledFileUploader = styled(FileUploader)`
  width: 500px;
`;

const StyledMultipleSelect = styled(MultipleSelect)`
  width: 500px;
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 15px;
`;

const StyledInput = styled(Input)`
  margin-bottom: 20px;
`;

const SlugPreview = styled.div`
  margin-bottom: 20px;
  font-size: ${fontSizes.base}px;
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
    const initialState: IProjectFormState = {
      processing: false,
      project: undefined,
      publicationStatus: 'draft',
      projectType: 'timeline',
      projectAttributesDiff: {
        admin_publication_attributes: {
          publication_status: 'draft',
        },
      },
      projectHeaderImage: null,
      presentationMode: 'card',
      projectImages: [],
      projectImagesToRemove: [],
      projectFiles: [],
      projectFilesToRemove: [],
      titleError: null,
      apiErrors: {},
      saved: false,
      areas: [],
      areaType: 'all',
      locale: 'en',
      currentTenant: null,
      areasOptions: [],
      submitState: 'disabled',
      slug: null,
      showSlugErrorMessage: false,
    };

    this.state = initialState;

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

    this.subscriptions = [
      combineLatest(locale$, currentTenant$, areas$, project$).subscribe(
        ([locale, currentTenant, areas, project]) => {
          this.setState((state) => {
            const publicationStatus = project
              ? project.data.attributes.publication_status
              : state.publicationStatus;
            const projectType = project
              ? project.data.attributes.process_type
              : state.projectType;
            const areaType =
              project && project.data.relationships.areas.data.length > 0
                ? 'selection'
                : 'all';
            const areasOptions = areas.data.map((area) => ({
              value: area.id,
              label: getLocalized(
                area.attributes.title_multiloc,
                locale,
                currentTenant.data.attributes.settings.core.locales
              ),
            }));
            const slug = project ? project.data.attributes.slug : null;

            const newState: IProjectFormState = {
              ...state,
              locale,
              currentTenant,
              project,
              publicationStatus,
              projectType,
              areaType,
              areasOptions,
              slug,
              presentationMode:
                (project && project.data.attributes.presentation_mode) ||
                state.presentationMode,
              areas: areas.data,
              projectAttributesDiff: {
                admin_publication_attributes: {
                  publication_status: publicationStatus,
                },
              },
            };

            if (project && this.props.isProjectFoldersEnabled) {
              newState.folder_id = project.data.attributes.folder_id;
            }

            return newState;
          });
        }
      ),

      project$
        .pipe(
          switchMap((project) => {
            if (project) {
              const headerUrl = project.data.attributes.header_bg.large;
              const projectHeaderImage$ = headerUrl
                ? convertUrlToUploadFileObservable(headerUrl, null, null)
                : of(null);

              const projectFiles$ = project
                ? projectFilesStream(project.data.id).observable.pipe(
                    switchMap((projectFiles) => {
                      if (
                        projectFiles &&
                        projectFiles.data &&
                        projectFiles.data.length > 0
                      ) {
                        return combineLatest(
                          projectFiles.data.map((projectFile) => {
                            const url = projectFile.attributes.file.url;
                            const filename = projectFile.attributes.name;
                            const id = projectFile.id;
                            return convertUrlToUploadFileObservable(
                              url,
                              id,
                              filename
                            );
                          })
                        );
                      }

                      return of([]);
                    })
                  )
                : of([]);

              const projectImages$ = project
                ? projectImagesStream(project.data.id).observable.pipe(
                    switchMap((projectImages) => {
                      if (
                        projectImages &&
                        projectImages.data &&
                        projectImages.data.length > 0
                      ) {
                        return combineLatest(
                          projectImages.data
                            .filter((projectImage) => {
                              return !!(
                                projectImage.attributes.versions &&
                                projectImage.attributes.versions.large
                              );
                            })
                            .map((projectImage) => {
                              const url = projectImage.attributes.versions
                                .large as string;
                              return convertUrlToUploadFileObservable(
                                url,
                                projectImage.id,
                                null
                              );
                            })
                        );
                      }

                      return of([]);
                    })
                  )
                : of([]);

              return combineLatest(
                this.processing$,
                projectHeaderImage$,
                projectFiles$,
                projectImages$
              ).pipe(
                rxFilter(([processing]) => !processing),
                map(
                  ([
                    _processing,
                    projectHeaderImage,
                    projectFiles,
                    projectImages,
                  ]) => ({
                    projectHeaderImage,
                    projectFiles,
                    projectImages,
                  })
                )
              );
            }

            return of({
              projectHeaderImage: null,
              projectFiles: [],
              projectImages: [],
            });
          })
        )
        .subscribe(({ projectHeaderImage, projectFiles, projectImages }) => {
          this.setState({
            projectFiles: projectFiles
              ? (projectFiles.filter(
                  (file) => !isNilOrError(file)
                ) as UploadFile[])
              : [],
            projectImages: projectImages
              ? (projectImages.filter(
                  (image) => !isNilOrError(image)
                ) as UploadFile[])
              : [],
            projectHeaderImage: projectHeaderImage
              ? [projectHeaderImage]
              : null,
          });
        }),

      this.processing$.subscribe((processing) => {
        this.setState({ processing });
      }),
    ];
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

  handleTitleMultilocOnChange = (titleMultiloc: Multiloc, locale: Locale) => {
    this.setState(({ titleError, projectAttributesDiff }) => ({
      submitState: 'enabled',
      titleError: {
        ...titleError,
        [locale]: null,
      },
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
      titleError: !titleError || isEmpty(titleError) ? null : titleError,
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
                maxImageFileSize={5000000}
                maxNumberOfImages={1}
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
                maxImageFileSize={5000000}
                maxNumberOfImages={1}
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
