import React from 'react';
import { createPortal } from 'react-dom';
import { adopt } from 'react-adopt';
import { isEmpty, isNumber, get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { parse } from 'qs';

// libraries
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import clHistory from 'utils/cl-router/history';

// components
import IdeasNewButtonBar from './IdeasNewButtonBar';
import NewIdeaForm from './NewIdeaForm';
import IdeasNewMeta from './IdeasNewMeta';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// feature flag variant
import IdeasNewPageWithJSONForm from './WithJSONForm';

// services
import { addIdea, IIdeaAdd } from 'services/ideas';
import { addIdeaFile } from 'services/ideaFiles';
import { addIdeaImage } from 'services/ideaImages';
import {
  globalState,
  IGlobalStateService,
  IIdeasPageGlobalState,
} from 'services/globalState';
import { isAdmin, isSuperAdmin, isModerator } from 'services/permissions/roles';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { PreviousPathnameContext } from 'context';

// utils
import { geocode, reverseGeocode } from 'utils/locationTools';

// style
import { media, colors } from 'utils/styleUtils';
import styled from 'styled-components';

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import { UploadFile } from 'typings';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import { getParticipationMethod } from 'utils/participationMethodUtils';

const Container = styled.div`
  background: ${colors.background};
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const PageContainer = styled.main`
  width: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  position: relative;

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const ButtonBarContainer = styled.div`
  width: 100%;
  height: 68px;
  position: fixed;
  z-index: 2;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: solid 1px #ddd;
`;

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  appConfiguration: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
  previousPathName: string | null;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeasNewPage extends React.Component<Props & WithRouterProps, State> {
  globalState: IGlobalStateService<IIdeasPageGlobalState>;

  constructor(props: Props & WithRouterProps) {
    super(props);
    const initialGlobalState: IIdeasPageGlobalState = {
      title: null,
      description: null,
      selectedTopics: [],
      budget: null,
      proposedBudget: null,
      position: '',
      position_coordinates: null,
      submitError: false,
      titleProfanityError: false,
      descriptionProfanityError: false,
      fileOrImageError: false,
      processing: false,
      ideaId: null,
      ideaSlug: null,
      imageFile: [],
      imageId: null,
      ideaFiles: [],
      authorId: null,
    };
    this.globalState = globalState.init('IdeasNewPage', initialGlobalState);
  }

  componentDidMount() {
    const { location } = this.props;
    const { lat, lng } = parse(location.search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) => {
        return type === 'value' ? parseFloat(str) : str;
      },
    }) as { [key: string]: string | number };

    this.redirectIfNotPermittedOnPage();

    if (isNumber(lat) && isNumber(lng)) {
      reverseGeocode(lat, lng).then((address) => {
        this.globalState.set({
          // When an idea is posted through the map, Google Maps gets an approximate address,
          // but we also keep the exact coordinates from the click so the location indicator keeps its initial position on the map
          // and doesn't read just together with the address correction/approximation
          position: address,
          position_coordinates: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        });
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { authUser, project } = this.props;

    if (prevProps.project !== project || prevProps.authUser !== authUser) {
      this.redirectIfNotPermittedOnPage();
    }
  }

  redirectIfNotPermittedOnPage = () => {
    const { authUser, project } = this.props;
    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) ||
        isModerator({ data: authUser }) ||
        isSuperAdmin({ data: authUser }));

    if (
      !isPrivilegedUser &&
      (authUser === null ||
        (!isNilOrError(project) &&
          !project.attributes.action_descriptor.posting_idea.enabled))
    ) {
      clHistory.replace(
        this.props.previousPathName || (!authUser ? '/sign-up' : '/')
      );
    }
  };

  handleOnIdeaSubmit = async () => {
    const { locale, authUser, project, appConfiguration, location } =
      this.props;
    const { phase_id } = parse(location.search, {
      ignoreQueryPrefix: true,
    }) as { [key: string]: string };
    const {
      title,
      description,
      selectedTopics,
      budget,
      proposedBudget,
      position,
      position_coordinates,
      imageFile,
      ideaFiles,
      authorId,
    } = await this.globalState.get();

    if (
      !isNilOrError(locale) &&
      !isNilOrError(authUser) &&
      !isNilOrError(project)
    ) {
      this.globalState.set({ submitError: false, processing: true });

      try {
        const ideaTitle = { [locale]: title as string };
        const ideaDescription = { [locale]: description || '' };
        const locationDescription = !isEmpty(position) ? position : null;
        let locationGeoJSON: GeoJSON.Point | null = position_coordinates;

        if (!locationGeoJSON) {
          locationGeoJSON = await geocode(position);
        }

        const ideaObject: IIdeaAdd = {
          budget,
          proposed_budget: proposedBudget,
          author_id: authorId,
          publication_status: 'published',
          title_multiloc: ideaTitle,
          body_multiloc: ideaDescription,
          topic_ids: selectedTopics,
          project_id: project.id,
          location_point_geojson: locationGeoJSON,
          location_description: locationDescription,
          ...(phase_id && { phase_ids: [phase_id] }),
        };

        const idea = await addIdea(ideaObject);
        const ideaId = idea.data.id;

        try {
          const imageToAddPromise =
            imageFile && imageFile[0]
              ? addIdeaImage(ideaId, imageFile[0].base64, 0)
              : Promise.resolve(null);
          const filesToAddPromises = ideaFiles.map((file) =>
            addIdeaFile(ideaId, file.base64, file.name)
          );

          await Promise.all([
            imageToAddPromise,
            ...filesToAddPromises,
          ] as Promise<any>[]);
        } catch (error) {
          const apiErrors = get(error, 'json.errors');
          // eslint-disable-next-line no-console
          if (process.env.NODE_ENV === 'development') console.log(error);

          if (apiErrors && apiErrors.image) {
            this.globalState.set({
              fileOrImageError: true,
            });
          }
        }

        const { fileOrImageError } = await this.globalState.get();
        const newUrl = `/ideas/${idea.data.attributes.slug}?new_idea_id=${ideaId}`;
        if (fileOrImageError) {
          setTimeout(() => {
            clHistory.push(newUrl);
          }, 4000);
        } else {
          clHistory.push(newUrl);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.log(error);
        const apiErrors = get(error, 'json.errors');
        const profanityApiError = apiErrors.base.find(
          (apiError) => apiError.error === 'includes_banned_words'
        );

        if (profanityApiError) {
          const titleProfanityError = profanityApiError.blocked_words.some(
            (blockedWord) => blockedWord.attribute === 'title_multiloc'
          );
          const descriptionProfanityError =
            profanityApiError.blocked_words.some(
              (blockedWord) => blockedWord.attribute === 'body_multiloc'
            );

          if (titleProfanityError) {
            trackEventByName(tracks.titleProfanityError.name, {
              locale,
              ideaId: null,
              projectId: !isNilOrError(project) ? project.id : null,
              profaneMessage: title,
              location: 'IdeasNewPage (citizen side)',
              userId: !isNilOrError(authUser) ? authUser.id : null,
              host: !isNilOrError(appConfiguration)
                ? appConfiguration.attributes.host
                : null,
            });
            this.globalState.set({
              titleProfanityError,
            });
          }

          if (descriptionProfanityError) {
            trackEventByName(tracks.descriptionProfanityError.name, {
              locale,
              ideaId: null,
              projectId: !isNilOrError(project) ? project.id : null,
              profaneMessage: title,
              location: 'IdeasNewPage (citizen side)',
              userId: !isNilOrError(authUser) ? authUser.id : null,
              host: !isNilOrError(appConfiguration)
                ? appConfiguration.attributes.host
                : null,
            });
            this.globalState.set({
              descriptionProfanityError,
            });
          }
        }

        this.globalState.set({ processing: false, submitError: true });
      }
    }
  };

  onTitleChange = (title: string) => {
    this.globalState.set({
      title,
      titleProfanityError: false,
    });
  };

  onTagsChange = (selectedTopics: string[]) => {
    this.globalState.set({ selectedTopics });
  };

  onAddressChange = (address: string) => {
    this.globalState.set({ position: address });
  };

  onImageFileAdd = (imageFile: UploadFile[]) => {
    this.globalState.set({
      imageFile: [imageFile[0]],
    });
  };

  onImageFileRemove = () => {
    this.globalState.set({
      imageFile: [],
    });
  };

  onDescriptionChange = (description: string) => {
    this.globalState.set({
      description,
      descriptionProfanityError: false,
    });
  };

  onIdeaFilesChange = (ideaFiles: UploadFile[]) => {
    this.globalState.set({
      ideaFiles,
    });
  };

  render() {
    const { project } = this.props;

    if (!isNilOrError(project)) {
      return (
        <Container id="e2e-idea-new-page">
          <IdeasNewMeta />
          <PageContainer className="ideaForm">
            <NewIdeaForm
              onSubmit={this.handleOnIdeaSubmit}
              projectId={project.id}
              onTitleChange={this.onTitleChange}
              onDescriptionChange={this.onDescriptionChange}
              onImageFileAdd={this.onImageFileAdd}
              onImageFileRemove={this.onImageFileRemove}
              onTagsChange={this.onTagsChange}
              onAddressChange={this.onAddressChange}
              onIdeaFilesChange={this.onIdeaFilesChange}
            />
          </PageContainer>
          <ButtonBarContainer>
            <IdeasNewButtonBar
              form="idea-form"
              onSubmit={this.handleOnIdeaSubmit}
            />
          </ButtonBarContainer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  locale: <GetLocale />,
  appConfiguration: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  project: ({ params, render }) => (
    <GetProject projectSlug={params.slug}>{render}</GetProject>
  ),
  previousPathName: ({ render }) => (
    <PreviousPathnameContext.Consumer>
      {render as any}
    </PreviousPathnameContext.Consumer>
  ),
});

export default withRouter((inputProps: InputProps & WithRouterProps) => {
  const isSmallerThanXlPhone = useBreakpoint('phone');
  const project = useProject({ projectSlug: inputProps.params.slug });
  const phases = usePhases(project?.id);
  const { phase_id } = parse(location.search, {
    ignoreQueryPrefix: true,
  }) as { [key: string]: string };
  const participationMethod = getParticipationMethod(project, phases, phase_id);
  const portalElement = document?.getElementById('modal-portal');
  const isSurvey = participationMethod === 'native_survey';

  if (isSurvey) {
    return portalElement && isSmallerThanXlPhone && isSurvey ? (
      createPortal(
        <Box
          display="flex"
          flexDirection="column"
          w="100%"
          zIndex="10000"
          position="fixed"
          bgColor={colors.background}
          h="100vh"
          overflowY="scroll"
        >
          <IdeasNewPageWithJSONForm {...inputProps} />
        </Box>,
        portalElement
      )
    ) : (
      <IdeasNewPageWithJSONForm {...inputProps} />
    );
  }

  return (
    <Data {...inputProps}>
      {(dataProps) => <IdeasNewPage {...inputProps} {...dataProps} />}
    </Data>
  );
});
