import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// router
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// components
import FileAttachments from 'components/UI/FileAttachments';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import SharingButtons from 'components/Sharing/SharingButtons';

import Topics from 'components/PostShowComponents/Topics';
import Title from 'components/PostShowComponents/Title';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import Body from 'components/PostShowComponents/Body';
import Image from 'components/PostShowComponents/Image';
import Footer from 'components/PostShowComponents/Footer';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import InitiativeMeta from './InitiativeMeta';
import PostedBy from './PostedBy';
import ActionBar from './ActionBar';
import ReactionControl from './ReactionControl';
import Outlet from 'components/Outlet';
const Modals = lazy(() => import('./modals'));

// utils
import { getAddressOrFallbackDMS } from 'utils/map';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import useLocalize from 'hooks/useLocalize';

// style
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import {
  columnsGapDesktop,
  rightColumnWidthDesktop,
  pageContentMaxWidth,
} from './styleConstants';

// hooks
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeById from 'api/initiatives/useInitiativeById';

// types
import useInitiativeReviewRequired from 'hooks/useInitiativeReviewRequired';
import RequestToCosponsor from './RequestToCosponsor';
import Cosponsors from './Cosponsors';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'api/me/useAuthUser';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import { usePermission } from 'services/permissions';
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import Mobile from './Mobile';

const contentFadeInDuration = 250;
const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentFadeInDelay = 150;

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );

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
`;

const Content = styled.div`
  width: 100%;
  display: flex;
`;

const LeftColumn = styled.div`
  flex: 2;
  margin: 0;
  padding: 0;
  padding-right: ${columnsGapDesktop}px;
`;

const StyledTopics = styled(Topics)`
  margin-bottom: 30px;
`;

const InitiativeHeader = styled.div`
  margin-top: -5px;
  margin-bottom: 28px;
`;

const InitiativeBannerContainer = styled.div`
  width: 100%;
  height: 163px;
  display: flex;
  align-items: stretch;
  position: relative;
  background: ${({ theme }) => theme.colors.tenantPrimary};
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

const StyledDropdownMap = styled(DropdownMap)`
  margin-bottom: 40px;
`;

