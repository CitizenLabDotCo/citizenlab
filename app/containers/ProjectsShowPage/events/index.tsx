import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Header from '../Header';
import Event from './Event';
import ContentContainer from 'components/ContentContainer';
import ProjectModeratorIndicator from 'components/ProjectModeratorIndicator';

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

const EventsContainer = styled(ContentContainer)`
  background: #f9f9fa;
  padding-top: 70px;
`;

const Events = styled.div`
  margin-bottom: 100px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 29px;
  line-height: 35px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const EventList = styled.div``;

const NoEvents = styled.div`
  color: #999;
  font-size: 18px;
  font-weight: 300;
  line-height: 26px;
`;

const Mod = styled(ProjectModeratorIndicator)`
  max-width: ${props => props.theme.maxPageWidth}px;
`;



interface InputProps {}

interface DataProps {
  project: GetProjectChildProps;
  events: GetEventsChildProps;
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  project: ({ params, render }) => <GetProject slug={params.slug}>{render}</GetProject>,
  events: ({ project, render }) => <GetEvents projectId={(!isNilOrError(project) ? project.id : null)}>{render}</GetEvents>
});

export default withRouter<InputProps>((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => {
      const className = inputProps['className'];
      const { slug } = inputProps.params;
      const { project, events } = dataProps;

      if (project !== null && events !== null) {
        const pastEvents = (events ? events.filter((event) => {
          const eventTime = pastPresentOrFuture([event.attributes.start_at, event.attributes.end_at]);
          return eventTime === 'past';
        }) : null);

        const upcomingEvents = (events ? events.filter((event) => {
          const eventTime = pastPresentOrFuture([event.attributes.start_at, event.attributes.end_at]);
          return (eventTime === 'present' || eventTime === 'future');
        }) : null);

        return (
          <>
            <Header projectSlug={slug} />
            {!isNilOrError(project) && <Mod projectId={project.id} displayType="message" />}
            <EventsContainer>
              <Events>
                <Title>
                  <FormattedMessage {...messages.upcomingEvents} />
                </Title>

                {(upcomingEvents && upcomingEvents.length > 0) ? (
                  <EventList className={className}>
                    {upcomingEvents.map(event => <Event key={event.id} event={event} />)}
                  </EventList>
                ) : (
                  <NoEvents>
                    <FormattedMessage {...messages.noUpcomingEvents} />
                  </NoEvents>
                )}
              </Events>

              <Events>
                <Title>
                  <FormattedMessage {...messages.pastEvents} />
                </Title>

                {(pastEvents && pastEvents.length > 0) ? (
                  <EventList className={className}>
                    {pastEvents.map(event => <Event key={event.id} event={event} />)}
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
));
