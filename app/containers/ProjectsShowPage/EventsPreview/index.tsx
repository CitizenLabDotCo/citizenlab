// libraries
import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

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
  padding-top: 60px;
  padding-bottom: 80px;
  background: #fff;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h2 {
    padding: 0;
    margin: 0;
  }
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
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  events: ({ project, render }) => <GetEvents projectId={(!isNilOrError(project) ? project.id : null)}>{render}</GetEvents>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {({ project, events }) => {
      if (!isNilOrError(project) && events && events.length > 0) {
        const futureEvents = events.filter((event) => {
          const eventTime = pastPresentOrFuture([event.attributes.start_at, event.attributes.end_at]);
          return (eventTime === 'present' || eventTime === 'future');
        }).slice(0, 3);

        if (futureEvents.length > 0) {
          return (
            <Container className={'e2e-events-preview'}>
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
                  {futureEvents.map((event, index) => (
                    <EventBlock event={event} key={event.id} projectSlug={project.attributes.slug} isLast={(index === 2)} />
                  ))}
                </Events>
              </ContentContainer>
            </Container>
          );
        }
      }

      return null;
    }}
  </Data>
);
