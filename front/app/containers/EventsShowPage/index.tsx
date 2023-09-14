import React from 'react';

// components
import {
  Box,
  Spinner,
  Title,
  media,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import Container from './components/Container';
import InformationColumnDesktop from './components/InformationColumnDesktop';
import DesktopTopBar from './components/DesktopTopBar';
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';
import VerticalCenterer from 'components/VerticalCenterer';
import MobileTopBar from './components/MobileTopBar';
import EventDescription from './components/EventDescription';
import InformationSectionMobile from './components/InformationSectionMobile';

// styling
import styled from 'styled-components';

// router
import { useParams } from 'react-router-dom';

// api
import useEvent from 'api/events/useEvent';
import useLocale from 'hooks/useLocale';
import useProjectById from 'api/projects/useProjectById';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import useLocalize from 'hooks/useLocalize';
import ProjectLink from './components/ProjectLink';

const InnerContainer = styled(Box)`
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
const EventsShowPage = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const locale = useLocale();
  const localize = useLocalize();
  const { eventId } = useParams() as {
    eventId: string;
  };
  const { data: event, status, error } = useEvent(eventId);
  const { data: project } = useProjectById(
    event?.data.relationships.project.data.id
  );
  const projectTitleLocalized = localize(
    project?.data.attributes.title_multiloc
  );
  const projectSlug = project?.data.attributes.slug;

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

  if (isNilOrError(locale) || !project) {
    return null;
  }

  return (
    <>
      {isSmallerThanTablet && (
        <MobileTopBar projectId={event?.data.relationships.project.data.id} />
      )}
      <Container>
        <InnerContainer>
          {!isSmallerThanTablet && <DesktopTopBar project={project.data} />}

          <Box display="flex" id="e2e-idea-show-page-content">
            <Box flex="1 1 100%">
              <Title id="e2e-event-title" variant="h1">
                {localize(event?.data.attributes.title_multiloc)}
              </Title>
              {projectTitleLocalized && projectSlug && (
                <ProjectLink
                  projectTitleLocalized={projectTitleLocalized}
                  projectSlug={projectSlug}
                />
              )}
              <Box mb="40px">
                {event && <EventDescription event={event?.data} />}
                {isSmallerThanTablet && event && (
                  <InformationSectionMobile event={event.data} />
                )}
              </Box>
            </Box>
            {!isSmallerThanTablet && event && (
              <InformationColumnDesktop event={event.data} />
            )}
          </Box>
        </InnerContainer>
      </Container>
    </>
  );
};

export default EventsShowPage;
