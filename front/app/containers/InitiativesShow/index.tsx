import React, { useState, useEffect, useRef } from 'react';
import { isUndefined, isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// router
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import Modal from 'components/UI/Modal';
import FileAttachments from 'components/UI/FileAttachments';
import { Spinner, Box } from '@citizenlab/cl2-component-library';
import SharingButtons from 'components/Sharing/SharingButtons';
import FeatureFlag from 'components/FeatureFlag';
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';

import Topics from 'components/PostShowComponents/Topics';
import Title from 'components/PostShowComponents/Title';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import Body from 'components/PostShowComponents/Body';
import Image from 'components/PostShowComponents/Image';
import Footer from 'components/PostShowComponents/Footer';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import InitiativeMeta from './InitiativeMeta';
import PostedBy from './PostedBy';
import PostedByMobile from './PostedByMobile';
import ActionBar from './ActionBar';
import VoteControl from './VoteControl';
import InitiativeMoreActions from './ActionBar/InitiativeMoreActions';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetInitiativeImages, {
  GetInitiativeImagesChildProps,
} from 'resources/GetInitiativeImages';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

// utils
import { getAddressOrFallbackDMS } from 'utils/map';
import clHistory from 'utils/cl-router/history';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { media, viewportWidths } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import {
  columnsGapDesktop,
  rightColumnWidthDesktop,
  columnsGapTablet,
  rightColumnWidthTablet,
  pageContentMaxWidth,
} from './styleConstants';

// hooks
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeById from 'api/initiatives/useInitiativeById';

// types
import { IInitiativeData } from 'api/initiatives/types';

import Outlet from 'components/Outlet';

const contentFadeInDuration = 250;
const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentFadeInDelay = 150;

const Loading = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}

  &.content-enter {
    opacity: 0;

    &.content-enter-active {
      opacity: 1;
      transition: opacity ${contentFadeInDuration}ms ${contentFadeInEasing}
        ${contentFadeInDelay}ms;
    }
  }

  &.content-enter-done {
    opacity: 1;
  }
