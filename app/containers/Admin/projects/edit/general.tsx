import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// router
import { browserHistory } from 'react-router';

// components
import Input from 'components/UI/Input';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Error from 'components/UI/Error';
import Radio from 'components/UI/Radio';
import Label from 'components/UI/Label';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';
import ParticipationContext, { IParticipationContextConfig } from './parcticipationContext';
import { Button as SemButton, Icon as SemIcon } from 'semantic-ui-react';

// animation
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// i18n
import { getLocalized } from 'utils/i18n';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import {
  IUpdatedProjectProperties,
  IProjectData,
  projectBySlugStream,
  addProject,
  updateProject,
  deleteProject,
} from 'services/projects';
import { projectImagesStream, addProjectImage, deleteProjectImage } from 'services/projectImages';
import { areasStream, IAreaData } from 'services/areas';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import eventEmitter from 'utils/eventEmitter';

// utils
import { convertUrlToFileObservable } from 'utils/imageTools';

// style
import styled from 'styled-components';

// typings
import { API, IOption, ImageFile, Locale } from 'typings';

const timeout = 350;

const TitleInput = styled(Input)`
  width: 497px;
`;

const ProjectType = styled.div`
  color: #333;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
`;

const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-top: 2px;
  padding-right: 100px;
`;

const ParticipationContextWrapper = styled.div`
  width: 497px;
  position: relative;
  padding: 30px;
  padding-bottom: 15px;
  margin-top: 8px;
  display: inline-block;
  border-radius: 5px;
  border: solid 1px #ddd;
  background: #fff;
  transition: opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: opacity;

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

type Props = {
  lang: string,
  params: {
    slug: string,
  }
};

interface State {
  loading: boolean;
  processing: boolean;
  projectData: IProjectData | null;
  projectType: 'continuous' | 'timeline';
  projectAttributesDiff: IUpdatedProjectProperties;
  headerBg: ImageFile[] | null;
  presentationMode: 'map' | 'card';
  oldProjectImages: ImageFile[] | null;
  newProjectImages: ImageFile[] | null;
  noTitleError: string | null;
  apiErrors: { [fieldName: string]: API.Error[] };
  saved: boolean;
  areas: IAreaData[];
  areaType: 'all' | 'selection';
  locale: Locale;
  currentTenant: ITenant | null;
  areasOptions: IOption[];
  submitState: 'disabled' | 'enabled' | 'error' | 'success';
  deleteError: string | null;
}

