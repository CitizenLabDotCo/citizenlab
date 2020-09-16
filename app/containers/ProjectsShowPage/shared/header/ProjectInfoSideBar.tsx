import React, { memo, useCallback, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isNumber } from 'lodash-es';
import moment from 'moment';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useEvents from 'hooks/useEvents';

// components
import Button from 'components/UI/Button';
import IdeaButton from 'components/IdeaButton';
import { Icon } from 'cl2-component-library';

// utils
import { pastPresentOrFuture, getIsoDate } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
`;

const Title = styled.h2`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  line-height: normal;
  font-weight: 600;
  margin: 0;
  padding: 0;
  padding-bottom: 8px;
  padding-top: 8px;
`;

const List = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;
  border-top: solid 1px ${colors.separation};
  border-bottom: solid 1px ${colors.separation};
`;

const ListItem = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: flex-start;
  margin-top: 18px;
  margin-bottom: 18px;

  &.link {
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: #000;
      text-decoration: underline;
    }
  }
`;

const ListItemIcon = styled(Icon)`
  width: 17px;
  height: 17px;
  fill: ${colors.label};
  margin-right: 14px;

  &.timeline {
    width: 20px;
    height: 20px;
  }
`;

const ListItemTextContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ListItemTextLine = styled.div`
  &.hasBottomMargin {
    margin-bottom: 5px;
  }
`;

const ActionButtons = styled.div`
  margin-top: 20px;
`;

const SeeTimelineButton = styled(Button)`
  margin-bottom: 10px;
`;

const SeeIdeasButton = styled(Button)`
  margin-bottom: 10px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectInfoSideBar = memo<Props>(({ projectId, className }) => {
  const locale = useLocale();
  const project = useProject({ projectId });
  const phases = usePhases(projectId);
  const events = useEvents(projectId);

  const upcomingEvents = !isNilOrError(events)
    ? events.filter((event) => {
        const eventTime = pastPresentOrFuture([
          event.attributes.start_at,
          event.attributes.end_at,
        ]);
        return eventTime === 'present' || eventTime === 'future';
      })
    : [];

  const scrollToIdeas = useCallback((event: FormEvent) => {
    event.preventDefault();
    document?.getElementById('project-ideas')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  }, []);

  const scrollToTimeline = useCallback((event: FormEvent) => {
    event.preventDefault();
    document?.getElementById('project-timeline')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'start',
    });
  }, []);

  const scrollToEvents = useCallback((event: FormEvent) => {
    event.preventDefault();
    document?.getElementById('project-events')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  }, []);

  if (!isNilOrError(locale) && !isNilOrError(project)) {
    const {
      process_type,
      participation_method,
      publication_status,
      created_at,
      ideas_count,
      avatars_count,
    } = project.attributes;

    let phaseStartDate: string | null = null;
    let phaseEndDate: string | null = null;

    if (!isNilOrError(phases) && phases.length > 0) {
      phaseStartDate = moment(
        getIsoDate(phases[0].attributes.start_at),
        'YYYY-MM-DD'
      ).format('ll');
      phaseEndDate = moment(
        getIsoDate(phases[phases.length - 1].attributes.end_at),
        'YYYY-MM-DD'
      ).format('ll');
    }

    return (
      <Container className={className || ''}>
        <Title>
          <FormattedMessage {...messages.about} />
        </Title>
        <List>
          {process_type === 'continuous' && (
            <ListItem>
              <ListItemIcon name="flag" />
              <FormattedMessage
                {...messages.startedOn}
                values={{
                  date: moment(created_at).format('LL'),
                }}
              />
            </ListItem>
          )}
          {process_type === 'timeline' && phaseStartDate && phaseEndDate && (
            <ListItem>
              <ListItemIcon name="flag" />
              <ListItemTextContainer>
                <ListItemTextLine className="hasBottomMargin">
                  <FormattedMessage
                    {...messages.startedOn}
                    values={{
                      date: phaseStartDate,
                    }}
                  />
                </ListItemTextLine>
                <ListItemTextLine>
                  <FormattedMessage
                    {...messages.endsOn}
                    values={{
                      date: phaseEndDate,
                    }}
                  />
                </ListItemTextLine>
              </ListItemTextContainer>
            </ListItem>
          )}
          {process_type === 'timeline' &&
            !isNilOrError(phases) &&
            phases.length > 0 && (
              <ListItem className="link" onClick={scrollToTimeline}>
                <ListItemIcon name="timeline" className="timeline" />
                <FormattedMessage
                  {...messages.xPhases}
                  values={{ phasesCount: phases.length }}
                />
              </ListItem>
            )}
          {isNumber(avatars_count) && avatars_count > 0 && (
            <ListItem>
              <ListItemIcon name="person" />
              <FormattedMessage
                {...messages.xParticipants}
                values={{ participantsCount: avatars_count }}
              />
            </ListItem>
          )}
          {process_type === 'continuous' &&
            participation_method === 'ideation' &&
            isNumber(ideas_count) && (
              <ListItem className="link" onClick={scrollToIdeas}>
                <ListItemIcon name="idea-filled" />
                <FormattedMessage
                  {...messages.xIdeas}
                  values={{ ideasCount: ideas_count }}
                />
              </ListItem>
            )}
          {upcomingEvents.length > 0 && (
            <ListItem className="link" onClick={scrollToEvents}>
              <ListItemIcon name="event" />
              <FormattedMessage
                {...messages.xUpcomingEvents}
                values={{ upcomingEventsCount: upcomingEvents.length }}
              />
            </ListItem>
          )}
        </List>
        <ActionButtons>
          {process_type === 'timeline' && (
            <SeeTimelineButton
              buttonStyle="secondary"
              onClick={scrollToTimeline}
              fontWeight="500"
            >
              <FormattedMessage {...messages.seeTheTimeline} />
            </SeeTimelineButton>
          )}
          {process_type === 'continuous' &&
            participation_method === 'ideation' && (
              <SeeIdeasButton
                buttonStyle="secondary"
                onClick={scrollToIdeas}
                fontWeight="500"
              >
                <FormattedMessage {...messages.seeTheIdeas} />
              </SeeIdeasButton>
            )}

          {process_type === 'continuous' &&
            participation_method === 'ideation' &&
            publication_status !== 'archived' && (
              <IdeaButton
                projectId={project.id}
                participationContextType="project"
                fontWeight="500"
              />
            )}
        </ActionButtons>
      </Container>
    );
  }

  return null;
});

export default ProjectInfoSideBar;
