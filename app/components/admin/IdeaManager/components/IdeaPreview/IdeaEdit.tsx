// Copied IdeaEditPage and made the minimal modifications for this use.

import React, { PureComponent } from 'react';
import { isString, isEmpty } from 'lodash-es';
import { Subscription, Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, first } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

// router
import clHistory from 'utils/cl-router/history';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { ideaByIdStream, updateIdea } from 'services/ideas';
import { ideaImageStream, addIdeaImage, deleteIdeaImage } from 'services/ideaImages';
import { topicByIdStream, ITopic } from 'services/topics';
import { hasPermission } from 'services/permissions';
import { addIdeaFile, deleteIdeaFile } from 'services/ideaFiles';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// utils
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFileObservable } from 'utils/imageTools';
import { convertToGeoJson } from 'utils/locationTools';

// typings
import { IOption, UploadFile, Multiloc, Locale } from 'typings';

// style
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

// resource components
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';
import { Content, Top, Container } from '.';

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const SaveButton = styled(Button)`
  margin-right: 10px;
`;

interface InputProps {
  ideaId: string;
  goBack: () => void;
}

interface DataProps {
  remoteIdeaFiles: GetResourceFileObjectsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  projectId: string | null;
  locale: Locale;
  titleMultiloc: Multiloc | null;
  descriptionMultiloc: Multiloc | null;
  selectedTopics: IOption[] | null;
  budget: number | null;
  location: string;
  imageFile: UploadFile[];
  imageId: string | null;
  submitError: boolean;
  loaded: boolean;
  processing: boolean;
}