class AdminProjectEditGeneral extends React.PureComponent<Props & InjectedIntlProps, State> {
  slug$: Rx.BehaviorSubject<string | null> | null;
  processing$: Rx.BehaviorSubject<boolean>;
  subscriptions: Rx.Subscription[] = [];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      loading: true,
      processing: false,
      projectData: null,
      projectType: 'timeline',
      projectAttributesDiff: {},
      headerBg: null,
      presentationMode: 'map',
      oldProjectImages: null,
      newProjectImages: null,
      noTitleError: null,
      apiErrors: {},
      saved: false,
      areas: [],
      areaType: 'all',
      locale: 'en',
      currentTenant: null,
      areasOptions: [],
      submitState: 'disabled',
      deleteError: null,
    };
    this.slug$ = null;
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const areas$ = areasStream().observable;

    this.slug$ = new Rx.BehaviorSubject(this.props.params.slug || null);
    this.processing$ = new Rx.BehaviorSubject(false);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        areas$,
        this.slug$.distinctUntilChanged().switchMap((slug) => {
          return (slug ? projectBySlugStream(slug).observable : Rx.Observable.of(null));
        }).switchMap((project) => {
          if (project) {
            const projectImages$ = (project ? projectImagesStream(project.data.id).observable : Rx.Observable.of(null));
            const headerUrl = _.get(project, 'data.attributes.header_bg.large');
            const headerImageFileObservable = (headerUrl ? convertUrlToFileObservable(headerUrl) : Rx.Observable.of(null));

            return Rx.Observable.combineLatest(
              this.processing$,
              headerImageFileObservable,
              projectImages$.switchMap((projectImages) => {
                if (projectImages && projectImages.data && projectImages.data.length > 0) {
                  return Rx.Observable.combineLatest(
                    projectImages.data.map((projectImage) => {
                      return convertUrlToFileObservable(projectImage.attributes.versions.large).map((projectImageFile) => {
                        projectImageFile && (projectImageFile['projectImageId'] = projectImage.id);
                        return projectImageFile;
                      });
                    })
                  );
                }

                return Rx.Observable.of(null);
              }),
            ).filter(([processing]) => {
              return !processing;
            }).map(([_processing, headerBg, projectImages]) => ({
              headerBg,
              oldProjectImages: projectImages,
              projectData: (project ? project.data : null)
            }));
          }

          return Rx.Observable.of({
            headerBg: null,
            oldProjectImages: null,
            projectData: null
          });
        })
      ).subscribe(([locale, currentTenant, areas, { headerBg, oldProjectImages, projectData }]) => {
        this.setState((state) => {
          const projectType = (projectData ? projectData.attributes.process_type : state.projectType);
          const areaType =  ((projectData && projectData.relationships.areas.data.length > 0) ? 'selection' : 'all');
          const areasOptions = areas.data.map((area) => ({
            value: area.id,
            label: getLocalized(area.attributes.title_multiloc, locale, currentTenant.data.attributes.settings.core.locales)
          }));

          return {
            locale,
            currentTenant,
            projectData,
            projectType,
            areaType,
            areasOptions,
            oldProjectImages: (oldProjectImages as ImageFile[] | null),
            newProjectImages: (oldProjectImages as ImageFile[] | null),
            headerBg: (headerBg ? [headerBg] : null),
            presentationMode: (projectData && projectData.attributes.presentation_mode || state.presentationMode),
            areas: areas.data,
            projectAttributesDiff: {},
            loading: false,
          };
        });
      }),

      this.processing$.subscribe(processing => this.setState({ processing }))
    ];
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.params.slug !== this.props.params.slug && this.slug$ !== null) {
      this.slug$.next(newProps.params.slug);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleTitleOnChange = (newTitle: string) => {
    this.setState((state) => ({
      submitState: 'enabled',
      noTitleError: null,
      projectAttributesDiff: {
        ...(state.projectAttributesDiff || {}),
        title_multiloc: {
          ..._.get(state, 'projectAttributesDiff.title_multiloc', {}),
          [state.locale as string]: newTitle
        }
      }
    }));
  }

  handleParticipationContextOnChange = (participationContextConfig: IParticipationContextConfig) => {
    this.setState((state) => {
      const { projectAttributesDiff } = state;
      const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit } = participationContextConfig;
      const newprojectAttributesDiff: IUpdatedProjectProperties = {
        ...projectAttributesDiff,
        participation_method: participationMethod,
        posting_enabled: postingEnabled,
        commenting_enabled: commentingEnabled,
        voting_enabled: votingEnabled,
        voting_method: votingMethod,
        voting_limited_max: votingLimit
      };

      return {
        submitState: 'enabled',
        projectAttributesDiff: newprojectAttributesDiff
      };
    });
  }

  handeProjectTypeOnChange = (projectType: 'continuous' | 'timeline') => {
    this.setState((state) => ({
      projectType,
      submitState: 'enabled',
      projectAttributesDiff: {
        ...(state.projectAttributesDiff || {}),
        process_type: projectType
      }
    }));
  }

  handleHeaderOnAdd = (newHeader: ImageFile) => {
    this.setState((state) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...(state.projectAttributesDiff || {}),
        header_bg: newHeader.base64
      },
      headerBg: [newHeader]
    }));
  }

  handleHeaderOnUpdate = (updatedHeaders: ImageFile[]) => {
    const headerBg = (updatedHeaders && updatedHeaders.length > 0 ? updatedHeaders : null);
    this.setState({ headerBg });
  }

  handleHeaderOnRemove = async () => {
    this.setState((state) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...(state.projectAttributesDiff || {}),
        header_bg: null
      },
      headerBg: null
    }));
  }

  handleProjectImageOnAdd = (newProjectImage: ImageFile) => {
    this.setState((state) => ({
      submitState: 'enabled',
      newProjectImages: [
        ...(state.newProjectImages || []),
        newProjectImage
      ]
    }));
  }

  handleProjectImagesOnUpdate = (newProjectImages: ImageFile[]) => {
    this.setState({ newProjectImages });
  }

  handleProjectImageOnRemove = async (removedImageFile: ImageFile) => {
    this.setState((state) => ({
      submitState: 'enabled',
      newProjectImages: (state.newProjectImages ? state.newProjectImages.filter(projectImage => projectImage.objectUrl !== removedImageFile.objectUrl) : null)
    }));
  }

  handleAreaTypeChange = (value: 'all' | 'selection') => {
    this.setState((state) => ({
      submitState: 'enabled',
      areaType: value,
      projectAttributesDiff: {
        ...(state.projectAttributesDiff || {}),
        area_ids: (value === 'all' ? [] : state.projectAttributesDiff.area_ids)
      }
    }));
  }

  handleIdeasDisplayChange = (value: 'map' | 'card') => {
    this.setState((state) => ({
      submitState: 'enabled',
      presentationMode: value,
      projectAttributesDiff: {
        ...(state.projectAttributesDiff || {}),
        presentation_mode: value
      }
    }));
  }

  handleAreaSelectionChange = (values: IOption[]) => {
    this.setState((state) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...(state.projectAttributesDiff || {}),
        area_ids: values.map((value) => (value.value))
      }
    }));
  }

  onSubmit = (event: React.FormEvent<any>) => {
    event.preventDefault();

    const { projectType, projectData } = this.state;

    // if it's a new project of type continuous
    if (!projectData && projectType === 'continuous') {
      eventEmitter.emit('AdminProjectEditGeneral', 'getParticipationContext', null);
    } else {
      this.save();
    }
  }

  handleParcticipationContextOnSubmit = (participationContextConfig: IParticipationContextConfig) => {
    this.save(participationContextConfig);
  }

  validate = () => {
    let hasErrors = false;
    const { formatMessage } = this.props.intl;
    const { projectAttributesDiff, projectData, locale, currentTenant } = this.state;
    const currentTenantLocales = (currentTenant as ITenant).data.attributes.settings.core.locales;
    const projectAttrs = { ...(projectData ? projectData.attributes : {}), ...projectAttributesDiff } as IUpdatedProjectProperties;
    const projectTitle = getLocalized(projectAttrs.title_multiloc as any, locale, currentTenantLocales);

    if (!projectTitle) {
      hasErrors = true;
      this.setState({ noTitleError: formatMessage(messages.noTitleErrorMessage) });
    }

    return !hasErrors;
  }

  save = async (participationContextConfig: IParticipationContextConfig | null = null) => {
    if (this.validate()) {
      const { formatMessage } = this.props.intl;
      let { projectAttributesDiff } = this.state;
      const { projectData, oldProjectImages, newProjectImages } = this.state;

      if (participationContextConfig) {
        const { participationMethod, postingEnabled, commentingEnabled, votingEnabled, votingMethod, votingLimit } = participationContextConfig;

        projectAttributesDiff = {
          ...projectAttributesDiff,
          participation_method: participationMethod,
          posting_enabled: postingEnabled,
          commenting_enabled: commentingEnabled,
          voting_enabled: votingEnabled,
          voting_method: votingMethod,
          voting_limited_max: votingLimit
        };
      }

      if (!_.isEmpty(projectAttributesDiff)) {
        try {
          let redirect = false;
          let projectId: string | null = null;
          const imagesToAdd = _.chain(newProjectImages).filter(newProjectImage => !_(oldProjectImages).some(oldProjectImage => oldProjectImage.base64 === newProjectImage.base64)).value();
          const imagesToRemove = _.chain(oldProjectImages).filter(oldProjectImage => !_(newProjectImages).some(newProjectImage => newProjectImage.base64 === oldProjectImage.base64)).value();

          this.setState({ saved: false });
          this.processing$.next(true);

          if (projectData) {
            projectId = projectData.id;
            await updateProject(projectData.id, projectAttributesDiff);
          } else {
            const project = await addProject(projectAttributesDiff);
            projectId = project.data.id;
            redirect = true;
          } 

          const imagesToAddPromises: Promise<any>[] = _(imagesToAdd).map(imageToAdd => addProjectImage(projectId, imageToAdd.base64)).value();
          const imagesToRemovePromises: Promise<any>[] = _(imagesToRemove).map(imageToRemove => deleteProjectImage(projectId, imageToRemove['projectImageId'])).value();

          await Promise.all([...imagesToAddPromises, ...imagesToRemovePromises]);

          if (redirect) {
            browserHistory.push(`/admin/projects`);
          } else {
            this.setState({
              saved: true,
              submitState: 'success'
            });

            this.processing$.next(false);
          }
        } catch (errors) {
          this.setState({
            apiErrors: _.has(errors, 'json.errors') ? errors.json.errors : formatMessage(messages.saveErrorMessage),
            submitState: 'error'
          });

          this.processing$.next(false);
        }
      }
    }
  }

  deleteProject = async (event) => {
    event.preventDefault();

    if (!this.state.projectData) {
      return;
    }

    if (window.confirm(this.props.intl.formatMessage(messages.deleteProjectConfirmation))) {
      try {
        await deleteProject(this.state.projectData.id);
        browserHistory.push('/admin/projects');
      } catch {
        this.setState({ deleteError: this.props.intl.formatMessage(messages.deleteProjectError) });
      }
    }
  }

  render() {
    const {
      currentTenant,
      locale,
      projectType,
      noTitleError,
      projectData,
      headerBg,
      presentationMode,
      newProjectImages,
      loading,
      processing,
      projectAttributesDiff,
      areasOptions,
      areaType,
      submitState
    } = this.state;

    if (!loading && currentTenant && locale) {
      const newProjectImageFiles = (newProjectImages && newProjectImages.length > 0 ? newProjectImages : null);
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const projectAttrs = { ...(projectData ? projectData.attributes : {}), ...projectAttributesDiff } as IUpdatedProjectProperties;
      const areaIds = projectAttrs.area_ids || (projectData && projectData.relationships.areas.data.map((area) => (area.id))) || [];
      const projectTitle = getLocalized(projectAttrs.title_multiloc as any, locale, currentTenantLocales);
      const areasValues = areaIds.filter((id) => {
        return areasOptions.some(areaOption => areaOption.value === id);
      }).map((id) => {
        return areasOptions.find(areaOption => areaOption.value === id) as IOption;
      });

      return (
        <form className="e2e-project-general-form" onSubmit={this.onSubmit}>
          <Section>
            <SectionField>
              <Label htmlFor="project-title">
                <FormattedMessage {...messages.titleLabel} />
              </Label>
              <TitleInput
                id="project-title"
                type="text"
                placeholder=""
                value={projectTitle}
                error=""
                onChange={this.handleTitleOnChange}
              />
              <Error text={noTitleError} />
              <Error fieldName="title_multiloc" apiErrors={this.state.apiErrors.title_multiloc} />
            </SectionField>

            <SectionField>
              <Label htmlFor="project-area">
                <FormattedMessage {...messages.projectType} />
              </Label>
              {!projectData ? (
                <>
                  <Radio
                    onChange={this.handeProjectTypeOnChange}
                    currentValue={projectType}
                    value="timeline"
                    name="projecttype"
                    id="projectype-timeline"
                    label={<FormattedMessage {...messages.timeline} />}
                  />
                  <Radio
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
                  <ProjectType>{projectType}</ProjectType>
                </>
              )}

              {!projectData &&
                <TransitionGroup>
                  {projectType === 'continuous' && 
                    <CSSTransition
                      classNames="participationcontext"
                      timeout={timeout}
                      enter={true}
                      exit={false}
                    >
                      <ParticipationContextWrapper>
                        <ParticipationContext 
                          onSubmit={this.handleParcticipationContextOnSubmit}
                          onChange={this.handleParticipationContextOnChange}
                        />
                      </ParticipationContextWrapper>
                    </CSSTransition>
                  }
                </TransitionGroup>
              }
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.defaultDisplay} />
              </Label>
              {['map', 'card'].map((key) => (
                <Radio
                  key={key}
                  onChange={this.handleIdeasDisplayChange}
                  currentValue={presentationMode}
                  value={key}
                  name="presentation_mode"
                  id={`presentation_mode-${key}`}
                  label={<FormattedMessage {...messages[`${key}Display`]} />}
                />
              ))}
            </SectionField>

            <SectionField>
              <Label htmlFor="project-area">
                <FormattedMessage {...messages.areasLabel} />
              </Label>
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
                label={<FormattedMessage {...messages.areasSelectionLabel} />}
              />

              {areaType === 'selection' &&
                <MultipleSelect
                  options={areasOptions}
                  value={areasValues}
                  onChange={this.handleAreaSelectionChange}
                  placeholder=""
                  disabled={areaType !== 'selection'}
                />
              }
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.headerImageLabel} />
              </Label>
              <StyledImagesDropzone
                images={headerBg}
                imagePreviewRatio={120 / 480}
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxImageFileSize={5000000}
                maxNumberOfImages={1}
                maxImagePreviewWidth="500px"
                onAdd={this.handleHeaderOnAdd}
                onUpdate={this.handleHeaderOnUpdate}
                onRemove={this.handleHeaderOnRemove}
              />
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.projectImageLabel} />
              </Label>
              <StyledImagesDropzone
                images={newProjectImageFiles}
                imagePreviewRatio={1}
                maxImagePreviewWidth="160px"
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxImageFileSize={5000000}
                maxNumberOfImages={5}
                onAdd={this.handleProjectImageOnAdd}
                onUpdate={this.handleProjectImagesOnUpdate}
                onRemove={this.handleProjectImageOnRemove}
              />
            </SectionField>

            {projectData &&
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.deleteProjectLabel} />
                </Label>
                <SemButton color="red" onClick={this.deleteProject}>
                  <SemIcon name="trash" />
                  <FormattedMessage {...messages.deleteProjectButton} />
                </SemButton>
                <Error text={this.state.deleteError} />
              </SectionField>
            }

            <SubmitWrapper
              loading={processing}
              status={submitState}
              onClick={this.onSubmit}
              messages={{
                buttonSave: messages.saveProject,
                buttonError: messages.saveError,
                buttonSuccess: messages.saveSuccess,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />
          </Section>
        </form>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(AdminProjectEditGeneral);
