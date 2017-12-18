import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { browserHistory } from 'react-router';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { ideaByIdStream, updateIdea } from 'services/ideas';
import { ideaImageStream } from 'services/ideaImages';
import { projectByIdStream } from 'services/projects';
import { topicByIdStream } from 'services/topics';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// utils
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToFileObservable } from 'utils/imageTools';
import { convertToGeoJson } from 'utils/locationTools';

// typings
import { IOption, ImageFile } from 'typings';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div`
  background: #f8f8f8;
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
  locale: string | null;
  ideaSlug: string | null;
  title: string | null;
  description: string | null;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  location: string;
  imageFile: ImageFile[] | null;
  submitError: boolean;
  processing: boolean;
}

class IdeaEditPage extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      ideaSlug: null,
      title: null,
      description: null,
      selectedTopics: null,
      selectedProject: null,
      location: '',
      imageFile: null,
      submitError: false,
      processing: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId } = this.props.params;
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
      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable.switchMap(ideaImage => convertUrlToFileObservable(ideaImage.data.attributes.versions.large)) : Rx.Observable.of(null));
      const project$ = (idea.data.relationships.project && idea.data.relationships.project.data ? projectByIdStream(idea.data.relationships.project.data.id).observable : Rx.Observable.of(null));
      const topics$ = (idea.data.relationships.topics && idea.data.relationships.topics.data && idea.data.relationships.topics.data.length > 0 ? Rx.Observable.combineLatest(idea.data.relationships.topics.data.map(topic => topicByIdStream(topic.id).observable)) : Rx.Observable.of(null));

      return Rx.Observable.combineLatest(
        locale$,
        idea$,
        ideaImage$,
        project$.map(project => project ? { value: project.data.id, label: getLocalized(project.data.attributes.title_multiloc, locale, currentTenantLocales) } : null),
        topics$.map(topics => topics ? topics.map((topic) => ({ value: topic.data.id, label: getLocalized(topic.data.attributes.title_multiloc, locale, currentTenantLocales) })) : null)
      );
    });

    this.subscriptions = [
      ideaWithRelationships$.subscribe(([locale, idea, ideaImage, project, topics]) => {
        this.setState({
          ideaSlug: idea.data.attributes.slug,
          title: idea.data.attributes.title_multiloc[locale],
          description: idea.data.attributes.body_multiloc[locale],
          selectedTopics: topics,
          selectedProject: project,
          location: idea.data.attributes.location_description,
          imageFile: (ideaImage ? [ideaImage] : null)
        });
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
    const { locale, ideaSlug } = this.state;
    const { title, description, selectedTopics, selectedProject, location, imageFile } = ideaFormOutput;
    const ideaTitle = { [locale as string]: title as string };
    const ideaDescription = { [locale as string]: (description || '') };
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const projectId = (selectedProject ? selectedProject.value as string : null);
    const locationGeoJSON = (_.isString(location) && !_.isEmpty(location) ? await convertToGeoJson(location) : null);
    const locationDescription = (_.isString(location) && !_.isEmpty(location) ? location : null);

    this.setState({ processing: true, submitError: false });

    try {
      await updateIdea(ideaId, {
        title_multiloc: ideaTitle,
        body_multiloc: ideaDescription,
        topic_ids: topicIds,
        project_id: projectId,
        location_point_geojson: locationGeoJSON,
        location_description: locationDescription
      });

      browserHistory.push(`ideas/${ideaSlug}`);
    } catch {
      this.setState({ processing: false, submitError: true });
    }
  }

  render() {
    if (!this.state) { return null; }

    const { title, description, selectedTopics, selectedProject, location, imageFile, submitError, processing } = this.state;
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
            location={location}
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
      </Container>
    );
  }
}

export default IdeaEditPage;
