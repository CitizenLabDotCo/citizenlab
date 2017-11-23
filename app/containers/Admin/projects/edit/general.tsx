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
import MultipleSelect from 'components/UI/MultipleSelect';
import FieldWrapper from 'components/admin/FieldWrapper';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// i18n
import { getLocalized } from 'utils/i18n';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from '../messages';

// services
import {
  IUpdatedProjectProperties,
  IProject,
  IProjectData,
  projectBySlugStream,
  addProject,
  updateProject,
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
import { ImageFile } from 'react-dropzone';
import { API, IOption, IRelationship } from 'typings.d';

const FormWrapper = styled.form`
  img {
    max-width: 100%;
  }
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

/*
interface IUploadedImage {
  id: string;
  file: ImageFile;
}
*/

interface State {
  loading: boolean;
  projectData: IProjectData | null;
  projectAttributesDiff: IUpdatedProjectProperties;
  headerBg: File[] | ImageFile[] | null;
  oldProjectImages: ImageFile[] | null;
  newProjectImages: ImageFile[] | null;
  errors: { [fieldName: string]: API.Error[] };
  saved: boolean;
  areas: IAreaData[];
  areaType: 'all' | 'selection';
  locale: string | null;
  currentTenant: ITenant | null;
  areasOptions: IOption[];
}

class AdminProjectEditGeneral extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  slug$: Rx.BehaviorSubject<string | null> | null;
  subscriptions: Rx.Subscription[] = [];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      loading: false,
      projectData: null,
      projectAttributesDiff: {},
      headerBg: null,
      oldProjectImages: null,
      newProjectImages: null,
      errors: {},
      saved: false,
      areas: [],
      areaType: 'all',
      locale: null,
      currentTenant: null,
      areasOptions: [],
    };
    this.slug$ = null;
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const areas$ = areasStream().observable;

    this.slug$ = new Rx.BehaviorSubject(this.props.params.slug || null);

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

            return Rx.Observable.combineLatest(
              convertUrlToFileObservable(_.get(project, 'data.attributes.header_bg.large')),
              projectImages$.switchMap((projectImages) => {
                if (projectImages) {
                  return Rx.Observable.combineLatest(
                    projectImages.data.map((projectImage) => {
                      return convertUrlToFileObservable(projectImage.attributes.versions.large).map((projectImageFile) => {
                        projectImageFile['projectImageId'] = projectImage.id;
                        return projectImageFile;
                      });
                    })
                  );
                }

                return Rx.Observable.of(null);
              }),
            ).map(([headerBg, projectImages]) => ({
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
      ).subscribe(async ([locale, currentTenant, areas, { headerBg, oldProjectImages, projectData }]) => {
        this.setState({
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
        });
      })
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

  changeTitle = (value: string): void => {
    const newVal = _.set({}, `projectAttributesDiff.title_multiloc.${this.state.locale}`, value);
    this.setState(_.merge({}, this.state, newVal));
  }

  handleHeaderOnAdd = (newHeader: ImageFile) => {    
    this.setState((state: State) => ({
      projectAttributesDiff: {
        ...state.projectAttributesDiff,
        header_bg: newHeader.preview
      },
      headerBg: [newHeader]
    }));
  }

  handleHeaderOnUpdate = (updatedHeaders: ImageFile[]) => {
    this.setState((state: State) => ({
      projectAttributesDiff: {
        ...state.projectAttributesDiff,
        header_bg: (updatedHeaders && updatedHeaders.length > 0 ? updatedHeaders[0].preview : null)
      },
      headerBg: (updatedHeaders && updatedHeaders.length > 0 ? updatedHeaders : null)
    }));
  }

  handleHeaderOnRemove = async (removedHeader: ImageFile) => {
    this.setState((state: State) => ({
      projectAttributesDiff: {
        ...state.projectAttributesDiff,
        header_bg: null
      },
      headerBg: null
    }));
  }

  handleProjectImageOnAdd = (newProjectImage: ImageFile) => {
    this.setState((state: State) => {
      return {
        newProjectImages: [
          ...(state.newProjectImages || []),
          newProjectImage
        ]
      };
    });
  }

  handleProjectImagesOnUpdate = (newProjectImages: ImageFile[]) => {
    this.setState({ newProjectImages });
  }

  handleProjectImageOnRemove = async (removedImageFile: ImageFile) => {
    const newProjectImages = _(this.state.newProjectImages).filter(projectImage => projectImage.preview !== removedImageFile.preview).value();
    this.setState({ newProjectImages });
  }

  handleAreaTypeChange = (value) => {
    const newState = { areaType: value } as State;

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
    this.setState({ projectAttributesDiff: newDiff });
  }

  saveProject = async (event) => {
    event.preventDefault();

    const { projectAttributesDiff, projectData, oldProjectImages, newProjectImages } = this.state;

    if (!_.isEmpty(projectAttributesDiff)) {
      try {
        this.setState({ loading: true, saved: false });

        let projectId: string | null = null;
        const imagesToAdd = _(newProjectImages).filter(newProjectImage => !_(oldProjectImages).some(oldProjectImage => oldProjectImage.preview === newProjectImage.preview)).value();
        const imagesToRemove = _(oldProjectImages).filter(oldProjectImage => !_(newProjectImages).some(newProjectImage => newProjectImage.preview === oldProjectImage.preview)).value();

        if (projectData) {
          await updateProject(projectData.id, projectAttributesDiff);
          projectId = projectData.id;
        } else {
          const project = await addProject(projectAttributesDiff);
          projectId = project.data.id;
        }

        const imagesToAddPromises: Promise<any>[] = _(imagesToAdd).map(imageToAdd => addProjectImage(projectId, imageToAdd.preview)).value();
        const imagesToRemovePromises: Promise<any>[] = _(imagesToRemove).map(imageToRemove => deleteProjectImage(projectId, imageToRemove['projectImageId'])).value();
        await Promise.all([...imagesToAddPromises, ...imagesToRemovePromises]);

        // browserHistory.push(`/admin/projects/${project.data.attributes.slug}/edit`);

        this.setState({ loading: false, saved: true });

      } catch (errors) {
        this.setState({ errors: errors.json.errors });
      }
    }
  }

  render() {
    const { currentTenant, locale, errors, saved, projectData, headerBg, newProjectImages, loading, projectAttributesDiff } = this.state;
    const { formatMessage } = this.props.intl;

    if (!loading && currentTenant && locale) {
      const newProjectImageFiles = (newProjectImages && newProjectImages.length > 0 ? newProjectImages : null);
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const projectAttrs = { ...(projectData ? projectData.attributes : {}), ...projectAttributesDiff } as IUpdatedProjectProperties;
      projectAttrs.area_ids = projectAttrs.area_ids || (projectData && projectData.relationships.areas.data.map((area) => (area.id))) || [];
      const projectTitle = getLocalized(projectAttrs.title_multiloc as any, locale, currentTenantLocales);
      const submitState = getSubmitState({ errors, saved, diff: projectAttributesDiff });
      const areasValues = projectAttrs.area_ids ? projectAttrs.area_ids.map((id) => {
        const option = this.state.areasOptions.find(areaOption => areaOption.value === id);
        return (option ? option : null);
      }) : null;

      console.log(newProjectImageFiles);

      return (
        <FormWrapper className="e2e-project-general-form" onSubmit={this.saveProject}>
          <FieldWrapper>
            <label htmlFor="project-title">
              <FormattedMessage {...messages.titleLabel} />
            </label>
            <Input
              id="project-title"
              type="text"
              placeholder=""
              value={projectTitle}
              error=""
              onChange={this.changeTitle}
              setRef={this.setRef}
            />
            <Error fieldName="title_multiloc" apiErrors={this.state.errors.title_multiloc} />
          </FieldWrapper>

          <FieldWrapper>
            <label htmlFor="project-area">
              <FormattedMessage {...messages.areasLabel} />
            </label>
            <Radio onChange={this.handleAreaTypeChange} currentValue={this.state.areaType} value="all" name="areas" id="areas-all" label={formatMessage(messages.areasAllLabel)} />
            <Radio onChange={this.handleAreaTypeChange} currentValue={this.state.areaType} value="selection" name="areas" id="areas-selection" label={formatMessage(messages.areasSelectionLabel)} />

            {this.state.areaType === 'selection' &&
              <MultipleSelect
                options={this.state.areasOptions}
                value={_.compact(areasValues)}
                onChange={this.handleAreaSelectionChange}
                placeholder=""
                disabled={this.state.areaType !== 'selection'}
              />
            }
          </FieldWrapper>

          <FieldWrapper>
            <label>
              <FormattedMessage {...messages.headerImageLabel} />
            </label>
            <ImagesDropzone
              images={headerBg}
              imagePreviewRatio={120 / 480}
              acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
              maxImageFileSize={5000000}
              maxNumberOfImages={1}
              maxImagePreviewWidth="480px"
              onAdd={this.handleHeaderOnAdd}
              onUpdate={this.handleHeaderOnUpdate}
              onRemove={this.handleHeaderOnRemove}
            />
          </FieldWrapper>

          <FieldWrapper>
            <label>
              <FormattedMessage {...messages.projectImageLabel} />
            </label>
            <ImagesDropzone
              images={newProjectImageFiles}
              imagePreviewRatio={1}
              maxImagePreviewWidth="150px"
              acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
              maxImageFileSize={5000000}
              maxNumberOfImages={5}
              onAdd={this.handleProjectImageOnAdd}
              onUpdate={this.handleProjectImagesOnUpdate}
              onRemove={this.handleProjectImageOnRemove}
            />
          </FieldWrapper>

          <SubmitWrapper
            loading={loading}
            status={submitState}
            messages={{
              buttonSave: messages.saveProject,
              buttonError: messages.saveError,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />
        </FormWrapper>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(AdminProjectEditGeneral);
