import React, { useRef } from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import useInitiativeOfficialFeedback from 'api/initiative_official_feedback/useInitiativeOfficialFeedback';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAuthUser from 'api/me/useAuthUser';

import useLocalize from 'hooks/useLocalize';

import useShowCosponsorshipReminder from 'containers/InitiativesShow/hooks/useShowCosponsorshipReminder';

import Outlet from 'components/Outlet';
import Body from 'components/PostShowComponents/Body';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import Image from 'components/PostShowComponents/Image';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import Title from 'components/PostShowComponents/Title';
import Topics from 'components/PostShowComponents/Topics';
import SharingButtons from 'components/Sharing/SharingButtons';
import FileAttachments from 'components/UI/FileAttachments';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getAddressOrFallbackDMS } from 'utils/map';
import { usePermission } from 'utils/permissions';

import ActionBar from './ActionBar';
import CosponsorShipReminder from './CosponsorShipReminder';
import CosponsorsSection from './CosponsorsSection';
import useInitiativeReviewRequired from './hooks/useInitiativeReviewRequired';
import InitiativeBanner from './InitiativeBanner';
import messages from './messages';
import PostedBy from './PostedBy';
import ReactionControl from './ReactionControl';
import {
  columnsGapDesktop,
  columnsGapTablet,
  rightColumnWidthDesktop,
  pageContentMaxWidth,
  contentFadeInDelay,
  contentFadeInDuration,
  contentFadeInEasing,
} from './styleConstants';

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
  padding-top: 60px;
  padding-left: 60px;
  padding-right: 60px;
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

  ${media.tablet`
    padding-right: ${columnsGapTablet}px;
  `}
`;

const StyledTopics = styled(Topics)`
  margin-bottom: 30px;
`;

const InitiativeHeader = styled.div`
  margin-top: -5px;
  margin-bottom: 28px;
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
  align-items: center;
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 80px;
`;

interface Props {
  initiativeId: string;
  className?: string;
  translateButtonClicked: boolean;
  onScrollToOfficialFeedback: () => void;
  onTranslateInitiative: () => void;
  a11y_pronounceLatestOfficialFeedbackPost: boolean;
}

const LargerThanPhone = ({
  className,
  initiativeId,
  translateButtonClicked,
  onScrollToOfficialFeedback,
  onTranslateInitiative,
  a11y_pronounceLatestOfficialFeedbackPost,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const { data: initiativeImages } = useInitiativeImages(initiativeId);
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const showCosponsorshipReminder = useShowCosponsorshipReminder(initiativeId);
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

  if (!initiative || !initiativeImages) {
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
      {initiativeHeaderImageLarge && (
        <InitiativeBanner
          initiativeHeaderImageLarge={initiativeHeaderImageLarge}
        />
      )}
      <ActionBar
        initiativeId={initiativeId}
        translateButtonClicked={translateButtonClicked}
        onTranslateInitiative={onTranslateInitiative}
      />
      <InitiativeContainer>
        <Content>
          <LeftColumn>
            {showCosponsorshipReminder && (
              <Box mb="28px">
                <CosponsorShipReminder initiativeId={initiativeId} />
              </Box>
            )}
            {initiative.data.relationships.topics.data.length > 0 && (
              <StyledTopics
                postType="initiative"
                postTopicIds={initiative.data.relationships.topics.data.map(
                  (topic) => topic.id
                )}
              />
            )}
            <InitiativeHeader>
              <Title
                postType="initiative"
                postId={initiativeId}
                title={initiativeTitle}
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
            {initiativeFiles && initiativeFiles.data.length > 0 && (
              <Box mb="25px">
                <FileAttachments files={initiativeFiles.data} />
              </Box>
            )}
            <Box
              mb={hasOfficialFeedback ? '48px' : '0'}
              ref={officialFeedbackElement}
            >
              <StyledOfficialFeedback
                postId={initiativeId}
                postType="initiative"
                permissionToPost={postOfficialFeedbackPermission}
                a11y_pronounceLatestOfficialFeedbackPost={
                  a11y_pronounceLatestOfficialFeedbackPost
                }
              />
            </Box>
          </LeftColumn>
          <RightColumnDesktop>
            <MetaContent>
              <ScreenReaderOnly>
                <FormattedMessage tagName="h2" {...messages.a11y_voteControl} />
              </ScreenReaderOnly>
              <ReactionControl
                initiative={initiative}
                onScrollToOfficialFeedback={onScrollToOfficialFeedback}
                id="e2e-initiative-reaction-control"
              />
              <CosponsorsSection initiativeId={initiativeId} />
              {showSharingOptions && (
                <SharingWrapper>
                  <SharingButtons
                    id="e2e-initiative-sharing-component"
                    context="initiative"
                    url={initiativeUrl}
                    twitterMessage={formatMessage(messages.twitterMessage, {
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
                </SharingWrapper>
              )}
            </MetaContent>
          </RightColumnDesktop>
        </Content>
      </InitiativeContainer>
    </Container>
  );
};

export default LargerThanPhone;
