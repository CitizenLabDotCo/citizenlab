// Copied IdeaEditPage and made the minimal modifications for this use.

import React, { useState } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// router
import clHistory from 'utils/cl-router/history';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';
import { Content, Top, Container } from '../PostPreview';

// services
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
import { geocode } from 'utils/locationTools';

// typings
import { UploadFile, Multiloc, Locale, ILocationInfo } from 'typings';

// style
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

// resource components
import GetRemoteFiles, {
  GetRemoteFilesChildProps,
} from 'resources/GetRemoteFiles';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import useLocale from 'hooks/useLocale';

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';
import useIdeaById from 'api/ideas/useIdeaById';

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
  remoteIdeaFiles: GetRemoteFilesChildProps;
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  appConfiguration: GetAppConfigurationChildProps;
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
  imageFileIsChanged: boolean;
  ideaFiles: UploadFile[];
  imageId: string | null;
  submitError: boolean;
  titleProfanityError: boolean;
  descriptionProfanityError: boolean;
  loaded: boolean;
  processing: boolean;
  authorId: string | null;
  attachments: UploadFile[];
  originalLocationDescription: string | null;
}

const AdminIdeaEdit = ({
  ideaId,
  remoteIdeaFiles,
  goBack,
  authUser,
  appConfiguration,
}: Props) => {
  const locale = useLocale();
  const { data: idea } = useIdeaById(ideaId);
  const [ideaFiles, setIdeaFiles] = useState<UploadFile[]>([]);
  const [imageFileIsChanged, setImageFileIsChanged] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [titleProfanityError, setTitleProfanityError] = useState(false);
  const [descriptionProfanityError, setDescriptionProfanityError] =
    useState(false);
  const [fileOrImageError, setFileOrImageError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [descriptionMultiloc, setDescriptionMultiloc] =
    useState<Multiloc | null>(null);
  const [imageFile, setImageFile] = useState<UploadFile[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  // constructor(props: Props) {
  //   super(props);
  //   this.state = {
  //     projectId: null,
  //     authorId: null,
  //     locale: 'en',
  //     titleMultiloc: null,
  //     descriptionMultiloc: null,
  //     selectedTopics: [],
  //     budget: null,
  //     proposedBudget: null,
  //     address: null,
  //     imageFile: [],
  //     imageFileIsChanged: false,
  //     ideaFiles: [],
  //     imageId: null,
  //     submitError: false,
  //     titleProfanityError: false,
  //     descriptionProfanityError: false,
  //     loaded: false,
  //     processing: false,
  //     attachments: [],
  //     originalLocationDescription: null,
  //   };
  //   this.subscriptions = [];
  // }

  // componentDidMount() {
  //   const { ideaId } = this.props;
  //   const locale$ = localeStream().observable;

  //   const idea$ = ideaByIdStream(ideaId).observable;

  //   const ideaWithRelationships$ = combineLatest([locale$, idea$]).pipe(
  //     switchMap(([_locale, idea]) => {
  //       const ideaId = idea.data.id;
  //       const ideaImages = idea.data.relationships.idea_images.data;
  //       const ideaImageId =
  //         ideaImages && ideaImages.length > 0 ? ideaImages[0].id : null;
  //       const ideaImage$ = ideaImageId
  //         ? ideaImageStream(ideaId, ideaImageId).observable.pipe(
  //             first(),
  //             switchMap((ideaImage) => {
  //               if (
  //                 ideaImage &&
  //                 ideaImage.data &&
  //                 ideaImage.data.attributes.versions.large
  //               ) {
  //                 const url = ideaImage.data.attributes.versions.large;
  //                 const id = ideaImage.data.id;
  //                 return convertUrlToUploadFileObservable(url, id, null);
  //               }

  //               return of(null);
  //             })
  //           )
  //         : of(null);

  //       const granted$ = hasPermission({
  //         item: idea.data,
  //         action: 'edit',
  //         context: idea.data,
  //       });

  //       return combineLatest([locale$, idea$, ideaImage$, granted$]);
  //     })
  //   );

  //   this.subscriptions = [
  //     ideaWithRelationships$.subscribe(([locale, idea, ideaImage, granted]) => {
  //       if (granted) {
  //         this.setState({
  //           locale,
  //           selectedTopics:
  //             idea.data.relationships.topics?.data.map((topic) => topic.id) ||
  //             [],
  //           projectId: idea.data.relationships.project.data.id,
  //           loaded: true,
  //           titleMultiloc: idea.data.attributes.title_multiloc,
  //           descriptionMultiloc: idea.data.attributes.body_multiloc,
  //           address: idea.data.attributes.location_description,
  //           originalLocationDescription:
  //             idea.data.attributes.location_description,
  //           budget: idea.data.attributes.budget,
  //           authorId: idea.data.relationships.author.data?.id || null,
  //           proposedBudget: idea.data.attributes.proposed_budget,
  //           imageFile: ideaImage ? [ideaImage] : [],
  //           imageId: ideaImage && ideaImage.id ? ideaImage.id : null,
  //         });
  //       } else {
  //         clHistory.push('/');
  //       }
  //     }),
  //   ];
  // }

  if (isNilOrError(locale) || isNilOrError(idea)) {
    return null;
  }

  const authorId = idea.data.relationships.author.data?.id || null;
  const ideaImages = idea.data.relationships.idea_images.data;
  const ideaImageId =
    ideaImages && ideaImages.length > 0 ? ideaImages[0].id : null;
  const budget = idea.data.attributes.budget;
  const proposedBudget = idea.data.attributes.proposed_budget;
  const projectId = idea.data.relationships.project.data.id;

  const handleOnSaveButtonClick = () => {
    eventEmitter.emit('IdeaFormSubmitEvent');
  };

  const handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const {
      title,
      imageFile,
      description,
      selectedTopics,
      address: ideaFormAddress,
      budget,
      proposedBudget,
      ideaFiles,
      ideaFilesToRemove,
      authorId: newAuthorId,
    } = ideaFormOutput;
    const oldImageId = imageId;
    const newImage = imageFile && imageFile.length > 0 ? imageFile[0] : null;

    const newImageBase64 = newImage ? newImage.base64 : null;
    const imageToAddPromise =
      imageFileIsChanged && newImageBase64
        ? addIdeaImage(ideaId, newImageBase64, 0)
        : Promise.resolve(null);

    const filesToAddPromises = ideaFiles
      .filter((file) => !file.remote)
      .map((file) => addIdeaFile(ideaId, file.base64, file.name));
    const filesToRemovePromises = ideaFilesToRemove
      .filter((file) => !!(file.remote && file.id))
      .map((file) => deleteIdeaFile(ideaId, file.id as string));

    const finalAuthorId = newAuthorId || authorId;
    const addressDiff: ILocationInfo = {} as any;

    const locationPoint = await geocode(ideaFormAddress);
    addressDiff.location_description = ideaFormAddress;

    if (locationPoint && originalLocationDescription !== ideaFormAddress) {
      addressDiff.location_point_geojson = locationPoint;
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
      author_id: finalAuthorId,
      ...addressDiff,
    });

    setProcessing(true);
    setSubmitError(false);
    try {
      if (oldImageId && imageFileIsChanged) {
        await deleteIdeaImage(ideaId, oldImageId);
      }

      await Promise.all([
        updateIdeaPromise,
        imageToAddPromise,
        ...filesToAddPromises,
        ...filesToRemovePromises,
      ] as Promise<any>[]);

      goBack();
    } catch (error) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.log(error);
      const apiErrors = error.json.errors;
      const profanityApiError = apiErrors.base.find(
        (apiError) => apiError.error === 'includes_banned_words'
      );

      if (profanityApiError) {
        const titleProfanityError = profanityApiError.blocked_words.some(
          (blockedWord) => blockedWord.attribute === 'title_multiloc'
        );
        const descriptionProfanityError = profanityApiError.blocked_words.some(
          (blockedWord) => blockedWord.attribute === 'body_multiloc'
        );

        if (titleProfanityError) {
          trackEventByName(tracks.titleProfanityError.name, {
            ideaId,
            projectId,
            locale,
            profaneMessage: title,
            location: 'IdeaEdit (Input manager in admin)',
            userId: !isNilOrError(authUser) ? authUser.id : null,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.attributes.host
              : null,
          });
          setTitleProfanityError(titleProfanityError);
        }

        if (descriptionProfanityError) {
          trackEventByName(tracks.descriptionProfanityError.name, {
            ideaId,
            projectId,
            locale,
            profaneMessage: description,
            location: 'IdeaEdit (Input manager in admin)',
            userId: !isNilOrError(authUser) ? authUser.id : null,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.attributes.host
              : null,
          });
          setDescriptionProfanityError(descriptionProfanityError);
        }
      }

      setSubmitError(true);
    }

    setProcessing(false);
  };

  const onTitleChange = (title: string) => {
    setTitleMultiloc({ ...titleMultiloc, [locale]: title });
    setTitleProfanityError(false);
  };

  const onImageFileAdd = (imageFile: UploadFile[]) => {
    setImageFile([imageFile[0]]);
    setImageFileIsChanged(true);
  };

  const onImageFileRemove = () => {
    setImageFile([]);
    setImageFileIsChanged(true);
  };

  const onTagsChange = (selectedTopics: string[]) => {
    setSelectedTopics(selectedTopics);
  };

  const onAddressChange = (address: string) => {
    setAddress(address);
  };

  const onDescriptionChange = (description: string) => {
    setDescriptionMultiloc({
      ...descriptionMultiloc,
      [locale]: description,
    });

    setDescriptionProfanityError(false);
  };

  const onIdeaFilesChange = (ideaFiles: UploadFile[]) => {
    setIdeaFiles(ideaFiles);
  };

  if (loaded) {
    const title = locale && titleMultiloc ? titleMultiloc[locale] || '' : '';
    const description =
      locale && descriptionMultiloc ? descriptionMultiloc[locale] || '' : null;
    const submitErrorMessage = submitError ? (
      <FormattedMessage {...messages.submitError} />
    ) : null;

    if (projectId) {
      return (
        <Container>
          <Top>
            <Button
              icon="arrow-left"
              buttonStyle="text"
              textColor={colors.primary}
              onClick={goBack}
            >
              <FormattedMessage {...messages.cancelEdit} />
            </Button>
          </Top>

          <Content className="idea-form">
            <IdeaForm
              ideaId={ideaId}
              authorId={authorId}
              projectId={projectId}
              title={title}
              description={description}
              selectedTopics={selectedTopics}
              budget={budget}
              proposedBudget={proposedBudget}
              address={address || ''}
              imageFile={imageFile}
              ideaFiles={ideaFiles}
              onSubmit={handleIdeaFormOutput}
              remoteIdeaFiles={
                !isNilOrError(remoteIdeaFiles) ? remoteIdeaFiles : null
              }
              hasTitleProfanityError={titleProfanityError}
              hasDescriptionProfanityError={descriptionProfanityError}
              onTitleChange={onTitleChange}
              onDescriptionChange={onDescriptionChange}
              onImageFileAdd={onImageFileAdd}
              onImageFileRemove={onImageFileRemove}
              onTagsChange={onTagsChange}
              onAddressChange={onAddressChange}
              onIdeaFilesChange={onIdeaFilesChange}
            />

            <ButtonWrapper>
              <SaveButton
                processing={processing}
                text={<FormattedMessage {...messages.save} />}
                onClick={handleOnSaveButtonClick}
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
};

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  appConfiguration: <GetAppConfiguration />,
  locale: <GetLocale />,
  remoteIdeaFiles: ({ ideaId, render }) => (
    <GetRemoteFiles resourceId={ideaId} resourceType="idea">
      {render}
    </GetRemoteFiles>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <AdminIdeaEdit {...dataProps} {...inputProps} />}
  </Data>
);