`;

const InitiativeContainer = styled.div`
  width: 100%;
  max-width: ${pageContentMaxWidth}px;
  display: flex;
  flex-direction: column;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  padding-top: 60px;
  padding-left: 60px;
  padding-right: 60px;
  position: relative;

  ${media.tablet`
    padding-top: 35px;
  `}

  ${media.phone`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const Content = styled.div`
  width: 100%;
  display: flex;

  ${media.tablet`
    display: block;
  `}
`;

const LeftColumn = styled.div`
  flex: 2;
  margin: 0;
  padding: 0;
  padding-right: ${columnsGapDesktop}px;

  ${media.tablet`
    padding-right: ${columnsGapTablet}px;
  `}

  ${media.tablet`
    padding: 0;
  `}
`;

const StyledTopics = styled(Topics)`
  margin-bottom: 30px;

  ${media.tablet`
    margin-bottom: 5px;
  `}
`;

const InitiativeHeader = styled.div`
  margin-top: -5px;
  margin-bottom: 28px;

  ${media.tablet`
    margin-top: 0px;
    margin-bottom: 45px;
  `}
`;

const InitiativeBannerContainer = styled.div`
  width: 100%;
  height: 163px;
  display: flex;
  align-items: stretch;
  position: relative;
  background: ${({ theme }) => theme.colors.tenantPrimary};

  ${media.phone`
    min-height: 200px;
  `}
`;

const InitiativeBannerImage = styled.div<{ src: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${(props) => props.src});
`;

const InitiativeHeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
`;

const InitiativeBannerContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 40px;
  padding-bottom: 40px;
  z-index: 1;
`;

const MobileMoreActionContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const StyledDropdownMap = styled(DropdownMap)`
  margin-bottom: 40px;

  ${media.tablet`
    margin-bottom: 20px;
  `}
`;

const RightColumn = styled.div`
  flex: 1;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop = styled(RightColumn)`
  flex: 0 0 ${rightColumnWidthDesktop}px;
  width: ${rightColumnWidthDesktop}px;

  ${media.tablet`
    flex: 0 0 ${rightColumnWidthTablet}px;
    width: ${rightColumnWidthTablet}px;
  `}

  ${media.tablet`
    display: none;
  `}
`;

const MetaContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SharingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SharingButtonsMobile = styled(SharingButtons)`
  padding: 0;
  margin: 0;
  margin-top: 40px;

  ${media.desktop`
    display: none;
  `}
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 80px;
`;

const StyledVoteControl = styled(VoteControl)`
  box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 25px;
`;

interface DataProps {
  locale: GetLocaleChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
  authUser: GetAuthUserChildProps;
  windowSize: GetWindowSizeChildProps;
  postOfficialFeedbackPermission: GetPermissionChildProps;
  tenant: GetAppConfigurationChildProps;
}

interface IntiativeInputProps {
  initiative: IInitiativeData;
}

interface InputProps {
  initiativeId: string;
  className?: string;
}

interface Props extends DataProps, InputProps, IntiativeInputProps {}

const InitiativesShow = ({
  locale,
  localize,
  initiativeImages,
  authUser,
  windowSize,
  className,
  postOfficialFeedbackPermission,
  tenant,
  initiativeId,
  intl: { formatMessage },
}: Props & WrappedComponentProps & InjectedLocalized & WithRouterProps) => {
  const [loaded, setLoaded] = useState(false);
  const [initiativeIdForSocialSharing, setInitiativeIdForSocialSharing] =
    useState<string | null>(null);
  const [translateButtonClicked, setTranslateButtonClicked] = useState(false);
  const [
    a11y_pronounceLatestOfficialFeedbackPost,
    setA11y_pronounceLatestOfficialFeedbackPost,
  ] = useState(false);
  const officialFeedbackElement = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const queryParams = new URLSearchParams(window.location.search);
  const newInitiativeId = queryParams.get('new_initiative_id');
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const { data: initiative } = useInitiativeById(initiativeId);

  useEffect(() => {
    if (isString(newInitiativeId)) {
      setTimeout(() => {
        setInitiativeIdForSocialSharing(newInitiativeId);
      }, 1500);

      clHistory.replace(window.location.pathname);
    }
  }, [newInitiativeId]);

  useEffect(() => {
    if (!loaded && !isUndefined(initiativeImages)) {
      setLoaded(true);
    }
  }, [initiative, initiativeImages, loaded]);

  useEffect(() => {
    if (a11y_pronounceLatestOfficialFeedbackPost) {
      timeoutRef.current = setTimeout(
        () => setA11y_pronounceLatestOfficialFeedbackPost(false),
        2000
      );
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [a11y_pronounceLatestOfficialFeedbackPost]);

  const closeInitiativeSocialSharingModal = () => {
    setInitiativeIdForSocialSharing(null);
  };

  const onTranslateInitiative = () => {
    if (translateButtonClicked) {
      trackEventByName(tracks.clickGoBackToOriginalInitiativeCopyButton.name);
    } else {
      trackEventByName(tracks.clickTranslateInitiativeButton.name);
    }
    setTranslateButtonClicked(!translateButtonClicked);
  };

  const onScrollToOfficialFeedback = () => {
    if (officialFeedbackElement.current) {
      officialFeedbackElement.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }

    setA11y_pronounceLatestOfficialFeedbackPost(true);
  };

  const initiativeSettings = !isNilOrError(tenant)
    ? tenant.attributes.settings.initiatives
    : null;
  const votingThreshold = initiativeSettings
    ? initiativeSettings.voting_threshold
    : null;
  const daysLimit = initiativeSettings ? initiativeSettings.days_limit : null;
  let content: JSX.Element | null = null;

  if (
    initiativeSettings &&
    !isNilOrError(initiative) &&
    !isNilOrError(locale) &&
    loaded
  ) {
    const initiativeHeaderImageLarge =
      initiative.data.attributes?.header_bg?.large;
    const authorId = initiative.data.relationships?.author?.data?.id;
    const initiativeTitle = localize(
      initiative.data.attributes?.title_multiloc
    );
    const initiativeImageLarge =
      initiativeImages?.[0]?.attributes?.versions?.large;
    const initiativeGeoPosition =
      initiative.data.attributes?.location_point_geojson;
    const initiativeAddress = getAddressOrFallbackDMS(
      initiative.data.attributes?.location_description,
      initiative.data.attributes?.location_point_geojson
    );
    const topicIds =
      initiative.data.relationships?.topics?.data?.map((item) => item.id) || [];
    const initiativeUrl = location.href;
    const initiativeBody = localize(initiative.data.attributes?.body_multiloc);
    const isDesktop = windowSize ? windowSize > viewportWidths.tablet : true;
    const isNotDesktop = windowSize
      ? windowSize <= viewportWidths.tablet
      : false;
    const utmParams = !isNilOrError(authUser)
      ? {
          source: 'share_initiative',
          campaign: 'share_content',
          content: authUser.id,
        }
      : {
          source: 'share_initiative',
          campaign: 'share_content',
        };

    content = (
      <>
        <InitiativeMeta initiativeId={initiativeId} />

        {isDesktop && initiativeHeaderImageLarge && (
          <InitiativeBannerContainer>
            {initiativeHeaderImageLarge && (
              <InitiativeBannerImage src={initiativeHeaderImageLarge} />
            )}
          </InitiativeBannerContainer>
        )}

        {isNotDesktop && (
          <InitiativeBannerContainer>
            {initiativeHeaderImageLarge && (
              <>
                <InitiativeBannerImage src={initiativeHeaderImageLarge} />
                <InitiativeHeaderOverlay />
              </>
            )}
            <InitiativeBannerContent>
              <MobileMoreActionContainer>
                <InitiativeMoreActions
                  initiative={initiative.data}
                  id="e2e-initiative-more-actions-mobile"
                  color="white"
                />
              </MobileMoreActionContainer>
              <Title
                postId={initiativeId}
                postType="initiative"
                title={initiativeTitle}
                locale={locale}
                translateButtonClicked={translateButtonClicked}
                color="white"
                align="left"
              />
              <PostedByMobile authorId={authorId} />
            </InitiativeBannerContent>
          </InitiativeBannerContainer>
        )}

        {isDesktop && (
          <ActionBar
            initiativeId={initiativeId}
            translateButtonClicked={translateButtonClicked}
            onTranslateInitiative={onTranslateInitiative}
          />
        )}

        {isNotDesktop && (
          <StyledVoteControl
            initiativeId={initiativeId}
            onScrollToOfficialFeedback={onScrollToOfficialFeedback}
          />
        )}

        <InitiativeContainer>
          <Content>
            <LeftColumn>
              <StyledTopics postType="initiative" topicIds={topicIds} />

              {isDesktop && (
                <InitiativeHeader>
                  <Title
                    postType="initiative"
                    postId={initiativeId}
                    title={initiativeTitle}
                    locale={locale}
                    translateButtonClicked={translateButtonClicked}
                  />
                </InitiativeHeader>
              )}

              {isDesktop && (
                <PostedBy authorId={authorId} showAboutInitiatives />
              )}

              {initiativeImageLarge && (
                <Image
                  src={initiativeImageLarge}
                  alt=""
                  id="e2e-initiative-image"
                />
              )}

              <Outlet
                id="app.containers.InitiativesShow.left"
                windowSize={windowSize}
                translateButtonClicked={translateButtonClicked}
                onClick={onTranslateInitiative}
                initiative={initiative.data}
                locale={locale}
              />

              {initiativeGeoPosition && initiativeAddress && (
                <StyledDropdownMap
                  address={initiativeAddress}
                  position={initiativeGeoPosition}
                />
              )}

              <ScreenReaderOnly>
                <FormattedMessage
                  tagName="h2"
                  {...messages.invisibleTitleContent}
                />
              </ScreenReaderOnly>

              <Body
                postId={initiativeId}
                postType="initiative"
                locale={locale}
                body={initiativeBody}
                translateButtonClicked={translateButtonClicked}
              />

              {!isNilOrError(initiativeFiles) && (
                <Box mb="25px">
                  <FileAttachments files={initiativeFiles.data} />
                </Box>
              )}

              <div ref={officialFeedbackElement}>
                <StyledOfficialFeedback
                  postId={initiativeId}
                  postType="initiative"
                  permissionToPost={postOfficialFeedbackPermission}
                  a11y_pronounceLatestOfficialFeedbackPost={
                    a11y_pronounceLatestOfficialFeedbackPost
                  }
                />
              </div>

              {isNotDesktop && (
                <SharingButtonsMobile
                  context="initiative"
                  url={initiativeUrl}
                  twitterMessage={formatMessage(messages.twitterMessage, {
                    initiativeTitle,
                  })}
                  facebookMessage={formatMessage(messages.facebookMessage, {
                    initiativeTitle,
                  })}
                  whatsAppMessage={formatMessage(messages.whatsAppMessage, {
                    initiativeTitle,
                  })}
                  emailSubject={formatMessage(messages.emailSharingSubject, {
                    initiativeTitle,
                  })}
                  emailBody={formatMessage(messages.emailSharingBody, {
                    initiativeUrl,
                    initiativeTitle,
                  })}
                  utmParams={utmParams}
                />
              )}
            </LeftColumn>

            {isDesktop && (
              <RightColumnDesktop>
                <MetaContent>
                  <ScreenReaderOnly>
                    <FormattedMessage
                      tagName="h2"
                      {...messages.a11y_voteControl}
                    />
                  </ScreenReaderOnly>
                  <VoteControl
                    initiativeId={initiativeId}
                    onScrollToOfficialFeedback={onScrollToOfficialFeedback}
                    id="e2e-initiative-vote-control"
                  />
                  <SharingWrapper>
                    <SharingButtons
                      id="e2e-initiative-sharing-component"
                      context="initiative"
                      url={initiativeUrl}
                      facebookMessage={formatMessage(messages.facebookMessage, {
                        initiativeTitle,
                      })}
                      twitterMessage={formatMessage(messages.twitterMessage, {
                        initiativeTitle,
                      })}
                      whatsAppMessage={formatMessage(messages.whatsAppMessage, {
                        initiativeTitle,
                      })}
                      emailSubject={formatMessage(
                        messages.emailSharingSubject,
                        { initiativeTitle }
                      )}
                      emailBody={formatMessage(messages.emailSharingBody, {
                        initiativeUrl,
                        initiativeTitle,
                      })}
                      utmParams={utmParams}
                    />
                  </SharingWrapper>
                </MetaContent>
              </RightColumnDesktop>
            )}
          </Content>
        </InitiativeContainer>

        {loaded && <Footer postId={initiativeId} postType="initiative" />}
      </>
    );
  }

  return (
    <>
      {!loaded && (
        <Loading>
          <Spinner />
        </Loading>
      )}

      <CSSTransition
        classNames="content"
        in={loaded}
        timeout={{
          enter: contentFadeInDuration + contentFadeInDelay,
          exit: 0,
        }}
        enter={true}
        exit={false}
      >
        <Container id="e2e-initiative-show" className={className}>
          {content}
        </Container>
      </CSSTransition>

      <FeatureFlag name="initiativeflow_social_sharing">
        <Modal
          opened={!!initiativeIdForSocialSharing}
          close={closeInitiativeSocialSharingModal}
          hasSkipButton={true}
          skipText={<FormattedMessage {...messages.skipSharing} />}
        >
          {initiativeIdForSocialSharing && (
            <SharingModalContent
              postType="initiative"
              postId={initiativeIdForSocialSharing}
              title={formatMessage(messages.shareTitle)}
              subtitle={formatMessage(messages.shareSubtitle, {
                votingThreshold,
                daysLimit,
              })}
            />
          )}
        </Modal>
      </FeatureFlag>
    </>
  );
};

const InitiativesShowWithHOCs = injectLocalize<Props>(
  withRouter(injectIntl(InitiativesShow))
);

const Data = adopt<DataProps, InputProps & IntiativeInputProps>({
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  windowSize: <GetWindowSize />,
  initiativeImages: ({ initiativeId, render }) => (
    <GetInitiativeImages initiativeId={initiativeId}>
      {render}
    </GetInitiativeImages>
  ),
  postOfficialFeedbackPermission: ({ initiative, render }) => (
    <GetPermission
      item={!isNilOrError(initiative) ? initiative : null}
      action="moderate"
    >
      {render}
    </GetPermission>
  ),
});

export default (inputProps: InputProps) => {
  // TODO: Move this logic to InitiativesShow after working on the officialFeedbacks. It's dependency here is why we need to pass in the initiative to the Data component
  const { data: initiative } = useInitiativeById(inputProps.initiativeId);
  if (!initiative) return null;

  return (
    <Data {...inputProps} initiative={initiative.data}>
      {(dataProps) => (
        <InitiativesShowWithHOCs
          {...inputProps}
          {...dataProps}
          initiative={initiative.data}
        />
      )}
    </Data>
  );
};
