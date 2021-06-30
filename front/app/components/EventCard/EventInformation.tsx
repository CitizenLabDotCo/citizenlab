import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty, every } from 'lodash-es';
import moment from 'moment';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { Icon } from 'cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';

// hooks
import useResourceFiles from 'hooks/useResourceFiles';
import useProject from 'hooks/useProject';

// services
import { IEventData } from 'services/events';

// i18n
import T from 'components/T';

// styling
import styled, { useTheme } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const EventInformation = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 23px;
  margin-top: 4px;
`;

const EventTitleAndMeta = styled.div`
  margin-bottom: 18px;
`;

const ProjectTitle = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xs}px;
`;

const EventTitle = styled.h3`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 700;
  line-height: normal;
  margin-bottom: 13px;
`;

const EventMetaContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const EventMeta = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xs}px;
`;

const EventDescription = styled.div``;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  width: ${fontSizes.xs}px;
  height: ${fontSizes.xs}px;
  fill: ${colors.label};
  margin-right: 6px;
`;

interface Props {
  event: IEventData;
  startAtMoment: moment.Moment;
  endAtMoment: moment.Moment;
  isMultiDayEvent: boolean;
  showProjectTitle: boolean;
}

export default memo<Props>((props) => {
  const {
    event,
    isMultiDayEvent,
    startAtMoment,
    endAtMoment,
    showProjectTitle,
  } = props;

  const theme: any = useTheme();

  const eventFiles = useResourceFiles({
    resourceType: 'event',
    resourceId: event.id,
  });

  const hasLocation = !every(event.attributes.location_multiloc, isEmpty);
  const eventDateTime = isMultiDayEvent
    ? `${startAtMoment.format('LLL')} - ${endAtMoment.format('LLL')}`
    : `${startAtMoment.format('LL')} • ${startAtMoment.format(
        'LT'
      )} - ${endAtMoment.format('LT')}`;

  const projectId = event.relationships.project.data.id;
  const project = useProject({ projectId });
  const projectTitle = project?.attributes.title_multiloc;

  return (
    <>
      <EventInformation>
        <EventTitleAndMeta>
          {showProjectTitle && projectTitle && (
            <ProjectTitle>
              <T value={projectTitle} />
            </ProjectTitle>
          )}

          <EventTitle>
            <T value={event.attributes.title_multiloc} />
          </EventTitle>

          <EventMetaContainer>
            <EventMeta>
              <StyledIcon name="clock" />
              {eventDateTime}
            </EventMeta>

            {hasLocation && (
              <EventMeta>
                <StyledIcon name="mapmarker" />
                <T value={event.attributes.location_multiloc} />
              </EventMeta>
            )}
          </EventMetaContainer>
        </EventTitleAndMeta>

        <EventDescription>
          <QuillEditedContent textColor={theme.colorText}>
            <T
              value={event.attributes.description_multiloc}
              supportHtml={true}
            />
          </QuillEditedContent>
        </EventDescription>

        {!isNilOrError(eventFiles) && eventFiles.length > 0 && (
          <FileAttachments files={eventFiles} />
        )}
      </EventInformation>
    </>
  );
});
