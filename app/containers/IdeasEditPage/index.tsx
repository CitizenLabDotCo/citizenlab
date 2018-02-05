import * as React from 'react';
import { isString, isEmpty, get } from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { browserHistory } from 'react-router';

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
import { authUserStream } from 'services/auth';
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
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div`
  background: #f6f6f6;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: 'flex';
  flex-direction: column;
  align-items: center;
  padding-bottom: 100px;
  padding-right: 30px;
  padding-left: 30px;
  margin-left: auto;
  margin-right: auto;

  ${media.smallerThanMaxTablet`
    padding-bottom: 80px;
  `}
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 36px;
  line-height: 42px;
  font-weight: 500;
  text-align: center;
  padding-top: 40px;
  margin-bottom: 40px;
`;

const ButtonWrapper = styled.div`
  display: flex;
`;

const SaveButton = styled(Button)`
  margin-right: 10px;
`;

interface Props {
  params: {
    ideaId: string;
  };
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

export default class IdeaEditPage extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

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
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
    const idea$ = ideaByIdStream(ideaId).observable;
    const ideaWithRelationships$ = Rx.Observable.combineLatest(
      locale$,
      currentTenantLocales$,
      idea$
    ).switchMap(([locale, currentTenantLocales, idea]) => {
      const ideaId = idea.data.id;
      const ideaImages = idea.data.relationships.idea_images.data;
      const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);

      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable.first().switchMap((ideaImage) => {
        if (ideaImage && ideaImage.data) {
          const ideaImageFile$ = convertUrlToFileObservable(ideaImage.data.attributes.versions.large);
          return ideaImageFile$.map((ideaImageFile) => ({
            file: ideaImageFile,
            id: ideaImage.data.id
          }));
        }

        return Rx.Observable.of(null);
      }) : Rx.Observable.of(null));

      const granted$ = authUser$.switchMap((authUser) => {
        return hasPermission({
          item: idea.data,
          action: 'edit',
          user: (authUser || undefined),
          context: idea.data
        });
      });

      let project$: Rx.Observable<null | IProject> = Rx.Observable.of(null);
      let topics$: Rx.Observable<null | ITopic[]> = Rx.Observable.of(null);

      if (idea.data.relationships.project && idea.data.relationships.project.data) {
        project$ = projectByIdStream(idea.data.relationships.project.data.id).observable;
      }

      if ((idea.data.relationships.topics && idea.data.relationships.topics.data && idea.data.relationships.topics.data.length > 0)) {
        topics$ = Rx.Observable.combineLatest(
          idea.data.relationships.topics.data.map(topic => topicByIdStream(topic.id).observable)
        );
      }

      const selectedProject$ = project$.map((project) => {
        if (project) {
          return {
            value: project.data.id,
            label: getLocalized(project.data.attributes.title_multiloc, locale, currentTenantLocales)
          };
        }

        return null;
      });

      const selectedTopics$ = topics$.map((topics) => {
        if (topics && topics.length > 0) {
          return topics.map((topic) => {
            return {
              value: topic.data.id,
              label: getLocalized(topic.data.attributes.title_multiloc, locale, currentTenantLocales)
            };
          });
        }

        return null;
      });

      return Rx.Observable.combineLatest(
        locale$,
        idea$,
        ideaImage$,
        selectedProject$,
        selectedTopics$,
        granted$
      );
    });

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
          browserHistory.push(`/`);
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

  handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const { ideaId } = this.props.params;
    const { locale, titleMultiloc, descriptionMultiloc, ideaSlug, imageId } = this.state;
    const { title, description, selectedTopics, position } = ideaFormOutput;
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const locationGeoJSON = (isString(position) && !isEmpty(position) ? await convertToGeoJson(position) : null);
    const locationDescription = (isString(position) && !isEmpty(position) ? position : null);
    const oldImageId = imageId;
    const oldBase64Image = get(this.state, 'imageFile[0].base64');
    const newBase64Image = get(ideaFormOutput, 'imageFile[0].base64');

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

      browserHistory.push(`/ideas/${ideaSlug}`);
    } catch {
      this.setState({ processing: false, submitError: true });
    }
  }

  render() {
    if (this.state && this.state.loaded) {
      const { locale, titleMultiloc, descriptionMultiloc, selectedTopics, selectedProject, location, imageFile, submitError, processing } = this.state;
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