class IdeaEdit extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      projectId: null,
      locale: 'en',
      titleMultiloc: null,
      descriptionMultiloc: null,
      selectedTopics: null,
      budget: null,
      location: '',
      imageFile: [],
      imageId: null,
      submitError: false,
      loaded: false,
      processing: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { ideaId } = this.props;
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
        const ideaImageId = (ideaImages && ideaImages.length > 0 ? ideaImages[0].id : null);
        const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable.pipe(
          first(),
          switchMap((ideaImage) => {
            if (ideaImage && ideaImage.data && ideaImage.data.attributes.versions.large) {
              const url = ideaImage.data.attributes.versions.large;
              const id = ideaImage.data.id;
              return convertUrlToUploadFileObservable(url, id, null);
            }

            return of(null);
        })) : of(null));

        const granted$ = hasPermission({
          item: idea.data,
          action: 'edit',
          context: idea.data
        });

        let topics$: Observable<null | ITopic[]> = of(null);

        if ((idea.data.relationships.topics && idea.data.relationships.topics.data && idea.data.relationships.topics.data.length > 0)) {
          topics$ = combineLatest(
            idea.data.relationships.topics.data.map(topic => topicByIdStream(topic.id).observable)
          );
        }

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
          selectedTopics$,
          granted$
        );
      })
    );

    this.subscriptions = [
      ideaWithRelationships$.subscribe(([locale, idea, ideaImage, selectedTopics, granted]) => {
        if (granted) {
          this.setState({
            locale,
            selectedTopics,
            projectId: idea.data.relationships.project.data.id,
            loaded: true,
            titleMultiloc: idea.data.attributes.title_multiloc,
            descriptionMultiloc: idea.data.attributes.body_multiloc,
            location: idea.data.attributes.location_description,
            budget: idea.data.attributes.budget,
            imageFile: (ideaImage ? [ideaImage] : []),
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
    eventEmitter.emit('IdeasAdminEditPage', 'IdeaFormSubmitEvent', null);
  }

  handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const { ideaId, goBack } = this.props;
    const { locale, titleMultiloc, descriptionMultiloc, imageId, imageFile, location: savedLocation } = this.state;
    const { title, description, selectedTopics, location: ideaFormLocation, budget, ideaFiles, ideaFilesToRemove } = ideaFormOutput;
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const oldImageId = imageId;
    const oldImage = (imageFile && imageFile.length > 0 ? imageFile[0] : null);
    const oldImageBase64 = (oldImage ? oldImage.base64 : null);
    const newImage = (ideaFormOutput.imageFile && ideaFormOutput.imageFile.length > 0 ? ideaFormOutput.imageFile[0] : null);
    const newImageBase64 = (newImage ? newImage.base64 : null);
    const imageToAddPromise = (newImageBase64 && oldImageBase64 !== newImageBase64 ? addIdeaImage(ideaId, newImageBase64, 0) : Promise.resolve(null));
    const filesToAddPromises = ideaFiles.filter(file => !file.remote).map(file => addIdeaFile(ideaId, file.base64, file.name));
    const filesToRemovePromises = ideaFilesToRemove.filter(file => !!(file.remote && file.id)).map(file => deleteIdeaFile(ideaId, file.id as string));

    const locationDiff = {};
    if (isString(ideaFormLocation) && !isEmpty(ideaFormLocation) && ideaFormLocation !== savedLocation) {
      locationDiff['location_point_geojson'] = await convertToGeoJson(ideaFormLocation);
      locationDiff['location_description'] = ideaFormLocation;
    }

    const updateIdeaPromise = updateIdea(ideaId, {
      budget,
      title_multiloc: {
        ...titleMultiloc,
        [locale]: title
      },
      body_multiloc: {
        ...descriptionMultiloc,
        [locale]: description
      },
      topic_ids: topicIds,
      ...locationDiff
    });

    this.setState({ processing: true, submitError: false });

    try {
      if (oldImageId && oldImageBase64 !== newImageBase64) {
        await deleteIdeaImage(ideaId, oldImageId);
      }

      await Promise.all([
        updateIdeaPromise,
        imageToAddPromise,
        ...filesToAddPromises,
        ...filesToRemovePromises
      ] as Promise<any>[]);

      goBack();
    } catch {
      this.setState({ processing: false, submitError: true });
    }
  }

  render() {
    if (this.state && this.state.loaded) {
      const { remoteIdeaFiles, goBack } = this.props;
      const {
        locale,
        projectId,
        titleMultiloc,
        descriptionMultiloc,
        selectedTopics,
        location,
        imageFile,
        submitError,
        processing,
        budget
      } = this.state;
      const title = locale && titleMultiloc ? titleMultiloc[locale] || '' : '';
      const description = (locale && descriptionMultiloc ? descriptionMultiloc[locale] || '' : null);
      const submitErrorMessage = (submitError ? <FormattedMessage {...messages.submitError} /> : null);

      return (
        <Container>
          <Top>
            <Button
              icon="arrow-back"
              style="text"
              textColor={colors.adminTextColor}
              onClick={goBack}
            >
              <FormattedMessage {...messages.cancelEdit}/>
            </Button>
          </Top>

          <Content>
            <IdeaForm
              projectId={projectId}
              title={title}
              description={description}
              selectedTopics={selectedTopics}
              budget={budget}
              location={location}
              imageFile={imageFile}
              onSubmit={this.handleIdeaFormOutput}
              remoteIdeaFiles={!isNilOrError(remoteIdeaFiles) ? remoteIdeaFiles : null}
            />

            <ButtonWrapper>
              <SaveButton
                processing={processing}
                text={<FormattedMessage {...messages.save} />}
                onClick={this.handleOnSaveButtonClick}
              />
              <Error text={submitErrorMessage} marginTop="0px" />
            </ButtonWrapper>
          </Content>
        </Container>
      );
    }

    return null;
  }
}

const WrappedIdeaEdit = ((props: InputProps) => (
  <GetResourceFileObjects resourceId={props.ideaId} resourceType="idea">
    {remoteIdeaFiles => <IdeaEdit {...props} remoteIdeaFiles={remoteIdeaFiles} />}
  </GetResourceFileObjects>
));

export default WrappedIdeaEdit;
