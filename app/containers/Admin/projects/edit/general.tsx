import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// router
import { browserHistory } from 'react-router';

// components
import Input from 'components/UI/Input';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import Radio from 'components/UI/Radio';
import Label from 'components/UI/Label';
import MultipleSelect from 'components/UI/MultipleSelect';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

import { Button as SemButton, Icon as SemIcon } from 'semantic-ui-react';

// i18n
import { getLocalized } from 'utils/i18n';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import {
  IUpdatedProjectProperties,
  IProject,
  IProjectData,
  projectBySlugStream,
  addProject,
  updateProject,
  deleteProject,
} from 'services/projects';
import {
  IProjectImageData,
  projectImagesStream,
  addProjectImage,
  deleteProjectImage
} from 'services/projectImages';
import { areasStream, IAreaData } from 'services/areas';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';

// utils
import { convertUrlToFileObservable } from 'utils/imageTools';
import getSubmitState from 'utils/getSubmitState';
import { v4 as uuid } from 'uuid';

// style
import styled from 'styled-components';

// typings
import { API, IOption, IRelationship, ImageFile, Locale } from 'typings';

const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-top: 2px;
  padding-right: 100px;
`;

const ProjectImages = styled.div`
  display: flex;
`;

const ImageWrapper = styled.div`
  margin: .5rem;
  position: relative;

  &:first-child{
    margin-left: 0;
  }
`;

const DeleteButton = styled.button`
  background: rgba(0, 0, 0, .5);
  border-radius: 50%;
  color: black;
  right: -.5rem;
  position: absolute;
  top: -.5rem;
  z-index: 1;
