// Copied IdeaEditPage and made the minimal modifications for this use.

import React, { PureComponent } from 'react';
import { isString, isEmpty } from 'lodash-es';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap, map, first } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

// router
import clHistory from 'utils/cl-router/history';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';
import { Content, Top, Container } from '../PostPreview';

// services
import { localeStream } from 'services/locale';
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { ideaByIdStream, updateIdea } from 'services/ideas';
import {
  ideaImageStream,
  addIdeaImage,
  deleteIdeaImage,
} from 'services/ideaImages';
import { hasPermission } from 'services/permissions';
import { addIdeaFile, deleteIdeaFile } from 'services/ideaFiles';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFileObservable } from 'utils/fileTools';
import { convertToGeoJson } from 'utils/locationTools';

// typings
import { UploadFile, Multiloc, Locale } from 'typings';

// style
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

// resource components
import GetResourceFileObjects, {
  GetResourceFileObjectsChildProps,
} from 'resources/GetResourceFileObjects';

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const SaveButton = styled(Button)`
  margin-right: 10px;
`;

export interface InputProps {
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
  selectedTopics: string[];
  budget: number | null;
  proposedBudget: number | null;
  address: string | null;
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
      selectedTopics: [],
      budget: null,
      proposedBudget: null,
      address: null,
      imageFile: [],
      imageId: null,
      submitError: false,
      loaded: false,
      processing: false,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { ideaId } = this.props;
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentAppConfigurationStream().observable.pipe(
      map(
        (currentTenant) => currentTenant.data.attributes.settings.core.locales
      )
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
        const ideaImageId =
          ideaImages && ideaImages.length > 0 ? ideaImages[0].id : null;
        const ideaImage$ = ideaImageId
          ? ideaImageStream(ideaId, ideaImageId).observable.pipe(
              first(),
              switchMap((ideaImage) => {
                if (
                  ideaImage &&
                  ideaImage.data &&
                  ideaImage.data.attributes.versions.large
                ) {
                  const url = ideaImage.data.attributes.versions.large;
                  const id = ideaImage.data.id;
                  return convertUrlToUploadFileObservable(url, id, null);
                }

                return of(null);
              })
            )
          : of(null);

        const granted$ = hasPermission({
          item: idea.data,
          action: 'edit',
          context: idea.data,
        });

        return combineLatest(locale$, idea$, ideaImage$, granted$);
      })
    );

    this.subscriptions = [
      ideaWithRelationships$.subscribe(([locale, idea, ideaImage, granted]) => {
        if (granted) {
          this.setState({
            locale,
            selectedTopics:
              idea.data.relationships.topics?.data.map((topic) => topic.id) ||
              [],
            projectId: idea.data.relationships.project.data.id,
            loaded: true,
            titleMultiloc: idea.data.attributes.title_multiloc,
            descriptionMultiloc: idea.data.attributes.body_multiloc,
            address: idea.data.attributes.location_description,
            budget: idea.data.attributes.budget,
            proposedBudget: idea.data.attributes.proposed_budget,
            imageFile: ideaImage ? [ideaImage] : [],
            imageId: ideaImage && ideaImage.id ? ideaImage.id : null,
          });
        } else {
          clHistory.push('/');
        }
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleOnSaveButtonClick = () => {
    eventEmitter.emit('IdeaFormSubmitEvent');
  };

  handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const { ideaId, goBack } = this.props;
    const {
      locale,
      titleMultiloc,
      descriptionMultiloc,
      imageId,
      imageFile,
      address: savedAddress,
    } = this.state;
    const {
      title,
      description,
      selectedTopics,
      address: ideaFormAddress,
      budget,
      proposedBudget,
      ideaFiles,
      ideaFilesToRemove,
    } = ideaFormOutput;
    const oldImageId = imageId;
    const oldImage = imageFile && imageFile.length > 0 ? imageFile[0] : null;
    const oldImageBase64 = oldImage ? oldImage.base64 : null;
    const newImage =
      ideaFormOutput.imageFile && ideaFormOutput.imageFile.length > 0
        ? ideaFormOutput.imageFile[0]
        : null;
    const newImageBase64 = newImage ? newImage.base64 : null;
    const imageToAddPromise =
      newImageBase64 && oldImageBase64 !== newImageBase64
        ? addIdeaImage(ideaId, newImageBase64, 0)
        : Promise.resolve(null);
    const filesToAddPromises = ideaFiles
      .filter((file) => !file.remote)
      .map((file) => addIdeaFile(ideaId, file.base64, file.name));
    const filesToRemovePromises = ideaFilesToRemove
      .filter((file) => !!(file.remote && file.id))
      .map((file) => deleteIdeaFile(ideaId, file.id as string));

    const addressDiff = {};
    if (
      isString(ideaFormAddress) &&
      !isEmpty(ideaFormAddress) &&
      ideaFormAddress !== savedAddress
    ) {
      addressDiff['location_point_geojson'] = await convertToGeoJson(
        ideaFormAddress
      );
      addressDiff['location_description'] = ideaFormAddress;
    }

    const updateIdeaPromise = updateIdea(ideaId, {
      budget,
      proposed_budget: proposedBudget,
      title_multiloc: {
        ...titleMultiloc,
        [locale]: title,
      },
      body_multiloc: {
        ...descriptionMultiloc,
        [locale]: description,
      },
      topic_ids: selectedTopics,
      ...addressDiff,
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
        ...filesToRemovePromises,
      ] as Promise<any>[]);

      goBack();
    } catch {
      this.setState({ processing: false, submitError: true });
    }
  };

  render() {
    if (this.state && this.state.loaded) {
      const { remoteIdeaFiles, goBack } = this.props;
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
        budget,
        proposedBudget,
      } = this.state;
      const title = locale && titleMultiloc ? titleMultiloc[locale] || '' : '';
      const description =
        locale && descriptionMultiloc
          ? descriptionMultiloc[locale] || ''
          : null;
      const submitErrorMessage = submitError ? (
        <FormattedMessage {...messages.submitError} />
      ) : null;

      if (projectId) {
        return (
          <Container>
            <Top>
              <Button
                icon="arrow-back"
                buttonStyle="text"
                textColor={colors.adminTextColor}
                onClick={goBack}
              >
                <FormattedMessage {...messages.cancelEdit} />
              </Button>
            </Top>

            <Content className="idea-form">
              <IdeaForm
                projectId={projectId}
                title={title}
                description={description}
                selectedTopics={selectedTopics}
                budget={budget}
                proposedBudget={proposedBudget}
                address={address || ''}
                imageFile={imageFile}
                onSubmit={this.handleIdeaFormOutput}
                remoteIdeaFiles={
                  !isNilOrError(remoteIdeaFiles) ? remoteIdeaFiles : null
                }
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

    return null;
  }
}

const WrappedIdeaEdit = (props: InputProps) => (
  <GetResourceFileObjects resourceId={props.ideaId} resourceType="idea">
    {(remoteIdeaFiles) => (
      <IdeaEdit {...props} remoteIdeaFiles={remoteIdeaFiles} />
    )}
  </GetResourceFileObjects>
);

export default WrappedIdeaEdit;
