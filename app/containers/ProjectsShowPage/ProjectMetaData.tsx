import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isNumber } from 'lodash-es';
import moment from 'moment';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useEvents from 'hooks/useEvents';

// components
import IdeaButton from 'components/IdeaButton';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
  padding-top: 12px;
`;

const Content = styled.div`
  border-top: solid 1px ${colors.separation};
  border-bottom: solid px ${colors.separation};
`;

const ProjectMetaData = memo(
  ({ projectId, className }: { projectId: string; className?: string }) => {
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

    if (!isNilOrError(locale) && !isNilOrError(project)) {
      const {
        process_type,
        participation_method,
        publication_status,
        created_at,
        ideas_count,
        avatars_count,
      } = project.attributes;

      return (
        <Container className={className || ''}>
          <Title>
            <FormattedMessage {...messages.aboutThisProject} />
          </Title>
          <Content>
            {process_type === 'continuous' && (
              <div>
                <FormattedMessage
                  {...messages.startedOn}
                  values={{
                    date: moment(created_at).format('LL'),
                  }}
                />
              </div>
            )}
            {isNumber(avatars_count) && (
              <div>
                <FormattedMessage
                  {...messages.xParticipants}
                  values={{ participantsCount: avatars_count }}
                />
              </div>
            )}
            {process_type === 'continuous' &&
              participation_method === 'ideation' &&
              isNumber(ideas_count) && (
                <div>
                  <FormattedMessage
                    {...messages.xIdeas}
                    values={{ ideasCount: ideas_count }}
                  />
                </div>
              )}
            {upcomingEvents.length > 0 && (
              <div>
                <FormattedMessage
                  {...messages.xEvents}
                  values={{ eventsCount: upcomingEvents.length }}
                />
              </div>
            )}
          </Content>
          {/* Continuous Ideation Idea Button desktop */}
          {process_type === 'continuous' &&
            participation_method === 'ideation' &&
            publication_status !== 'archived' && (
              <IdeaButton
                projectId={project.id}
                participationContextType="project"
              />
            )}
        </Container>
      );
    }

    return null;
  }
);

export default ProjectMetaData;
