import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Event from './Event';
import ContentContainer from 'components/ContentContainer';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// style
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)`
  padding-top: 30px;
`;

const EventsContainer = styled(ContentContainer)`
  padding-top: 50px;
  padding-bottom: 40px;
  background: ${colors.background};

  ${media.smallerThanMinTablet`
    padding-top: 30px;
  `}
`;

const Events = styled.div`
  margin-bottom: 80px;
`;

const Title = styled.div`
  h2 {
    font-size: ${fontSizes.xxl}px;
    line-height: normal;
    font-weight: 600;
    margin-bottom: 20px;
  }
  color: ${colors.text};
`;

const EventList = styled.div``;

const NoEvents = styled.div`
  color: ${colors.clGreyOnGreyBackground};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
`;

interface InputProps {}

interface DataProps {
  project: GetProjectChildProps;
  events: GetEventsChildProps;
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  project: ({ params, render }) => (
    <GetProject projectSlug={params.slug}>{render}</GetProject>
  ),
  events: ({ project, render }) => (
    <GetEvents projectId={!isNilOrError(project) ? project.id : null}>
      {render}
    </GetEvents>
  ),
});

export default withRouter<InputProps>(
  (inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataProps) => {
        const className = inputProps['className'];
        const { project, events } = dataProps;

        if (project !== null && events !== null) {
          const pastEvents = events
            ? events.filter((event) => {
                const eventTime = pastPresentOrFuture([
                  event.attributes.start_at,
                  event.attributes.end_at,
                ]);
                return eventTime === 'past';
              })
            : null;

          const upcomingEvents = events
            ? events.filter((event) => {
                const eventTime = pastPresentOrFuture([
                  event.attributes.start_at,
                  event.attributes.end_at,
                ]);
                return eventTime === 'present' || eventTime === 'future';
              })
            : null;

          return (
            <>
              {!isNilOrError(project) && (
                <>
                  <StyledProjectArchivedIndicator projectId={project.id} />
                </>
              )}

              <EventsContainer>
                <Events>
                  <Title>
                    <FormattedMessage
                      tagName="h2"
                      {...messages.upcomingEvents}
                    />
                  </Title>

                  {upcomingEvents && upcomingEvents.length > 0 ? (
                    <EventList className={className}>
                      {upcomingEvents.map((event) => (
                        <Event key={event.id} event={event} />
                      ))}
                    </EventList>
                  ) : (
                    <NoEvents>
                      <FormattedMessage {...messages.noUpcomingEvents} />
                    </NoEvents>
                  )}
                </Events>

                <Events>
                  <Title>
                    <FormattedMessage tagName="h2" {...messages.pastEvents} />
                  </Title>

                  {pastEvents && pastEvents.length > 0 ? (
                    <EventList className={className}>
                      {pastEvents.map((event) => (
                        <Event key={event.id} event={event} />
                      ))}
                    </EventList>
                  ) : (
                    <NoEvents>
                      <FormattedMessage {...messages.noPastEvents} />
                    </NoEvents>
                  )}
                </Events>
              </EventsContainer>
            </>
          );
        }

        return null;
      }}
    </Data>
  )
);
