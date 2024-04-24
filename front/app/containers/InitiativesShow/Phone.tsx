import React, { useRef } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';
import useInitiativeOfficialFeedback from 'api/initiative_official_feedback/useInitiativeOfficialFeedback';
import useInitiativeById from 'api/initiatives/useInitiativeById';

import useLocalize from 'hooks/useLocalize';

import useShowCosponsorshipReminder from 'containers/InitiativesShow/hooks/useShowCosponsorshipReminder';

import Outlet from 'components/Outlet';
import Body from 'components/PostShowComponents/Body';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import Image from 'components/PostShowComponents/Image';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import Title from 'components/PostShowComponents/Title';
import Topics from 'components/PostShowComponents/Topics';
import FileAttachments from 'components/UI/FileAttachments';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getAddressOrFallbackDMS } from 'utils/map';
import { usePermission } from 'utils/permissions';

import InitiativeMoreActions from './ActionBar/InitiativeMoreActions';
import Cosponsors from './Cosponsors';
import CosponsorShipReminder from './CosponsorShipReminder';
import InitiativeBanner from './InitiativeBanner';
import messages from './messages';
import PostedByMobile from './PostedByMobile';
import ReactionControl from './ReactionControl';
import RequestToCosponsor from './RequestToCosponsor';
import {
  pageContentMaxWidth,
  contentFadeInDelay,
  contentFadeInDuration,
  contentFadeInEasing,
} from './styleConstants';

const padding = '32px';

const Container = styled.div`
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
  padding-top: ${padding};
  padding-left: ${padding};
  padding-right: ${padding};
`;

const StyledDropdownMap = styled(DropdownMap)`
  margin-bottom: 32px;
`;

interface Props {
  initiativeId: string;
  translateButtonClicked: boolean;
  onScrollToOfficialFeedback: () => void;
  onTranslateInitiative: () => void;
  a11y_pronounceLatestOfficialFeedbackPost: boolean;
}

const Phone = ({
  initiativeId,
  translateButtonClicked,
  onScrollToOfficialFeedback,
  onTranslateInitiative,
  a11y_pronounceLatestOfficialFeedbackPost,
}: Props) => {
  const localize = useLocalize();
  const isSmallerThanTablet = useBreakpoint('tablet');

  const showCosponsorShipReminder = useShowCosponsorshipReminder(initiativeId);
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
  const officialFeedbacksList =
    initiativeFeedbacks?.pages.flatMap((page) => page.data) || [];
  const hasOfficialFeedback = officialFeedbacksList.length > 0;

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

  return (
    <Container>
      {showCosponsorShipReminder && (
        <CosponsorShipReminder initiativeId={initiativeId} />
      )}
      <InitiativeBanner initiativeHeaderImageLarge={initiativeHeaderImageLarge}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          w="100%"
          px="32px"
        >
          <Box top="40px" w="100%" display="flex" justifyContent="flex-end">
            <InitiativeMoreActions
              initiative={initiative.data}
              id="e2e-initiative-more-actions-mobile"
              color="white"
            />
          </Box>
          {/* Z-index is needed for when we have a banner image */}
          <Box zIndex="1" mb="8px">
            <Box mb="8px">
              <Title
                postId={initiativeId}
                postType="initiative"
                title={initiativeTitle}
                translateButtonClicked={translateButtonClicked}
                color="white"
                align="left"
              />
            </Box>
            <PostedByMobile authorId={authorId} />
          </Box>
        </Box>
      </InitiativeBanner>
      <InitiativeContainer>
        <Box px={isSmallerThanTablet ? '0' : padding}>
          <ReactionControl
            initiative={initiative}
            onScrollToOfficialFeedback={onScrollToOfficialFeedback}
          />
        </Box>
        <Box px={isSmallerThanTablet ? '0' : padding}>
          <RequestToCosponsor initiativeId={initiativeId} />
        </Box>

        {initiativeImageLarge && (
          <Box mb="12px">
            <Image
              src={initiativeImageLarge}
              alt=""
              id="e2e-initiative-image"
            />
          </Box>
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
          <FormattedMessage tagName="h2" {...messages.invisibleTitleContent} />
        </ScreenReaderOnly>
        {initiative.data.relationships.topics.data.length > 0 && (
          <Box mb="20px">
            <Topics
              postType="initiative"
              postTopicIds={initiative.data.relationships.topics.data.map(
                (topic) => topic.id
              )}
            />
          </Box>
        )}
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
        <Box px={isSmallerThanTablet ? '0' : padding}>
          <Cosponsors initiativeId={initiativeId} />
        </Box>
        <Box
          mb={hasOfficialFeedback ? '48px' : '0'}
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
      </InitiativeContainer>
    </Container>
  );
};

export default Phone;
