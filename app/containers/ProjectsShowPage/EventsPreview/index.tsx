// libraries
import React from 'react';
import { adopt } from 'react-adopt';
<<<<<<< HEAD
import { isNilOrError } from 'utils/helperUtils';
import * as moment from 'moment';
=======
import { isNullOrError } from 'utils/helperUtils';
>>>>>>> 8c65c73370d346ca34a17518fec7a85a9fe85252

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

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

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
  events: ({ project, render }) => <GetEvents projectId={(!isNilOrError(project) ? project.id : null)}>{render}</GetEvents>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {({ project, events }) => {
<<<<<<< HEAD
      if (!isNilOrError(project) && events && events.length > 0) {
        const now = moment();

=======
      if (!isNullOrError(project) && events && events.length > 0) {
>>>>>>> 8c65c73370d346ca34a17518fec7a85a9fe85252
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
                  .filter((event) => {
                    const eventTime = pastPresentOrFuture([event.attributes.start_at, event.attributes.end_at]);
                    return (eventTime === 'present' || eventTime === 'future');
                  })
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