`;

const SaveButton = styled.button`
  background: #d60065;
  border-radius: 5px;
  color: white;
  font-size: 1.25rem;
  padding: 1rem 2rem;
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
  projectAttributesDiff: IUpdatedProjectProperties;
  headerBg: ImageFile[] | null;
  oldProjectImages: ImageFile[] | null;
  newProjectImages: ImageFile[] | null;
  noTitleError: string | null;
  // noHeaderError: string | null;
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
  state: State;
  slug$: Rx.BehaviorSubject<string | null> | null;
  processing$: Rx.BehaviorSubject<boolean>;
  subscriptions: Rx.Subscription[] = [];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      loading: true,
      processing: false,
      projectData: null,
      projectAttributesDiff: {},
      headerBg: null,
      oldProjectImages: null,
      newProjectImages: null,
      noTitleError: null,
      // noHeaderError: null,
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
            ).filter(([processing, headerBg, projectImages]) => {
              return !processing;
            }).map(([processing, headerBg, projectImages]) => ({
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
        this.setState((state: State) => ({
          locale,
          currentTenant,
          projectData,
          oldProjectImages,
          newProjectImages: oldProjectImages,
          headerBg: (headerBg ? [headerBg] : null),
          areas: areas.data,
          areasOptions: areas.data.map((area) => ({
            value: area.id,
            label: getLocalized(area.attributes.title_multiloc, locale, currentTenant.data.attributes.settings.core.locales)
          })),
          loading: false,
          projectAttributesDiff: {},
          areaType: (projectData && projectData.relationships.areas.data.length > 0) ? 'selection' : 'all',
        }));
      }),

      this.processing$.subscribe(processing => this.setState({ processing }))
    ];
  }

  componentWillReceiveProps(newProps) {
    if (newProps.params.slug !== this.props.params.slug && this.slug$ !== null) {
      this.slug$.next(newProps.params.slug);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setRef = (element) => {
    // empty
  }

  changeTitle = (newTitle: string) => {
    this.setState((state: State) => ({
      submitState: 'enabled',
      noTitleError: null,
      projectAttributesDiff: {
        ...state.projectAttributesDiff,
        title_multiloc: {
          ...state.projectAttributesDiff.title_multiloc,
          [state.locale as string]: newTitle
        }
      }
    }));
  }

  handleHeaderOnAdd = (newHeader: ImageFile) => {
    this.setState((state: State) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...state.projectAttributesDiff,
        header_bg: newHeader.base64
      },
      headerBg: [newHeader],
      // noHeaderError: null
    }));
  }

  handleHeaderOnUpdate = (updatedHeaders: ImageFile[]) => {
    const headerBg = (updatedHeaders && updatedHeaders.length > 0 ? updatedHeaders : null);
    this.setState({ headerBg });
  }

  handleHeaderOnRemove = async (removedHeader: ImageFile) => {
    this.setState((state: State) => ({
      submitState: 'enabled',
      projectAttributesDiff: {
        ...state.projectAttributesDiff,
        header_bg: null
      },
      headerBg: null
    }));
  }

  handleProjectImageOnAdd = (newProjectImage: ImageFile) => {
    this.setState((state: State) => ({
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
    this.setState((state: State) => ({
      submitState: 'enabled',
      newProjectImages: _(state.newProjectImages).filter(projectImage => projectImage.objectUrl !== removedImageFile.objectUrl).value()
    }));
  }

  handleAreaTypeChange = (value) => {
    const newState = { areaType: value, submitState: 'enabled' } as State;

    // Clear the array of areas ids if you select "all areas"
    if (value === 'all') {
      const newDiff = _.cloneDeep(this.state.projectAttributesDiff);
      newDiff.area_ids = [];
      newState.projectAttributesDiff = newDiff;
    }

    this.setState(newState);
  }

  handleAreaSelectionChange = (values: IOption[]) => {
    const newDiff = _.cloneDeep(this.state.projectAttributesDiff);
    newDiff.area_ids = values.map((value) => (value.value));
    this.setState({ submitState: 'enabled', projectAttributesDiff: newDiff });
  }

  validate = () => {
    let hasErrors = false;
    const { formatMessage } = this.props.intl;
    const { projectAttributesDiff, projectData, headerBg, locale, currentTenant } = this.state;
    const currentTenantLocales = (currentTenant as ITenant).data.attributes.settings.core.locales;
    const projectAttrs = { ...(projectData ? projectData.attributes : {}), ...projectAttributesDiff } as IUpdatedProjectProperties;
    const areaIds = projectAttrs.area_ids || (projectData && projectData.relationships.areas.data.map((area) => (area.id))) || [];
    const projectTitle = getLocalized(projectAttrs.title_multiloc as any, locale, currentTenantLocales);

    if (!projectTitle) {
      hasErrors = true;
      this.setState({ noTitleError: formatMessage(messages.noTitleErrorMessage) });
    }

    /*
    if (!headerBg) {
      hasErrors = true;
      this.setState({ noHeaderError: formatMessage(messages.noHeaderErrorMessage) });
    }
    */

    return !hasErrors;
  }

  saveProject = async (event) => {
    event.preventDefault();

    if (this.validate()) {
      const { formatMessage } = this.props.intl;
      const { projectAttributesDiff, projectData, oldProjectImages, newProjectImages } = this.state;

      try {
        let redirect = false;
        let projectId: string | null = null;
        const imagesToAdd = _(newProjectImages).filter(newProjectImage => !_(oldProjectImages).some(oldProjectImage => oldProjectImage.base64 === newProjectImage.base64)).value();
        const imagesToRemove = _(oldProjectImages).filter(oldProjectImage => !_(newProjectImages).some(newProjectImage => newProjectImage.base64 === oldProjectImage.base64)).value();

        this.setState({ saved: false });
        this.processing$.next(true);

        if (projectData) {
          projectId = projectData.id;

          if (!_.isEmpty(projectAttributesDiff)) {
            await updateProject(projectData.id, projectAttributesDiff);
          }
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

  deleteProject = async (event) => {
    event.preventDefault();

    if (!this.state.projectData) {
      return;
    }

    if (window.confirm(this.props.intl.formatMessage(messages.deleteProjectConfirmation))) {
      deleteProject(this.state.projectData.id)
      .then((response) => {
        browserHistory.push('/admin/projects');
      })
      .catch((error) => {
        this.setState({ deleteError: this.props.intl.formatMessage(messages.deleteProjectError) });
      });
    }
  }

  render() {
    const { currentTenant, locale, noTitleError, /* noHeaderError, */ apiErrors, saved, projectData, headerBg, newProjectImages, loading, processing, projectAttributesDiff, areasOptions, areaType, submitState } = this.state;
    const { formatMessage } = this.props.intl;

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
        <form className="e2e-project-general-form" onSubmit={this.saveProject}>
          <Section>
            <SectionField>
              <Label htmlFor="project-title">
                <FormattedMessage {...messages.titleLabel} />
              </Label>
              <Input
                id="project-title"
                type="text"
                placeholder=""
                value={projectTitle}
                error=""
                onChange={this.changeTitle}
                setRef={this.setRef}
              />
              <Error text={noTitleError} />
              <Error fieldName="title_multiloc" apiErrors={this.state.apiErrors.title_multiloc} />
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
                label={formatMessage(messages.areasAllLabel)}
              />
              <Radio
                onChange={this.handleAreaTypeChange}
                currentValue={areaType}
                value="selection"
                name="areas"
                id="areas-selection"
                label={formatMessage(messages.areasSelectionLabel)}
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
              {/* <Error text={noHeaderError} /> */}
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

            {this.state.projectData &&
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
