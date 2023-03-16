import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { adopt } from 'react-adopt';
import { parse } from 'qs';

// libraries
import clHistory from 'utils/cl-router/history';

// components
import IdeasNewButtonBar from './IdeasNewButtonBar';
import NewIdeaForm from './NewIdeaForm';
import IdeasNewMeta from './IdeasNewMeta';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';

// feature flag variant
import IdeasNewPageWithJSONForm from './WithJSONForm';

// services
import useAddIdea from 'api/ideas/useAddIdea';
import { addIdeaFile } from 'services/ideaFiles';
import { addIdeaImage } from 'services/ideaImages';
import {
  globalState as globalStateService,
  IGlobalStateService,
  IIdeasPageGlobalState,
} from 'services/globalState';
import { isAdmin, isSuperAdmin, isModerator } from 'services/permissions/roles';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
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
import useFeatureFlag from 'hooks/useFeatureFlag';
import { UploadFile } from 'typings';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import { getParticipationMethod } from 'utils/participationMethodUtils';

// utils
import { isEmpty, isNumber, get, isError } from 'lodash-es';
import { isNilOrError, isUnauthorizedError } from 'utils/helperUtils';
import { useLocation, useParams } from 'react-router-dom';
import { IIdeaAdd } from 'api/ideas/types';

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
  previousPathName: string | null;
}

interface Props extends InputProps, DataProps {}

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

const IdeasNewPage = ({ locale, appConfiguration, authUser }: Props) => {
  const { mutateAsync: addIdea } = useAddIdea();
  const globalState = useRef<IGlobalStateService<IIdeasPageGlobalState>>();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const project = useProject({ projectSlug: slug });
  useEffect(() => {
    globalState.current = globalStateService.init(
      'IdeasNewPage',
      initialGlobalState
    );
  }, []);

  useEffect(() => {
    const { lat, lng } = parse(location.search, {
      ignoreQueryPrefix: true,
      decoder: (str, _defaultEncoder, _charset, type) => {
        return type === 'value' ? parseFloat(str) : str;
      },
    }) as { [key: string]: string | number };

    const redirectIfNotPermittedOnPage = () => {
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
        clHistory.replace(!authUser ? '/sign-up' : '/');
      }
    };

    redirectIfNotPermittedOnPage();

    if (isNumber(lat) && isNumber(lng)) {
      reverseGeocode(lat, lng).then((address) => {
        globalState.current &&
          globalState.current.set({
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
  }, [authUser, location.search, project]);

  const handleOnIdeaSubmit = async () => {
    const { phase_id } = parse(location.search, {
      ignoreQueryPrefix: true,
    }) as { [key: string]: string };
    if (globalState.current) {
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
      } = await globalState.current.get();

      if (
        !isNilOrError(locale) &&
        !isNilOrError(authUser) &&
        !isNilOrError(project)
      ) {
        globalState.current.set({ submitError: false, processing: true });

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
          if (title && description) {
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
                globalState.current.set({
                  fileOrImageError: true,
                });
              }
            }
            const { fileOrImageError } = await globalState.current.get();
            const newUrl = `/ideas/${idea.data.attributes.slug}?new_idea_id=${ideaId}`;
            if (fileOrImageError) {
              setTimeout(() => {
                clHistory.push(newUrl);
              }, 4000);
            } else {
              clHistory.push(newUrl);
            }
          }
        } catch (error) {
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
              globalState.current.set({
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
              globalState.current.set({
                descriptionProfanityError,
              });
            }
          }

          globalState.current.set({ processing: false, submitError: true });
        }
      }
    }
  };

  const onTitleChange = (title: string) => {
    globalState.current &&
      globalState.current.set({
        title,
        titleProfanityError: false,
      });
  };

  const onTagsChange = (selectedTopics: string[]) => {
    globalState.current && globalState.current.set({ selectedTopics });
  };

  const onAddressChange = (address: string) => {
    globalState.current && globalState.current.set({ position: address });
  };

  const onImageFileAdd = (imageFile: UploadFile[]) => {
    globalState.current &&
      globalState.current.set({
        imageFile: [imageFile[0]],
      });
  };

  const onImageFileRemove = () => {
    globalState.current &&
      globalState.current.set({
        imageFile: [],
      });
  };

  const onDescriptionChange = (description: string) => {
    globalState.current &&
      globalState.current.set({
        description,
        descriptionProfanityError: false,
      });
  };

  const onIdeaFilesChange = (ideaFiles: UploadFile[]) => {
    globalState.current &&
      globalState.current.set({
        ideaFiles,
      });
  };

  if (!isNilOrError(project)) {
    return (
      <Container id="e2e-idea-new-page">
        <IdeasNewMeta />
        <PageContainer className="ideaForm">
          <NewIdeaForm
            onSubmit={handleOnIdeaSubmit}
            projectId={project.id}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            onImageFileAdd={onImageFileAdd}
            onImageFileRemove={onImageFileRemove}
            onTagsChange={onTagsChange}
            onAddressChange={onAddressChange}
            onIdeaFilesChange={onIdeaFilesChange}
          />
        </PageContainer>
        <ButtonBarContainer>
          <IdeasNewButtonBar form="idea-form" onSubmit={handleOnIdeaSubmit} />
        </ButtonBarContainer>
      </Container>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  appConfiguration: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  previousPathName: ({ render }) => (
    <PreviousPathnameContext.Consumer>
      {render as any}
    </PreviousPathnameContext.Consumer>
  ),
});

export default (inputProps: InputProps) => {
  const { slug } = useParams();
  const isDynamicIdeaFormEnabled = useFeatureFlag({
    name: 'dynamic_idea_form',
  });
  const isSmallerThanXlPhone = useBreakpoint('phone');
  const project = useProject({ projectSlug: slug });
  const phases = usePhases(project?.id);
  const { phase_id } = parse(location.search, {
    ignoreQueryPrefix: true,
  }) as { [key: string]: string };

  if (isUnauthorizedError(project)) {
    return <Unauthorized />;
  }

  if (isError(project)) {
    return <PageNotFound />;
  }

  const participationMethod = getParticipationMethod(project, phases, phase_id);
  const portalElement = document?.getElementById('modal-portal');
  const isSurvey = participationMethod === 'native_survey';

  if (isDynamicIdeaFormEnabled || isSurvey) {
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
};
