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
import ContentContainer from 'components/ContentContainer';
import Link from 'utils/cl-router/Link';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// styling
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  width: 100%;
  padding-top: 60px;
  padding-bottom: 100px;
  background: #fff;

  ${media.smallerThanMinTablet`
    padding-bottom: 60px;
  `}
`;

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const HeaderTitle = styled.h2`
  color: ${colors.text};
  font-size: ${fontSizes.xxl}px;
  line-height: normal;
  font-weight: 600;
  margin: 0;
  padding: 0;
`;

const AllEvents = styled(Link)`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  text-decoration: underline;
  margin-left: 20px;
  margin-bottom: 4px;

  &:hover {
    color: ${({ theme }) => darken(0.2, theme.colorText)};
    text-decoration: underline;
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
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
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  events: ({ project, render }) => (
    <GetEvents projectId={!isNilOrError(project) ? project.id : null}>
      {render}
    </GetEvents>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {({ project, events }) => {
      if (!isNilOrError(project) && events && events.length > 0) {
        const futureEvents = events
          .filter((event) => {
            const eventTime = pastPresentOrFuture([
              event.attributes.start_at,
              event.attributes.end_at,
            ]);
            return eventTime === 'present' || eventTime === 'future';
          })
          .slice(0, 3);

        if (futureEvents.length > 0) {
          return (
            <Container className={'e2e-events-preview'}>
              <ContentContainer>
                <Header>
                  <HeaderTitle>
                    <FormattedMessage {...messages.upcomingEvents} />
                  </HeaderTitle>
                  <AllEvents to={`/projects/${project.attributes.slug}/events`}>
                    <FormattedMessage {...messages.allEvents} />
                  </AllEvents>
                </Header>

                <Events>
                  {futureEvents.map((event, index) => (
                    <EventBlock
                      event={event}
                      key={event.id}
                      projectSlug={project.attributes.slug}
                      isLast={index === 2}
                    />
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
