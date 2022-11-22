import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { combineLatest, of, Subscription } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';

// router
import clHistory from 'utils/cl-router/history';

// components
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';
import IdeasEditButtonBar from './IdeasEditButtonBar';
import IdeasEditMeta from './IdeasEditMeta';
import GoBackToIdeaPage from 'containers/IdeasEditPage/GoBackToIdeaPage';
import { Box } from '@citizenlab/cl2-component-library';

// feature flag variant
import IdeasEditPageWithJSONForm from './WithJSONForm';

// services
import { currentAppConfigurationStream } from 'services/appConfiguration';
import { addIdeaFile, deleteIdeaFile } from 'services/ideaFiles';
import {
  addIdeaImage,
  deleteIdeaImage,
  ideaImageStream,
} from 'services/ideaImages';
import { ideaByIdStream, IIdeaData, updateIdea } from 'services/ideas';
import { localeStream } from 'services/locale';
import { getInputTerm } from 'services/participationContexts';
import { hasPermission } from 'services/permissions';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// utils
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFileObservable } from 'utils/fileUtils';
import { geocode } from 'utils/locationTools';

// typings
import { Locale, Multiloc, UploadFile } from 'typings';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// resource components
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetRemoteFiles, {
  GetRemoteFilesChildProps,
} from 'resources/GetRemoteFiles';

// tracks
import useFeatureFlag from 'hooks/useFeatureFlag';
import { trackEventByName } from 'utils/analytics';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import tracks from './tracks';

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

  ${media.tablet`
    padding-bottom: 80px;
  `}
`;

const Title = styled.h1`
  width: 100%;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 42px;
  font-weight: 500;
  text-align: center;
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

interface InputProps {
  params: {
    ideaId: string;
  };
}

interface DataProps {
  remoteIdeaFiles: GetRemoteFilesChildProps;
  project: GetProjectChildProps;
  idea: GetIdeaChildProps;
  appConfiguration: GetAppConfigurationChildProps;
  phases: GetPhasesChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  locale: Locale;
  ideaSlug: string | null;
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
  loaded: boolean;
  submitError: boolean;
  titleProfanityError: boolean;
  descriptionProfanityError: boolean;
  fileOrImageError: boolean;
  processing: boolean;
  authorId: string | null;
}

