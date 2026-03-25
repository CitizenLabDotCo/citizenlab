// eslint-disable-next-line no-restricted-imports
import Tippy from '@tippyjs/react';
import { Matcher } from 'react-day-picker';

export interface CalendarProps {
  startMonth?: Date;
  endMonth?: Date;
  defaultMonth?: Date;
  selectedDate?: Date;
  onChange: (date: Date) => void;
  disabledPast?: Matcher | undefined;
}

export interface Props extends CalendarProps {
  id?: string;
  disabled?: boolean;
  placement?: React.ComponentProps<typeof Tippy>['placement'];
}
