import React from 'react';

// components
import {
  Box,
  Icon,
  Spinner,
  Title,
  colors,
  media,
  useBreakpoint,
  Text,
} from '@citizenlab/cl2-component-library';
import Container from './components/Container';
import RightColumnDesktop from './components/RightColumnDesktop';
import DesktopTopBar from './components/DesktopTopBar';
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';
import VerticalCenterer from 'components/VerticalCenterer';
import EventTopBarMobile from './components/EventTopBarMobile';
import EventDescription from './components/EventDescription';
import InformationSectionMobile from './components/InformationSectionMobile';
import Link from 'utils/cl-router/Link';

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
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import useLocalize from 'hooks/useLocalize';

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
  const { formatMessage } = useIntl();
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
        <EventTopBarMobile
          projectId={event?.data.relationships.project.data.id}
        />
      )}
      <Container>
        <InnerContainer>
          {!isSmallerThanTablet && <DesktopTopBar project={project.data} />}

          <Box display="flex" id="e2e-idea-show-page-content">
            <Box flex="1 1 100%">
              <Title id="e2e-event-title" variant="h1">
                {event?.data.attributes.title_multiloc[locale]}
              </Title>
              {projectTitleLocalized && (
                <Box display="flex" my="24px" gap="8px">
                  <Box
                    h="40px"
                    w="40px"
                    background={colors.grey200}
                    borderRadius="90px"
                  >
                    <Icon
                      name="calendar"
                      fill={colors.primary}
                      my="auto"
                      mx="auto"
                      width="100%"
                      height="100%"
                      p="8px"
                    />
                  </Box>
                  <Box>
                    <Text p="0px" m="0px">
                      {formatMessage(messages.eventFrom, {
                        eventTitle: projectTitleLocalized,
                      })}
                    </Text>
                    <Link to={`/projects/${project.data.attributes.slug}`}>
                      <Text
                        fontSize="s"
                        p="0px"
                        m="0px"
                        color="coolGrey600"
                        textDecoration="underline"
                      >
                        {formatMessage(messages.goToProject)}
                      </Text>
                    </Link>
                  </Box>
                </Box>
              )}

              <Box mb="40px">
                {event && <EventDescription event={event?.data} />}
                {isSmallerThanTablet && event && (
                  <InformationSectionMobile event={event.data} />
                )}
              </Box>
            </Box>
            {!isSmallerThanTablet && event && (
              <RightColumnDesktop event={event.data} />
            )}
          </Box>
        </InnerContainer>
      </Container>
    </>
  );
};

export default EventsShowPage;
