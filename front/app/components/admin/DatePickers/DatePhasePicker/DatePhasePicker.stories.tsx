import React, { useState } from 'react';

import { DateRange } from '../_shared/typings';

import { patchDisabledRanges } from './patchDisabledRanges';

import DatePhasePicker from '.';

import type { Meta } from '@storybook/react';

const meta = {
  title: 'DatePhasePicker',
  component: DatePhasePicker,
} satisfies Meta<typeof DatePhasePicker>;

export default meta;
// type Story = StoryObj<typeof meta>;

const WrapperStandard = () => {
  const [selectedRange, setSelectedRange] = useState<Partial<DateRange>>({});

  return (
    <DatePhasePicker
      selectedRange={selectedRange}
      onUpdateRange={setSelectedRange}
    />
  );
};

export const Standard = {
  render: () => {
    return <WrapperStandard />;
  },
};

const WrapperDisabledRanges = () => {
  const DISABLED_RANGES = [
    { from: new Date(2024, 7, 1), to: new Date(2024, 8, 5) },
    { from: new Date(2024, 8, 21), to: new Date(2024, 9, 20) },
  ];
  const [selectedRange, setSelectedRange] = useState<Partial<DateRange>>({});

  return (
    <DatePhasePicker
      selectedRange={selectedRange}
      disabledRanges={DISABLED_RANGES}
      defaultMonth={new Date(2024, 9, 1)}
      onUpdateRange={setSelectedRange}
    />
  );
};

export const DisabledRanges = {
  render: () => {
    return <WrapperDisabledRanges />;
  },
};

const WrapperOpenEndedDisabledRanges = () => {
  const DISABLED_RANGES = [
    { from: new Date(2024, 7, 1), to: new Date(2024, 8, 5) },
    { from: new Date(2024, 8, 21) },
  ];
  const [selectedRange, setSelectedRange] = useState<Partial<DateRange>>({});

  return (
    <DatePhasePicker
      selectedRange={selectedRange}
      disabledRanges={patchDisabledRanges(selectedRange, DISABLED_RANGES)}
      defaultMonth={new Date(2024, 8, 1)}
      onUpdateRange={setSelectedRange}
    />
  );
};

export const OpenEndedDisabledRanges = {
  render: () => {
    return <WrapperOpenEndedDisabledRanges />;
  },
};