class IdeaEditPage extends PureComponent<Props & InjectedLocalized, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: 'en',
      ideaSlug: null,
      titleMultiloc: null,
      descriptionMultiloc: null,
      selectedTopics: [],
      budget: null,
      proposedBudget: null,
      address: null,
      imageFile: [],
      imageFileIsChanged: false,
      ideaFiles: [],
      imageId: null,
      loaded: false,
      submitError: false,
      titleProfanityError: false,
      descriptionProfanityError: false,
      fileOrImageError: false,
      processing: false,
      authorId: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { ideaId } = this.props.params;
    const locale$ = localeStream().observable;
    const currentTenantLocales$ =
      currentAppConfigurationStream().observable.pipe(
        map(
          (currentTenant) => currentTenant.data.attributes.settings.core.locales
        )
      );
    const idea$ = ideaByIdStream(ideaId).observable;
    const ideaWithRelationships$ = combineLatest([
      locale$,
      currentTenantLocales$,
      idea$,
    ]).pipe(
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

        return combineLatest([locale$, idea$, ideaImage$, granted$]);
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
            loaded: true,
            ideaSlug: idea.data.attributes.slug,
            titleMultiloc: idea.data.attributes.title_multiloc,
            descriptionMultiloc: idea.data.attributes.body_multiloc,
            address: idea.data.attributes.location_description,
            budget: idea.data.attributes.budget,
            authorId: idea.data.relationships.author.data?.id || null,
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
    const { ideaId } = this.props.params;
    const { project, authUser, appConfiguration } = this.props;
    const {
      locale,
      imageFileIsChanged,
      titleMultiloc,
      descriptionMultiloc,
      ideaSlug,
      imageId,
    } = this.state;
    const {
      title,
      description,
      selectedTopics,
      budget,
      proposedBudget,
      ideaFiles,
      ideaFilesToRemove,
      address,
    } = ideaFormOutput;
    const oldImageId = imageId;
    const newImage =
      ideaFormOutput.imageFile && ideaFormOutput.imageFile.length > 0
        ? ideaFormOutput.imageFile[0]
        : null;
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
    const finalAuthorId = ideaFormOutput?.authorId || this.state.authorId;
    const addressDiff: Partial<IIdeaData['attributes']> = {
      location_point_geojson: null,
      location_description: null,
    };

    if (address && address.length > 0) {
      addressDiff.location_point_geojson = await geocode(address);
      addressDiff.location_description = address;
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

    this.setState({ submitError: false, processing: true });

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

      clHistory.push(`/ideas/${ideaSlug}`);
    } catch (error) {
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
            locale,
            projectId: !isNilOrError(project) ? project.id : null,
            profaneMessage: title,
            location: 'IdeasEditPage (citizen side)',
            userId: !isNilOrError(authUser) ? authUser.id : null,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.attributes.host
              : null,
          });

          this.setState({
            titleProfanityError,
          });
        }

        if (descriptionProfanityError) {
          trackEventByName(tracks.descriptionProfanityError.name, {
            ideaId,
            locale,
            projectId: !isNilOrError(project) ? project.id : null,
            profaneMessage: title,
            location: 'IdeasEditPage (citizen side)',
          });

          this.setState({
            descriptionProfanityError,
          });
        }
      }

      if (apiErrors && (apiErrors.image || apiErrors.file)) {
        this.setState({
          fileOrImageError: true,
        });
      }

      this.setState({ submitError: true });
    }

    this.setState({ processing: false });
  };

  onTitleChange = (title: string) => {
    const { locale } = this.props;
    const titleMultiloc = { ...this.state.titleMultiloc, [locale]: title };

    this.setState({ titleMultiloc, titleProfanityError: false });
  };

  onImageFileAdd = (imageFile: UploadFile[]) => {
    this.setState({ imageFile: [imageFile[0]], imageFileIsChanged: true });
  };

  onImageFileRemove = () => {
    this.setState({ imageFile: [], imageFileIsChanged: true });
  };

  onTagsChange = (selectedTopics: string[]) => {
    this.setState({ selectedTopics });
  };

  onAddressChange = (address: string) => {
    this.setState({ address });
  };

  onDescriptionChange = (description: string) => {
    const { locale } = this.props;
    const descriptionMultiloc = {
      ...this.state.descriptionMultiloc,
      [locale]: description,
    };

    this.setState({ descriptionMultiloc, descriptionProfanityError: false });
  };

  onIdeaFilesChange = (ideaFiles: UploadFile[]) => {
    this.setState({
      ideaFiles,
    });
  };

  render() {
    if (this.state && this.state.loaded) {
      const { remoteIdeaFiles, project, idea, phases } = this.props;
      const {
        locale,
        titleMultiloc,
        descriptionMultiloc,
        selectedTopics,
        address,
        imageFile,
        ideaFiles,
        budget,
        proposedBudget,
        titleProfanityError,
        descriptionProfanityError,
        submitError,
        fileOrImageError,
        processing,
        authorId,
      } = this.state;

      const title = locale && titleMultiloc ? titleMultiloc[locale] || '' : '';
      const description =
        locale && descriptionMultiloc
          ? descriptionMultiloc[locale] || ''
          : null;

      if (!isNilOrError(project) && !isNilOrError(idea)) {
        const projectId = project.id;
        const ideaId = idea.id;
        const inputTerm = getInputTerm(
          project.attributes.process_type,
          project,
          phases
        );

        return (
          <Container id="e2e-idea-edit-page">
            <IdeasEditMeta ideaId={ideaId} projectId={projectId} />
            <FormContainer>
              <Box
                width="100%"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                mt="52px"
              >
                <GoBackToIdeaPage idea={idea} />

                <Title>
                  <FormattedMessage
                    {...getInputTermMessage(inputTerm, {
                      idea: messages.formTitle,
                      option: messages.optionFormTitle,
                      project: messages.projectFormTitle,
                      question: messages.questionFormTitle,
                      issue: messages.issueFormTitle,
                      contribution: messages.contributionFormTitle,
                    })}
                  />
                </Title>
              </Box>

              <IdeaForm
                authorId={authorId}
                ideaId={ideaId}
                projectId={projectId}
                title={title}
                description={description}
                selectedTopics={selectedTopics}
                budget={budget}
                proposedBudget={proposedBudget}
                address={address || ''}
                imageFile={imageFile}
                ideaFiles={ideaFiles}
                onSubmit={this.handleIdeaFormOutput}
                remoteIdeaFiles={
                  !isNilOrError(remoteIdeaFiles) ? remoteIdeaFiles : null
                }
                hasTitleProfanityError={titleProfanityError}
                hasDescriptionProfanityError={descriptionProfanityError}
                onImageFileAdd={this.onImageFileAdd}
                onImageFileRemove={this.onImageFileRemove}
                onTagsChange={this.onTagsChange}
                onTitleChange={this.onTitleChange}
                onDescriptionChange={this.onDescriptionChange}
                onAddressChange={this.onAddressChange}
                onIdeaFilesChange={this.onIdeaFilesChange}
              />

              <ButtonBarContainer>
                <IdeasEditButtonBar
                  form="idea-form"
                  submitError={submitError}
                  processing={processing}
                  fileOrImageError={fileOrImageError}
                />
              </ButtonBarContainer>
            </FormContainer>
          </Container>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  appConfiguration: <GetAppConfiguration />,
  remoteIdeaFiles: ({ params: { ideaId }, render }) => (
    <GetRemoteFiles resourceId={ideaId} resourceType="idea">
      {render}
    </GetRemoteFiles>
  ),
  idea: ({ params: { ideaId }, render }) => {
    return <GetIdea ideaId={ideaId}>{render}</GetIdea>;
  },
  project: ({ idea, render }) => {
    return (
      <GetProject
        projectId={
          !isNilOrError(idea) ? idea.relationships.project.data.id : null
        }
      >
        {render}
      </GetProject>
    );
  },
  phases: ({ project, render }) => {
    return (
      <GetPhases projectId={!isNilOrError(project) ? project.id : null}>
        {render}
      </GetPhases>
    );
  },
});
const IdeaEditPageWithHOCs = injectLocalize<Props>(IdeaEditPage);

export default withRouter((inputProps: InputProps & WithRouterProps) => {
  const isDynamicIdeaFormEnabled = useFeatureFlag({
    name: 'dynamic_idea_form',
  });

  if (isDynamicIdeaFormEnabled) {
    return <IdeasEditPageWithJSONForm {...inputProps} />;
  }

  return (
    <Data {...inputProps}>
      {(dataProps) => <IdeaEditPageWithHOCs {...inputProps} {...dataProps} />}
    </Data>
  );
});
