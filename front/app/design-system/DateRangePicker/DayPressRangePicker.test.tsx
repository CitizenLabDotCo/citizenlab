import React from 'react';

import { CalendarDate, CalendarDateTime } from '@internationalized/date';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import DayPressRangePicker from './DayPressRangePicker';

const handlers = () => ({
  onDayPress: jest.fn(),
  onStartChange: jest.fn(),
  onEndChange: jest.fn(),
  onRemoveEnd: jest.fn(),
});

const start = new CalendarDateTime(2026, 11, 14);

describe('DayPressRangePicker', () => {
  it('moves focus into the calendar when it opens', async () => {
    const user = userEvent.setup();
    render(
      <DayPressRangePicker
        aria-label="Dates"
        value={null}
        {...handlers()}
        defaultFocusedValue={new CalendarDate(2026, 12, 11)}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Open the calendar Start date' })
    );

    expect(
      await screen.findByRole('button', { name: /December 11, 2026/ })
    ).toHaveFocus();
  });

  it('hands a day pressed in the calendar to the caller only as a day press', async () => {
    const user = userEvent.setup();
    const props = handlers();
    render(
      <DayPressRangePicker
        aria-label="Dates"
        value={null}
        {...props}
        minValue={new CalendarDate(2026, 1, 1)}
        defaultFocusedValue={new CalendarDate(2026, 11, 14)}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Open the calendar Start date' })
    );
    await user.click(
      await screen.findByRole('button', { name: /November 1, 2026/ })
    );

    expect(props.onDayPress).toHaveBeenCalledWith(new CalendarDate(2026, 11, 1));
    expect(props.onStartChange).not.toHaveBeenCalled();
  });

  it('writes the day first and hands a typed start day to the caller', async () => {
    const user = userEvent.setup();
    const props = handlers();
    render(<DayPressRangePicker aria-label="Dates" value={null} {...props} />);

    const [day] = screen.getAllByRole('spinbutton');
    expect(day).toHaveAccessibleName(/day/i);

    await user.click(day);
    await user.keyboard('14112026');

    expect(props.onStartChange).toHaveBeenCalledWith(
      new CalendarDate(2026, 11, 14)
    );
  });

  it('adds and removes an end date', async () => {
    const user = userEvent.setup();
    const props = handlers();
    const { rerender } = render(
      <DayPressRangePicker
        aria-label="Dates"
        value={{ start, end: null }}
        {...props}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add end date' }));
    expect(screen.getAllByRole('group')).toHaveLength(2);

    rerender(
      <DayPressRangePicker
        aria-label="Dates"
        value={{ start, end: new CalendarDateTime(2026, 11, 30, 23, 59) }}
        {...props}
      />
    );
    await user.click(
      screen.getByRole('button', { name: 'Remove the end date' })
    );
    expect(props.onRemoveEnd).toHaveBeenCalled();
  });

  it('keeps an end day before the start out of the range', async () => {
    const user = userEvent.setup();
    const props = handlers();
    render(
      <DayPressRangePicker
        aria-label="Dates"
        value={{ start, end: null }}
        {...props}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add end date' }));
    const endDay = screen.getAllByRole('spinbutton')[3];
    await user.click(endDay);
    await user.keyboard('01112026');

    expect(props.onEndChange).not.toHaveBeenCalled();
  });
});
