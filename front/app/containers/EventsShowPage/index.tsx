import React from 'react';

import {
  Box,
  Spinner,
  Title,
  media,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';
import styled from 'styled-components';

import useEventImage from 'api/event_images/useEventImage';
import useEvent from 'api/events/useEvent';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import PageNotFound from 'components/PageNotFound';
import Image from 'components/UI/Image';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import { isUnauthorizedRQ } from 'utils/errorUtils';

import DesktopTopBar from './components/DesktopTopBar';
import EventDescription from './components/EventDescription';
import EventShowPageMeta from './components/EventShowPageMeta';
import InformationColumnDesktop from './components/InformationColumnDesktop';
import InformationSectionMobile from './components/InformationSectionMobile';
import MobileTopBar from './components/MobileTopBar';
import ProjectLink from './components/ProjectLink';
import { pageContentMaxWidth } from './styleConstants';

const InnerContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: auto;
  margin-right: auto;
  max-width: ${pageContentMaxWidth}px;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  padding-top: 40px;
  padding-left: 60px;
  padding-right: 60px;

  ${media.tablet`
    min-height: calc(100vh - ${({
      theme: { mobileMenuHeight, mobileTopBarHeight },
    }) => mobileMenuHeight + mobileTopBarHeight}px);
    padding-top: 35px;
  `}

  ${media.phone`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const EventImage = styled(Image)`
  width: 100%;
  height: 100%;
  flex: 1;
  margin-bottom: 24px;
`;

const EventsShowPage = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const localize = useLocalize();
  const { eventId } = useParams({ from: '/$locale/events/$eventId' });
  const { data: event, status, error } = useEvent(eventId);
  const { data: project } = useProjectById(
    event?.data.relationships.project.data.id
  );
  const { data: eventImage } = useEventImage(event?.data);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const largeImage = eventImage?.data.attributes?.versions?.large;

  if (status === 'loading') {
    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }

  if (status === 'error') {
    if (isUnauthorizedRQ(error)) {
      return <Unauthorized />;
    }
    return <PageNotFound />;
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <EventShowPageMeta event={event.data} />
      {isSmallerThanTablet ? (
        <MobileTopBar projectId={event.data.relationships.project.data.id} />
      ) : (
        <Box p="32px" pb="0">
          <DesktopTopBar event={event.data} project={project.data} />
        </Box>
      )}
      <main>
        <InnerContainer>
          <Box display="flex" id="e2e-idea-show-page-content">
            <Box flex="1 1 100%">
              <Title id="e2e-event-title" variant="h1">
                {localize(event.data.attributes.title_multiloc)}
              </Title>
              <ProjectLink project={project.data} />
              {largeImage && (
                <Box aria-hidden="true">
                  <EventImage src={largeImage} alt="" />
                </Box>
              )}
              <Box mb="40px">
                <EventDescription event={event.data} />
                {isSmallerThanTablet && (
                  <InformationSectionMobile event={event.data} />
                )}
              </Box>
            </Box>
            {!isSmallerThanTablet && (
              <InformationColumnDesktop event={event.data} />
            )}
          </Box>
        </InnerContainer>
      </main>
    </>
  );
};

export default EventsShowPage;
