import React, { memo } from 'react';
import moment from 'moment';
import { isEmpty, every } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';
import DateBlocks from './DateBlocks';

// hooks
import useResourceFiles from 'hooks/useResourceFiles';
import useWindowSize from 'hooks/useWindowSize';

// services
import { IEventData } from 'services/events';

// i18n
import T from 'components/T';

// utils
import { getIsoDate } from 'utils/dateUtils';

// style
import styled, { useTheme } from 'styled-components';
import {
  media,
  colors,
  fontSizes,
  defaultCardStyle,
  viewportWidths,
} from 'utils/styleUtils';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  width: 100%;
  padding: 17px;
  display: flex;
  ${defaultCardStyle};
  box-shadow: none;
  border: solid 1px #ccc;
`;

interface InputProps {
  event: IEventData;
  className?: string;
}

interface Props extends InputProps {}

const EventCard = memo<Props>(({ event, className }) => {
  const theme: any = useTheme();
  const eventFiles = useResourceFiles({
    resourceType: 'event',
    resourceId: event.id,
  });
  const windowSize = useWindowSize();
  const smallerThanLargeTablet = windowSize
    ? windowSize.windowWidth <= viewportWidths.largeTablet
    : false;

  if (!isNilOrError(event)) {
    const startAtMoment = moment(event.attributes.start_at);
    const endAtMoment = moment(event.attributes.end_at);
    const startAtIsoDate = getIsoDate(event.attributes.start_at);
    const endAtIsoDate = getIsoDate(event.attributes.end_at);
    const startAtDay = startAtMoment.format('DD');
    const endAtDay = endAtMoment.format('DD');
    const startAtMonth = startAtMoment.format('MMM');
    const endAtMonth = endAtMoment.format('MMM');
    const startAtYear = startAtMoment.format('YYYY');
    const endAtYear = endAtMoment.format('YYYY');
    const isMultiDayEvent = startAtIsoDate !== endAtIsoDate;
    const isMultiMonth = startAtMonth !== endAtMonth;
    const isMultiYear = startAtYear !== endAtYear;
    const hasLocation = !every(event.attributes.location_multiloc, isEmpty);
    const eventDateTime = isMultiDayEvent
      ? `${startAtMoment.format('LLL')} - ${endAtMoment.format('LLL')}`
      : `${startAtMoment.format('LL')} • ${startAtMoment.format(
          'LT'
        )} - ${endAtMoment.format('LT')}`;

    return (
      <Container className={className || ''}>
        <DateBlocks
          startAtDay={startAtDay}
          endAtDay={endAtDay}
          startAtMonth={startAtMonth}
          endAtMonth={endAtMonth}
          startAtYear={startAtYear}
          endAtYear={endAtYear}
          isMultiDayEvent={isMultiDayEvent}
          isMultiMonth={isMultiMonth}
          isMultiYear={isMultiYear}
        />
      </Container>
    );
  }

  return null;
});

export default EventCard;
