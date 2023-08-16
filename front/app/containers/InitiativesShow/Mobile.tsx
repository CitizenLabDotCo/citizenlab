import React, { useRef, Suspense } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import FileAttachments from 'components/UI/FileAttachments';
import { Box } from '@citizenlab/cl2-component-library';
import SharingButtons from 'components/Sharing/SharingButtons';

import Topics from 'components/PostShowComponents/Topics';
import Title from 'components/PostShowComponents/Title';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import Body from 'components/PostShowComponents/Body';
import Image from 'components/PostShowComponents/Image';
import Footer from 'components/PostShowComponents/Footer';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import PostedByMobile from './PostedByMobile';
import ReactionControl from './ReactionControl';
import InitiativeMoreActions from './ActionBar/InitiativeMoreActions';
import Outlet from 'components/Outlet';

// utils
import { getAddressOrFallbackDMS } from 'utils/map';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import useLocalize from 'hooks/useLocalize';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { columnsGapTablet, pageContentMaxWidth } from './styleConstants';

// hooks
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeById from 'api/initiatives/useInitiativeById';

// types
import useInitiativeReviewRequired from 'hooks/useInitiativeReviewRequired';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'api/me/useAuthUser';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import { usePermission } from 'services/permissions';
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';

const contentFadeInDuration = 250;
const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentFadeInDelay = 150;

const Container = styled.main`
  display: flex;
  flex-direction: column;

  ${(props) => `
    min-height: calc(100vh - ${props.theme.mobileMenuHeight}px - ${props.theme.mobileTopBarHeight}px);
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
  padding-top: 35px;
  padding-left: 60px;
  padding-right: 60px;
  position: relative;

  ${media.phone`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const Content = styled.div`
  display: block;
`;

const LeftColumn = styled.div`
  padding-right: ${columnsGapTablet}px;
  padding: 0;
`;

const StyledTopics = styled(Topics)`
  margin-bottom: 5px;
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
  margin-bottom: 20px;
`;

const SharingButtonsMobile = styled(SharingButtons)`
  padding: 0;
  margin: 0;
  margin-top: 40px;
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 80px;
`;

const StyledReactionControl = styled(ReactionControl)`
  box-shadow: 1px 0px 15px rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 25px;
`;

interface Props {
  initiativeId: string;
  className?: string;
  translateButtonClicked: boolean;
  onScrollToOfficialFeedback: () => void;
  onTranslateInitiative: () => void;
  a11y_pronounceLatestOfficialFeedbackPost: boolean;
}

const Mobile = ({
  className,
  initiativeId,
  translateButtonClicked,
  onScrollToOfficialFeedback,
  onTranslateInitiative,
  a11y_pronounceLatestOfficialFeedbackPost,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const locale = useLocale();
  const { data: authUser } = useAuthUser();
  const { data: initiativeImages } = useInitiativeImages(initiativeId);
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const postOfficialFeedbackPermission = usePermission({
    item: !isNilOrError(initiative) ? initiative.data : null,
    action: 'moderate',
  });
  const officialFeedbackElement = useRef<HTMLDivElement>(null);
  const initiativeReviewRequired = useInitiativeReviewRequired();

  const showSharingOptions = initiativeReviewRequired
    ? initiative?.data.attributes.public
    : true;

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
    <Container id="e2e-initiative-show" className={className}>
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

      <StyledReactionControl
        initiativeId={initiativeId}
        onScrollToOfficialFeedback={onScrollToOfficialFeedback}
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

            {showSharingOptions && (
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
        </Content>
      </InitiativeContainer>

      <Suspense fallback={<LoadingComments />}>
        <Footer postId={initiativeId} postType="initiative" />
      </Suspense>
    </Container>
  );
};

export default Mobile;