const RightColumn = styled.div`
  flex: 1;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop = styled(RightColumn)`
  flex: 0 0 ${rightColumnWidthDesktop}px;
  width: ${rightColumnWidthDesktop}px;
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

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 80px;
`;

interface Props {
  initiativeId: string;
  className?: string;
}

const InitiativesShow = ({ className, initiativeId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { data: authUser } = useAuthUser();
  const { data: initiativeImages } = useInitiativeImages(initiativeId);
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const postOfficialFeedbackPermission = usePermission({
    item: !isNilOrError(initiative) ? initiative.data : null,
    action: 'moderate',
  });
  const [searchParams] = useSearchParams();
  const newInitiativeId = searchParams.get('new_initiative_id');

  const [initiativeIdForSocialSharing, setInitiativeIdForSocialSharing] =
    useState<string | null>(null);
  const [translateButtonClicked, setTranslateButtonClicked] = useState(false);
  const [
    a11y_pronounceLatestOfficialFeedbackPost,
    setA11y_pronounceLatestOfficialFeedbackPost,
  ] = useState(false);

  const officialFeedbackElement = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const initiativeReviewRequired = useInitiativeReviewRequired();

  const showSharingOptions = initiativeReviewRequired
    ? initiative?.data.attributes.public
    : true;

  useEffect(() => {
    if (typeof newInitiativeId === 'string') {
      setTimeout(() => {
        setInitiativeIdForSocialSharing(newInitiativeId);
      }, 1500);

      removeSearchParams(['new_initiative_id']);
    }
  }, [newInitiativeId]);

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

  if (!initiative || isNilOrError(locale) || !initiativeImages) return null;

  const initiativeHeaderImageLarge = initiative.data.attributes.header_bg.large;
  const authorId = initiative.data.relationships.author.data?.id;
  const initiativeTitle = localize(initiative.data.attributes.title_multiloc);
  const initiativeImageLarge =
    initiativeImages.data[0]?.attributes.versions.large;
  const initiativeGeoPosition =
    initiative.data.attributes.location_point_geojson;
  const initiativeAddress = getAddressOrFallbackDMS(
    initiative.data.attributes.location_description,
    initiative.data.attributes.location_point_geojson
  );
  const initiativeUrl = location.href;
  const utmParams = !isNilOrError(authUser)
    ? {
        source: 'share_initiative',
        campaign: 'share_content',
        content: authUser.data.id,
      }
    : {
        source: 'share_initiative',
        campaign: 'share_content',
      };

  return (
    <>
      <InitiativeMeta initiativeId={initiativeId} />
      {isSmallerThanTablet ? (
        <Mobile
          initiativeId={initiativeId}
          translateButtonClicked={translateButtonClicked}
          a11y_pronounceLatestOfficialFeedbackPost={
            a11y_pronounceLatestOfficialFeedbackPost
          }
          onScrollToOfficialFeedback={onScrollToOfficialFeedback}
          onTranslateInitiative={onTranslateInitiative}
        />
      ) : (
        <Container id="e2e-initiative-show" className={className}>
          {initiativeHeaderImageLarge && (
            <InitiativeBannerContainer>
              <InitiativeBannerImage src={initiativeHeaderImageLarge} />
            </InitiativeBannerContainer>
          )}
          <ActionBar
            initiativeId={initiativeId}
            translateButtonClicked={translateButtonClicked}
            onTranslateInitiative={onTranslateInitiative}
          />
          <InitiativeContainer>
            <Content>
              <LeftColumn>
                <StyledTopics
                  postType="initiative"
                  topicIds={
                    initiative.data.relationships?.topics?.data?.map(
                      (item) => item.id
                    ) || []
                  }
                />
                <InitiativeHeader>
                  <Title
                    postType="initiative"
                    postId={initiativeId}
                    title={initiativeTitle}
                    locale={locale}
                    translateButtonClicked={translateButtonClicked}
                  />
                </InitiativeHeader>
                <PostedBy
                  anonymous={initiative.data.attributes.anonymous}
                  authorId={authorId}
                  showAboutInitiatives
                />
                {initiativeImageLarge && (
                  <Image
                    src={initiativeImageLarge}
                    alt=""
                    id="e2e-initiative-image"
                  />
                )}
                <Outlet
                  id="app.containers.InitiativesShow.left"
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
                <Box mb="40px">
                  <Body
                    postId={initiativeId}
                    postType="initiative"
                    body={localize(initiative.data.attributes?.body_multiloc)}
                    translateButtonClicked={translateButtonClicked}
                  />
                </Box>
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
              </LeftColumn>

              <RightColumnDesktop>
                <MetaContent>
                  <ScreenReaderOnly>
                    <FormattedMessage
                      tagName="h2"
                      {...messages.a11y_voteControl}
                    />
                  </ScreenReaderOnly>
                  <ReactionControl
                    initiativeId={initiativeId}
                    onScrollToOfficialFeedback={onScrollToOfficialFeedback}
                    id="e2e-initiative-reaction-control"
                  />
                  <RequestToCosponsor initiativeId={initiativeId} />
                  <Cosponsors initiativeId={initiativeId} />
                  {showSharingOptions && (
                    <SharingWrapper>
                      <SharingButtons
                        id="e2e-initiative-sharing-component"
                        context="initiative"
                        url={initiativeUrl}
                        facebookMessage={formatMessage(
                          messages.facebookMessage,
                          {
                            initiativeTitle,
                          }
                        )}
                        twitterMessage={formatMessage(messages.twitterMessage, {
                          initiativeTitle,
                        })}
                        whatsAppMessage={formatMessage(
                          messages.whatsAppMessage,
                          {
                            initiativeTitle,
                          }
                        )}
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
                  )}
                </MetaContent>
              </RightColumnDesktop>
            </Content>
          </InitiativeContainer>
          <Suspense fallback={<LoadingComments />}>
            <Footer postId={initiativeId} postType="initiative" />
          </Suspense>
        </Container>
      )}
      <Suspense fallback={null}>
        <Modals
          closeInitiativeSocialSharingModal={closeInitiativeSocialSharingModal}
          initiativeIdForSocialSharing={initiativeIdForSocialSharing}
        />
      </Suspense>
    </>
  );
};

export default InitiativesShow;
