import React, { ReactNode } from 'react';

import { CalendarDate } from '@internationalized/date';
import {
  Button,
  DateRangePicker as AriaDateRangePicker,
  DateValue,
  Dialog,
  Group,
  Popover,
  RangeValue,
} from 'react-aria-components';

import { RangeCalendar } from '../Calendar';
import dateInputStyles from '../DateField/DateInput.module.css';
import DateSegments from '../DateField/DateSegments';
import pickerStyles from '../DatePicker/DatePicker.module.css';
import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';
import '../tokens.css';

import styles from './DateRangePicker.module.css';
import DayPressRangePicker, {
  DayPressBaseProps,
  DayPressLabelProps,
} from './DayPressRangePicker';

export type { TimeOfDay } from './TimeOfDayField';

type TypedRangeProps = {
  label: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  value?: RangeValue<CalendarDate> | null;
  defaultValue?: RangeValue<CalendarDate> | null;
  onChange?: (value: RangeValue<CalendarDate> | null) => void;
  minValue?: DateValue;
  maxValue?: DateValue;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  startName?: string;
  endName?: string;
  autoFocus?: boolean;
  onDayPress?: undefined;
  'data-cy'?: string;
};

// Typed dates and React Aria's two-press range, or (with onDayPress) a range
// whose rules the caller owns: see DayPressRangePicker.
export type DateRangePickerProps =
  | TypedRangeProps
  | (DayPressLabelProps & DayPressBaseProps);

const DateRangePicker = (props: DateRangePickerProps) => {
  if (props.onDayPress !== undefined) {
    return (
      <DayPressRangePicker
        label={props.label}
        aria-label={props['aria-label']}
        description={props.description}
        size={props.size}
        value={props.value}
        onDayPress={props.onDayPress}
        startPlaceholder={props.startPlaceholder}
        endPlaceholder={props.endPlaceholder}
        minValue={props.minValue}
        maxValue={props.maxValue}
        isDateUnavailable={props.isDateUnavailable}
        defaultFocusedValue={props.defaultFocusedValue}
        startTime={props.startTime}
        endTime={props.endTime}
        calendarNote={props.calendarNote}
        isDisabled={props.isDisabled}
        isOpen={props.isOpen}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
        data-cy={props['data-cy']}
      />
    );
  }

  const { isRequired, size = 36 } = props;

  return (
    <AriaDateRangePicker<CalendarDate>
      className={styles.picker}
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={props.onChange}
      minValue={props.minValue}
      maxValue={props.maxValue}
      isRequired={isRequired}
      isInvalid={props.isInvalid}
      isDisabled={props.isDisabled}
      isOpen={props.isOpen}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      firstDayOfWeek="mon"
      startName={props.startName}
      endName={props.endName}
      autoFocus={props.autoFocus}
      data-cy={props['data-cy']}
    >
      <FieldLabel isRequired={isRequired}>{props.label}</FieldLabel>
      <div className={fieldStyles.control}>
        <Group className={`${pickerStyles.box} ${pickerStyles[`size${size}`]}`}>
          <div className={styles.segments}>
            <DateSegments className={dateInputStyles.segments} slot="start" />
            <span className={styles.arrow} aria-hidden>
              {' → '}
            </span>
            <DateSegments className={dateInputStyles.segments} slot="end" />
          </div>
          <Button className={pickerStyles.calendarButton}>
            <Icon name="calendar-16" />
          </Button>
        </Group>
        <FieldHelp
          description={props.description}
          errorMessage={props.errorMessage}
        />
      </div>
      <Popover
        className={pickerStyles.popover}
        placement="bottom start"
        offset={4}
      >
        <Dialog className={pickerStyles.dialog}>
          <RangeCalendar />
        </Dialog>
      </Popover>
    </AriaDateRangePicker>
  );
};

export default DateRangePicker;
