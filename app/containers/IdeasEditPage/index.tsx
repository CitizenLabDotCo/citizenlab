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
import Footer from 'components/Footer';

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
import { convertUrlToUploadFileObservable } from 'utils/fileTools';
import { convertToGeoJson } from 'utils/locationTools';

// typings
import { IOption, UploadFile, Multiloc, Locale } from 'typings';

// style
import { media, fontSizes, colors } from 'utils/styleUtils';
import styled from 'styled-components';

// resource components
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';

const Container = styled.div`
  background: ${colors.background};
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
  projectId: string | null;
  locale: Locale;
  ideaSlug: string | null;
  titleMultiloc: Multiloc | null;
  descriptionMultiloc: Multiloc | null;
  selectedTopics: IOption[] | null;
  budget: number | null;
  address: string;
  imageFile: UploadFile[];
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
      projectId: null,
      locale: 'en',
      ideaSlug: null,
      titleMultiloc: null,
      descriptionMultiloc: null,
      selectedTopics: null,
      budget: null,
      address: '',
      imageFile: [],
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
        let ideaImage$ = of(null) as Observable<UploadFile | null>;
        let granted$ = of(false) as Observable<boolean>;
        let selectedTopics$ = of(null) as Observable<{ label: string, value: string }[]| null>;

        if (!isNilOrError(idea)) {

        // ideaImage$
        const ideaId = idea.data.id;
        const ideaImages = idea.data.relationships.idea_images.data;
        const ideaImageId = (ideaImages && ideaImages.length > 0 ? ideaImages[0].id : null);
        ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable.pipe(
          first(),
          switchMap((ideaImage) => {
            if (ideaImage && ideaImage.data && ideaImage.data.attributes.versions.large) {
              const url = ideaImage.data.attributes.versions.large;
              const id = ideaImage.data.id;
              return convertUrlToUploadFileObservable(url, id, null);
            }

            return of(null);
        })) : of(null));

        // selectedTopics$
        let topics$: Observable<null | ITopic[]> = of(null);
        if ((idea.data.relationships.topics && idea.data.relationships.topics.data && idea.data.relationships.topics.data.length > 0)) {
          topics$ = combineLatest(
            idea.data.relationships.topics.data.map(topic => topicByIdStream(topic.id).observable)
          );
        }

        selectedTopics$ = topics$.pipe(map((topics) => {
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

        // granted$
        granted$ = hasPermission({
          item: idea.data,
          action: 'edit',
          context: idea.data
        });
      }

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
        if (!isNilOrError(idea) && granted) {
          this.setState({
            locale,
            selectedTopics,
            projectId: idea.data.relationships.project.data.id,
            loaded: true,
            ideaSlug: idea.data.attributes.slug,
            titleMultiloc: idea.data.attributes.title_multiloc,
            descriptionMultiloc: idea.data.attributes.body_multiloc,
            address: idea.data.attributes.location_description,
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
    eventEmitter.emit('IdeasEditPage', 'IdeaFormSubmitEvent', null);
  }

  handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const { ideaId } = this.props.params;
    const { locale, titleMultiloc, descriptionMultiloc, ideaSlug, imageId, imageFile, address: savedAddress } = this.state;
    const { title, description, selectedTopics, address: ideaFormAddress, budget, ideaFiles, ideaFilesToRemove } = ideaFormOutput;
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const oldImageId = imageId;
    const oldImage = (imageFile && imageFile.length > 0 ? imageFile[0] : null);
    const oldImageBase64 = (oldImage ? oldImage.base64 : null);
    const newImage = (ideaFormOutput.imageFile && ideaFormOutput.imageFile.length > 0 ? ideaFormOutput.imageFile[0] : null);
    const newImageBase64 = (newImage ? newImage.base64 : null);
    const imageToAddPromise = (newImageBase64 && oldImageBase64 !== newImageBase64 ? addIdeaImage(ideaId, newImageBase64, 0) : Promise.resolve(null));
    const filesToAddPromises = ideaFiles.filter(file => !file.remote).map(file => addIdeaFile(ideaId, file.base64, file.name));
    const filesToRemovePromises = ideaFilesToRemove.filter(file => !!(file.remote && file.id)).map(file => deleteIdeaFile(ideaId, file.id as string));

    const addressDiff = {};
    if (isString(ideaFormAddress) && !isEmpty(ideaFormAddress) && ideaFormAddress !== savedAddress) {
      addressDiff['location_point_geojson'] = await convertToGeoJson(ideaFormAddress);
      addressDiff['location_description'] = ideaFormAddress;
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
      ...addressDiff
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
        projectId,
        titleMultiloc,
        descriptionMultiloc,
        selectedTopics,
        address,
        imageFile,
        submitError,
        processing,
        budget
      } = this.state;
      const title = locale && titleMultiloc ? titleMultiloc[locale] || '' : '';
      const description = (locale && descriptionMultiloc ? descriptionMultiloc[locale] || '' : null);
      const submitErrorMessage = (submitError ? <FormattedMessage {...messages.submitError} /> : null);

      return (
        <Container id="e2e-idea-edit-page">
          <FormContainer>
            <Title>
              <FormattedMessage {...messages.formTitle} />
            </Title>

            <IdeaForm
              projectId={projectId}
              title={title}
              description={description}
              selectedTopics={selectedTopics}
              budget={budget}
              address={address}
              imageFile={imageFile}
              onSubmit={this.handleIdeaFormOutput}
              remoteIdeaFiles={!isNilOrError(remoteIdeaFiles) ? remoteIdeaFiles : null}
            />

            <ButtonWrapper>
              <SaveButton
                id="e2e-idea-edit-save-button"
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
