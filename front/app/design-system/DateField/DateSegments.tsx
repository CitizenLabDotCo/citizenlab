import React, { useContext } from 'react';

import {
  DateInput,
  DateSegment,
  DateSegmentProps,
  DateFieldStateContext,
  TimeFieldStateContext,
} from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import '../tokens.css';

import styles from './DateInput.module.css';
import messages from './messages';

type SegmentProps = {
  segment: DateSegmentProps['segment'];
};

const Segment = ({ segment }: SegmentProps) => {
  const dateState = useContext(DateFieldStateContext);
  const timeState = useContext(TimeFieldStateContext);
  const segments = (dateState ?? timeState)?.segments ?? [];
  const isEmpty = segments.every((s) => !s.isEditable || s.isPlaceholder);
  const isSeparator = segment.type === 'literal';
  const { formatMessage } = useIntl();

  // React Aria draws empty time segments as dashes; the design spells them out.
  const placeholder =
    segment.type === 'hour'
      ? formatMessage(messages.hourPlaceholder)
      : segment.type === 'minute'
      ? formatMessage(messages.minutePlaceholder)
      : segment.placeholder;

  return (
    <DateSegment
      segment={segment}
      className={`${styles.segment} ${
        isSeparator && isEmpty ? styles.empty : ''
      }`}
    >
      {segment.isPlaceholder ? placeholder : segment.text}
    </DateSegment>
  );
};

type Props = {
  // The class of the DateInput: the box itself (Date field, Time field) or
  // the segment row inside a picker's box.
  className: string;
  slot?: 'start' | 'end';
};

const DateSegments = ({ className, slot }: Props) => (
  <DateInput className={className} slot={slot}>
    {(segment) => <Segment segment={segment} />}
  </DateInput>
);

export default DateSegments;
