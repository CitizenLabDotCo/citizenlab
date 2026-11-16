import React, { useState } from 'react';

import { I18nProvider } from 'react-aria-components';

import { DateRange } from '../_shared/typings';

import DesignSystemPicker from './DesignSystemPicker';
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

type DesignSystemWrapperProps = {
  disabledRanges?: DateRange[];
  defaultMonth?: Date;
  initialRange?: Partial<DateRange>;
};

const DesignSystemWrapper = ({
  disabledRanges = [],
  defaultMonth,
  initialRange = {},
}: DesignSystemWrapperProps) => {
  const [selectedRange, setSelectedRange] =
    useState<Partial<DateRange>>(initialRange);

  return (
    <I18nProvider locale="en-GB">
      <DesignSystemPicker
        label="Phase dates"
        selectedRange={selectedRange}
        disabledRanges={patchDisabledRanges(selectedRange, disabledRanges)}
        defaultMonth={defaultMonth}
        onUpdateRange={setSelectedRange}
      />
    </I18nProvider>
  );
};

export const DesignSystemStandard = {
  render: () => <DesignSystemWrapper />,
};

export const DesignSystemDisabledRanges = {
  render: () => (
    <DesignSystemWrapper
      disabledRanges={[
        { from: new Date(2024, 7, 1), to: new Date(2024, 8, 5, 12) },
        { from: new Date(2024, 8, 21, 14), to: new Date(2024, 9, 20) },
      ]}
      defaultMonth={new Date(2024, 8, 1)}
    />
  ),
};

export const DesignSystemOpenEndedDisabledRanges = {
  render: () => (
    <DesignSystemWrapper
      disabledRanges={[
        { from: new Date(2024, 7, 1), to: new Date(2024, 8, 5) },
        { from: new Date(2024, 8, 21) },
      ]}
      defaultMonth={new Date(2024, 8, 1)}
    />
  ),
};

export const DesignSystemSingleDay = {
  render: () => (
    <DesignSystemWrapper
      initialRange={{ from: new Date(2024, 8, 10), to: new Date(2024, 8, 11) }}
      defaultMonth={new Date(2024, 8, 1)}
    />
  ),
};
