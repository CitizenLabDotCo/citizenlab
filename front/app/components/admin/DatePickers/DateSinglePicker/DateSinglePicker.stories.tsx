import React, { useState } from 'react';

import DateSinglePicker from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'DateSinglePicker',
  component: DateSinglePicker,
} satisfies Meta<typeof DateSinglePicker>;

type Story = StoryObj<typeof meta>;

export default meta;

const WrapperStandard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <DateSinglePicker
      selectedDate={selectedDate}
      defaultMonth={new Date(2024, 9, 1)}
      onChange={setSelectedDate}
    />
  );
};

export const Standard = {
  render: () => {
    return <WrapperStandard />;
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onChange: () => {},
  },
};
