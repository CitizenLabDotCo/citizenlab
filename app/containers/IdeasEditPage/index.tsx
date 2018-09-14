import React, { PureComponent } from 'react';
import { isString, isEmpty, get } from 'lodash-es';
import { Subscription, Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, first } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

// router
import clHistory from 'utils/cl-router/history';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';
import Footer from 'components/Footer';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { ideaByIdStream, updateIdea } from 'services/ideas';
import { ideaImageStream, addIdeaImage, deleteIdeaImage } from 'services/ideaImages';
import { projectByIdStream, IProject } from 'services/projects';
import { topicByIdStream, ITopic } from 'services/topics';
import { hasPermission } from 'services/permissions';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// utils
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToFileObservable } from 'utils/imageTools';
import { convertToGeoJson } from 'utils/locationTools';

// typings
import { IOption, ImageFile, Multiloc, Locale } from 'typings';

// style
import { media, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// resource components
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';

const Container = styled.div`
  background: #f9f9fa;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-bottom: 100px;
  padding-right: 30px;
  padding-left: 30px;
  margin-left: auto;
  margin-right: auto;

  ${media.smallerThanMaxTablet`
    padding-bottom: 80px;
  `}
`;

const Title = styled.h1`
  width: 100%;
  color: #333;
  font-size: ${fontSizes.xxxxl}px;
  line-height: 42px;
  font-weight: 500;
  text-align: center;
  padding-top: 40px;
  margin-bottom: 40px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const SaveButton = styled(Button)`
  margin-right: 10px;
`;

interface Props {
  params: {
    ideaId: string;
  };
  remoteIdeaFiles: GetResourceFileObjectsChildProps;
}

interface State {
  locale: Locale;
  ideaSlug: string | null;
  titleMultiloc: Multiloc | null;
  descriptionMultiloc: Multiloc | null;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  location: string;
  imageFile: ImageFile[] | null;
  imageId: string | null;
  submitError: boolean;
  loaded: boolean;
  processing: boolean;
}

class IdeaEditPage extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: 'en',
      ideaSlug: null,
      titleMultiloc: null,
      descriptionMultiloc: null,
      selectedTopics: null,
      selectedProject: null,
      location: '',
      imageFile: null,
      imageId: null,
      submitError: false,
      loaded: false,
      processing: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { ideaId } = this.props.params;
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.pipe(
      map(currentTenant => currentTenant.data.attributes.settings.core.locales)
    );
    const idea$ = ideaByIdStream(ideaId).observable;
    const ideaWithRelationships$ = combineLatest(
      locale$,
      currentTenantLocales$,
      idea$
    ).pipe(
      switchMap(([locale, currentTenantLocales, idea]) => {
        const ideaId = idea.data.id;
        const ideaImages = idea.data.relationships.idea_images.data;
        const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);

        const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable.pipe(
          first(),
          switchMap((ideaImage) => {
            if (ideaImage && ideaImage.data) {
              const ideaImageFile$ = convertUrlToFileObservable(ideaImage.data.attributes.versions.large);
              return ideaImageFile$.pipe(
                map((ideaImageFile) => ({
                  file: ideaImageFile,
                  id: ideaImage.data.id
                }))
              );
            }

            return of(null);
        })) : of(null));

        const granted$ = hasPermission({
          item: idea.data,
          action: 'edit',
          context: idea.data
        });

        let project$: Observable<null | IProject> = of(null);
        let topics$: Observable<null | ITopic[]> = of(null);

        if (idea.data.relationships.project && idea.data.relationships.project.data) {
          project$ = projectByIdStream(idea.data.relationships.project.data.id).observable;
        }

        if ((idea.data.relationships.topics && idea.data.relationships.topics.data && idea.data.relationships.topics.data.length > 0)) {
          topics$ = combineLatest(
            idea.data.relationships.topics.data.map(topic => topicByIdStream(topic.id).observable)
          );
        }

        const selectedProject$ = project$.pipe(map((project) => {
          if (project) {
            return {
              value: project.data.id,
              label: getLocalized(project.data.attributes.title_multiloc, locale, currentTenantLocales)
            };
          }

          return null;
        }));

        const selectedTopics$ = topics$.pipe(map((topics) => {
          if (topics && topics.length > 0) {
            return topics.map((topic) => {
              return {
                value: topic.data.id,
                label: getLocalized(topic.data.attributes.title_multiloc, locale, currentTenantLocales)
              };
            });
          }

          return null;
        }));

        return combineLatest(
          locale$,
          idea$,
          ideaImage$,
          selectedProject$,
          selectedTopics$,
          granted$
        );
      })
    );

    this.subscriptions = [
      ideaWithRelationships$.subscribe(([locale, idea, ideaImage, selectedProject, selectedTopics, granted]) => {
        if (granted) {
          this.setState({
            locale,
            selectedTopics,
            selectedProject,
            loaded: true,
            ideaSlug: idea.data.attributes.slug,
            titleMultiloc: idea.data.attributes.title_multiloc,
            descriptionMultiloc: idea.data.attributes.body_multiloc,
            location: idea.data.attributes.location_description,
            imageFile: (ideaImage && ideaImage.file ? [ideaImage.file] : null),
            imageId: (ideaImage && ideaImage.id ? ideaImage.id : null)
          });
        } else {
          clHistory.push('/');
        }
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnSaveButtonClick = () => {
    eventEmitter.emit('IdeasEditPage', 'IdeaFormSubmitEvent', null);
  }

  // getFilesToAddPromises = (output: ) => {
  //   const { localIdeaFiles } = this.state;
  //   const localPageFiles = [...local_page_files];
  //   const { page, remotePageFiles } = this.props;
  //   const pageId = !isNilOrError(page) ? page.id : null;
  //   let filesToAdd = localPageFiles;
  //   let filesToAddPromises: Promise<any>[] = [];

  //   if (!isNilOrError(localPageFiles) && Array.isArray(remotePageFiles)) {
  //     // localPageFiles = local state of files
  //     // This means those previously uploaded + files that have been added/removed
  //     // remotePageFiles = last saved state of files (remote)

  //     filesToAdd = localPageFiles.filter((localPageFile) => {
  //       return !remotePageFiles.some(remotePageFile => remotePageFile.filename === localPageFile.filename);
  //     });
  //   }

  //   if (pageId && !isNilOrError(filesToAdd) && filesToAdd.length > 0) {
  //     filesToAddPromises = filesToAdd.map((fileToAdd: any) => addPageFile(pageId as string, fileToAdd.base64, fileToAdd.name));
  //   }

  //   return filesToAddPromises;
  // }

  // getFilesToRemovePromises = (values: FormValues) => {
  //   const { local_page_files } = values;
  //   const localPageFiles = [...local_page_files];
  //   const { page, remotePageFiles } = this.props;
  //   const pageId = !isNilOrError(page) ? page.id : null;
  //   let filesToRemove = remotePageFiles;
  //   let filesToRemovePromises: Promise<any>[] = [];

  //   if (!isNilOrError(localPageFiles) && Array.isArray(remotePageFiles)) {
  //     // localPageFiles = local state of files
  //     // This means those previously uploaded + files that have been added/removed
  //     // remotePageFiles = last saved state of files (remote)

  //     filesToRemove = remotePageFiles.filter((remotePageFile) => {
  //       return !localPageFiles.some(localPageFile => localPageFile.filename === remotePageFile.filename);
  //     });
  //   }

  //   if (pageId && !isNilOrError(filesToRemove) && filesToRemove.length > 0) {
  //     filesToRemovePromises = filesToRemove.map((fileToRemove: any) => deletePageFile(pageId as string, fileToRemove.id));
  //   }

  //   return filesToRemovePromises;
  // }

  handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const { ideaId } = this.props.params;
    const { locale, titleMultiloc, descriptionMultiloc, ideaSlug, imageId } = this.state;
    const { title, description, selectedTopics, position, localIdeaFiles } = ideaFormOutput;
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const locationGeoJSON = (isString(position) && !isEmpty(position) ? await convertToGeoJson(position) : null);
    const locationDescription = (isString(position) && !isEmpty(position) ? position : null);
    const oldImageId = imageId;
    const oldBase64Image = get(this.state, 'imageFile[0].base64');
    const newBase64Image = get(ideaFormOutput, 'imageFile[0].base64');
    const filesToAddPromises: Promise<any>[] = this.getFilesToAddPromises(localIdeaFiles);
    const filesToRemovePromises: Promise<any>[] = this.getFilesToRemovePromises(localIdeaFiles);
    this.setState({ processing: true, submitError: false });

    try {
      if (newBase64Image !== oldBase64Image) {
        if (oldImageId) {
          await deleteIdeaImage(ideaId, oldImageId);
        }

        if (newBase64Image) {
          await addIdeaImage(ideaId, newBase64Image, 0);
        }
      }

      await updateIdea(ideaId, {
        title_multiloc: {
          ...titleMultiloc,
          [locale]: title
        },
        body_multiloc: {
          ...descriptionMultiloc,
          [locale]: description
        },
        topic_ids: topicIds,
        location_point_geojson: locationGeoJSON,
        location_description: locationDescription
      });

      clHistory.push(`/ideas/${ideaSlug}`);
    } catch {
      this.setState({ processing: false, submitError: true });
    }
  }

  render() {

    if (this.state && this.state.loaded) {
      const { remoteIdeaFiles } = this.props;
      const {
        locale,
        titleMultiloc,
        descriptionMultiloc,
        selectedTopics,
        selectedProject,
        location,
        imageFile,
        submitError,
        processing,
      } = this.state;
      const title = locale && titleMultiloc ? titleMultiloc[locale] || '' : '';
      const description = (locale && descriptionMultiloc ? descriptionMultiloc[locale] || '' : null);
      const submitErrorMessage = (submitError ? <FormattedMessage {...messages.submitError} /> : null);

      return (
        <Container>
          <FormContainer>
            <Title>
              <FormattedMessage {...messages.formTitle} />
            </Title>

            <IdeaForm
              title={title}
              description={description}
              selectedTopics={selectedTopics}
              selectedProject={selectedProject}
              position={location}
              imageFile={imageFile}
              onSubmit={this.handleIdeaFormOutput}
              remoteIdeaFiles={!isNilOrError(remoteIdeaFiles) ? remoteIdeaFiles : null}
            />

            <ButtonWrapper>
              <SaveButton
                size="2"
                processing={processing}
                text={<FormattedMessage {...messages.save} />}
                onClick={this.handleOnSaveButtonClick}
              />
              <Error text={submitErrorMessage} marginTop="0px" />
            </ButtonWrapper>
          </FormContainer>

          <Footer showCityLogoSection={false} />
        </Container>
      );
    }

    return null;
  }
}

export default ((props: Props) => (
  <GetResourceFileObjects resourceId={props.params.ideaId} resourceType="idea">
    {remoteIdeaFiles => <IdeaEditPage {...props} remoteIdeaFiles={remoteIdeaFiles} />}
  </GetResourceFileObjects>
));
