import React, { PureComponent } from 'react';
import { isString, isEmpty } from 'lodash-es';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap, map, first } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

// router
import clHistory from 'utils/cl-router/history';

// components
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';
import IdeasEditButtonBar from './IdeasEditButtonBar';
import IdeasEditMeta from './IdeasEditMeta';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { ideaByIdStream, updateIdea } from 'services/ideas';
import { ideaImageStream, addIdeaImage, deleteIdeaImage } from 'services/ideaImages';
import { hasPermission } from 'services/permissions';
import { addIdeaFile, deleteIdeaFile } from 'services/ideaFiles';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFileObservable } from 'utils/fileTools';
import { convertToGeoJson } from 'utils/locationTools';

// typings
import { UploadFile, Multiloc, Locale } from 'typings';

// style
import { media, fontSizes, colors } from 'utils/styleUtils';
import styled from 'styled-components';

// resource components
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';

const Container = styled.div`
  background: ${colors.background};
`;

const FormContainer = styled.main`
  width: 100%;
  max-width: 700px;
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

const ButtonBarContainer = styled.div`
  width: 100%;
  height: 68px;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: solid 1px #ddd;
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
  selectedTopics: string[];
  budget: number | null;
  address: string | null;
  imageFile: UploadFile[];
  imageId: string | null;
  loaded: boolean;
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
      selectedTopics: [],
      budget: null,
      address: null,
      imageFile: [],
      imageId: null,
      loaded: false,
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
      switchMap(([_locale, _currentTenantLocales, idea]) => {
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

        return combineLatest(
          locale$,
          idea$,
          ideaImage$,
          granted$
        );
      })
    );

    this.subscriptions = [
      ideaWithRelationships$.subscribe(([locale, idea, ideaImage, granted]) => {
        if (granted) {
          this.setState({
            locale,
            selectedTopics: idea.data.relationships.topics?.data.map(topic => topic.id) || [],
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
    eventEmitter.emit('IdeaFormSubmitEvent');
  }

  handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const { ideaId } = this.props.params;
    const { locale, titleMultiloc, descriptionMultiloc, ideaSlug, imageId, imageFile, address: savedAddress } = this.state;
    const { title, description, selectedTopics, address: ideaFormAddress, budget, ideaFiles, ideaFilesToRemove } = ideaFormOutput;
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
      topic_ids: selectedTopics,
      ...addressDiff
    });

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
        budget
      } = this.state;
      const title = locale && titleMultiloc ? titleMultiloc[locale] || '' : '';
      const description = (locale && descriptionMultiloc ? descriptionMultiloc[locale] || '' : null);

      return (
        <Container id="e2e-idea-edit-page">
          <IdeasEditMeta />
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
              address={address || ''}
              imageFile={imageFile}
              onSubmit={this.handleIdeaFormOutput}
              remoteIdeaFiles={!isNilOrError(remoteIdeaFiles) ? remoteIdeaFiles : null}
            />

            <ButtonBarContainer>
              <IdeasEditButtonBar id="e2e-idea-edit-save-button" form="idea-form" />
            </ButtonBarContainer>
          </FormContainer>
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
