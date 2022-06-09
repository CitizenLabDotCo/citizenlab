import React from 'react';

// components
import { Select, SelectProps } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { capitalize } from 'lodash-es';

// typings
import { MessageDescriptor } from 'typings';

type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface Month {
  monthNumber: MonthNumber;
  monthMessage: MessageDescriptor;
}

const MONTHS: Month[] = [
  { monthNumber: 1, monthMessage: messages.january },
  { monthNumber: 2, monthMessage: messages.february },
  { monthNumber: 3, monthMessage: messages.march },
  { monthNumber: 4, monthMessage: messages.april },
  { monthNumber: 5, monthMessage: messages.may },
  { monthNumber: 6, monthMessage: messages.june },
  { monthNumber: 7, monthMessage: messages.july },
  { monthNumber: 8, monthMessage: messages.august },
  { monthNumber: 9, monthMessage: messages.september },
  { monthNumber: 10, monthMessage: messages.october },
  { monthNumber: 11, monthMessage: messages.november },
  { monthNumber: 12, monthMessage: messages.december },
];

interface IMonthOption {
  value: MonthNumber;
  label: string;
}

type OmittedSelectProps = 'onChange' | 'value' | 'options';

interface Props extends Omit<SelectProps, OmittedSelectProps> {
  onChange: (option: IMonthOption) => void;
  value?: IMonthOption | MonthNumber;
}

const MonthSelect = ({
  intl: { formatMessage },
  ...otherProps
}: Props & InjectedIntlProps) => {
  const options: IMonthOption[] = MONTHS.map(
    ({ monthNumber, monthMessage }) => ({
      value: monthNumber,
      label: capitalize(formatMessage(monthMessage)),
    })
  );

  return <Select options={options} {...otherProps} />;
};

export default injectIntl(MonthSelect);
