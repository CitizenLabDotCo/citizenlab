import React, { useState } from 'react';

import { Time } from '@internationalized/date';

import { render, screen, userEvent, within } from 'utils/testUtils/rtl';

import TimeOfDayField from './TimeOfDayField';

// Saves what it receives, like a real caller.
const Field = ({ onChange }: { onChange: (value: Time) => void }) => {
  const [value, setValue] = useState<Time | null>(null);

  return (
    <TimeOfDayField
      time={{
        label: 'Start time',
        value,
        minValue: new Time(9, 0),
        onChange: (newValue) => {
          setValue(newValue);
          onChange(newValue);
        },
      }}
    />
  );
};

const segments = () =>
  within(screen.getByRole('group', { name: 'Start time' })).getAllByRole(
    'spinbutton'
  );

describe('TimeOfDayField', () => {
  it('keeps a time before the minimum and marks it invalid without saving it', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Field onChange={onChange} />);

    await user.click(segments()[0]);
    await user.keyboard('830A');
    await user.tab();

    expect(segments().map((segment) => segment.textContent)).toEqual([
      '8',
      '30',
      'AM',
    ]);
    expect(segments()[0]).toHaveAttribute('aria-invalid', 'true');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('saves a time inside the limits', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Field onChange={onChange} />);

    await user.click(segments()[0]);
    await user.keyboard('1015A');

    expect(onChange).toHaveBeenLastCalledWith(new Time(10, 15));
  });
});
