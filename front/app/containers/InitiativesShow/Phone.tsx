import React, { useRef } from 'react';
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
import { ScreenReaderOnly } from 'utils/a11y';
import { pageContentMaxWidth } from './styleConstants';

// hooks
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeById from 'api/initiatives/useInitiativeById';

// types
import useInitiativeReviewRequired from './hooks/useInitiativeReviewRequired';
import useLocale from 'hooks/useLocale';
import useAuthUser from 'api/me/useAuthUser';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import { usePermission } from 'services/permissions';
import {
  contentFadeInDelay,
  contentFadeInDuration,
  contentFadeInEasing,
} from '.';
import useInitiativeOfficialFeedback from 'api/initiative_official_feedback/useInitiativeOfficialFeedback';
import RequestToCosponsor from './RequestToCosponsor';
import Cosponsors from './Cosponsors';
import InitiativeBanner from './InitiativeBanner';
import useShowCosponsorshipReminder from 'containers/InitiativesShow/hooks/useShowCosponsorshipReminder';
import CosponsorShipReminder from './CosponsorShipReminder';

const paddingSide = '32px';

const Container = styled.main`
  display: flex;
  flex-direction: column;

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
  padding-top: 25px;
  padding-left: ${paddingSide};
  padding-right: ${paddingSide};
`;

const InitiativeBannerContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 60px;
  padding-right: 60px;
`;

const MobileMoreActionContainer = styled.div`
  position: absolute;
  top: 40px;
  right: 60px;
`;

const StyledDropdownMap = styled(DropdownMap)`
  margin-bottom: 32px;
`;

interface Props {
  initiativeId: string;
  className?: string;
  translateButtonClicked: boolean;
  onScrollToOfficialFeedback: () => void;
  onTranslateInitiative: () => void;
  a11y_pronounceLatestOfficialFeedbackPost: boolean;
}

const Phone = ({
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
  const showCosponsorShipReminder = useShowCosponsorshipReminder(initiativeId);
  const { data: authUser } = useAuthUser();
  const { data: initiativeImages } = useInitiativeImages(initiativeId);
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const postOfficialFeedbackPermission = usePermission({
    item: !isNilOrError(initiative) ? initiative.data : null,
    action: 'moderate',
  });
  const { data: initiativeFeedbacks } = useInitiativeOfficialFeedback({
    initiativeId,
    pageSize: 1,
  });
  const officialFeedbackElement = useRef<HTMLDivElement>(null);
  const initiativeReviewRequired = useInitiativeReviewRequired();
  const officialFeedbacksList =
    initiativeFeedbacks?.pages.flatMap((page) => page.data) || [];
  const hasOfficialFeedback = officialFeedbacksList.length > 0;
  const showSharingOptions = initiativeReviewRequired
    ? initiative?.data.attributes.public
    : true;

  if (!initiative || isNilOrError(locale) || !initiativeImages) {
    return null;
  }

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

  return (
    <Container className={className}>
      {showCosponsorShipReminder && (
        <CosponsorShipReminder initiativeId={initiativeId} />
      )}
      <InitiativeBanner initiativeHeaderImageLarge={initiativeHeaderImageLarge}>
        <InitiativeBannerContent>
          <MobileMoreActionContainer>
            <InitiativeMoreActions
              initiative={initiative.data}
              id="e2e-initiative-more-actions-mobile"
              color="white"
            />
          </MobileMoreActionContainer>
          {/* Z-index is needed for when we have a banner image */}
          <Box position="absolute" zIndex="1">
            <Box mb="8px">
              <Title
                postId={initiativeId}
                postType="initiative"
                title={initiativeTitle}
                locale={locale}
                translateButtonClicked={translateButtonClicked}
                color="white"
                align="left"
              />
            </Box>
            <PostedByMobile authorId={authorId} />
          </Box>
        </InitiativeBannerContent>
      </InitiativeBanner>
      <InitiativeContainer>
        <Box mb="20px">
          <Topics
            postType="initiative"
            postTopicIds={initiative.data.relationships.topics.data.map(
              (topic) => topic.id
            )}
          />
        </Box>
        {initiativeImageLarge && (
          <Image src={initiativeImageLarge} alt="" id="e2e-initiative-image" />
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
          <FormattedMessage tagName="h2" {...messages.invisibleTitleContent} />
        </ScreenReaderOnly>
        <Box mb="32px">
          <Body
            postId={initiativeId}
            postType="initiative"
            body={localize(initiative.data.attributes?.body_multiloc)}
            translateButtonClicked={translateButtonClicked}
          />
        </Box>
        {initiativeFiles && initiativeFiles.data.length > 0 && (
          <Box mb="20px">
            <FileAttachments files={initiativeFiles.data} />
          </Box>
        )}
        <Box
          mb={hasOfficialFeedback ? '80px' : '0'}
          ref={officialFeedbackElement}
        >
          <OfficialFeedback
            postId={initiativeId}
            postType="initiative"
            permissionToPost={postOfficialFeedbackPermission}
            a11y_pronounceLatestOfficialFeedbackPost={
              a11y_pronounceLatestOfficialFeedbackPost
            }
          />
        </Box>
        {showSharingOptions && (
          <Box mb="48px">
            <SharingButtons
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
              utmParams={
                !isNilOrError(authUser)
                  ? {
                      source: 'share_initiative',
                      campaign: 'share_content',
                      content: authUser.data.id,
                    }
                  : {
                      source: 'share_initiative',
                      campaign: 'share_content',
                    }
              }
            />
          </Box>
        )}
      </InitiativeContainer>
      <Box px={paddingSide}>
        <ReactionControl
          initiativeId={initiativeId}
          onScrollToOfficialFeedback={onScrollToOfficialFeedback}
        />
      </Box>
      <Box px={paddingSide}>
        <RequestToCosponsor initiativeId={initiativeId} />
      </Box>
      <Box px={paddingSide}>
        <Cosponsors initiativeId={initiativeId} />
      </Box>
    </Container>
  );
};

export default Phone;
