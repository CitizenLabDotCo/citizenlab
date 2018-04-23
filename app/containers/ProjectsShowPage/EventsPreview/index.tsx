// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import * as moment from 'moment';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import EventBlock from './EventBlock';
import Button from 'components/UI/Button';
import ContentContainer from 'components/ContentContainer';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  background: #fff;
  padding-top: 80px;
  padding-bottom: 90px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const Events = styled.div`
  display: flex;
  margin-left: -13px;
  margin-right: -13px;

  ${media.smallerThanMaxTablet`
    margin: 0;
    flex-direction: column;
  `}
`;

interface InputProps {
  projectId: string;
}

interface DataProps {
  project: GetProjectChildProps;
  events: GetEventsChildProps;
}

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => <GetProject slug={projectId}>{render}</GetProject>,
  events: ({ project, render }) => <GetEvents projectId={(project ? project.id : null)}>{render}</GetEvents>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {({ project, events }) => {
      if (project && events && events.length > 0) {
        const now = moment();

        return (
          <Container className={`e2e-events-preview`}>
            <ContentContainer>
              <Header>
                <h2>
                  <FormattedMessage {...messages.upcomingEvents} />
                </h2>
                <Button circularCorners={false} style="primary-outlined" linkTo={`/projects/${project.attributes.slug}/events`}>
                  <FormattedMessage {...messages.allEvents} />
                </Button>
              </Header>

              <Events>
                {events
                  .filter((event) => moment(event.attributes.start_at).isSameOrAfter(now, 'day'))
                  .slice(0, 3)
                  .map((event, index) => (
                    <EventBlock event={event} key={event.id} projectSlug={project.attributes.slug} isLast={(index === 2)} />
                  ))}
              </Events>
            </ContentContainer>
          </Container>
        );      
      }

      return null;
    }}
  </Data>
);
