import React from 'react';

import { CalendarDate } from '@internationalized/date';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import DayPressRangePicker from './DayPressRangePicker';

describe('DayPressRangePicker', () => {
  it('moves focus into the calendar when it opens', async () => {
    const user = userEvent.setup();
    render(
      <DayPressRangePicker
        aria-label="Dates"
        value={null}
        onDayPress={jest.fn()}
        startPlaceholder="Start"
        endPlaceholder="End"
        defaultFocusedValue={new CalendarDate(2026, 12, 11)}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Dates' }));

    expect(
      await screen.findByRole('button', { name: /December 11, 2026/ })
    ).toHaveFocus();
  });
});
