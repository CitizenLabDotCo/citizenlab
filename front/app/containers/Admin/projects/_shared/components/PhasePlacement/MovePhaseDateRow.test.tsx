import React from 'react';

import { mockPhaseIdeationData } from 'api/phases/__mocks__/_mockServer';

import DatePhasePicker from 'components/admin/DatePickers/DatePhasePicker';

import { act, render, screen } from 'utils/testUtils/rtl';

import MovePhaseDateRow from './MovePhaseDateRow';

jest.mock('api/app_configuration/useAppConfiguration');
jest.mock('hooks/useLocalize', () => () => (multiloc) => multiloc.en);

jest.mock('components/admin/DatePickers/DatePhasePicker', () =>
  jest.fn(() => null)
);

const phase = {
  ...mockPhaseIdeationData,
  attributes: {
    ...mockPhaseIdeationData.attributes,
    title_multiloc: { en: 'Survey' },
    start_at: '2026-11-05T00:00:00Z',
    end_at: '2026-11-15T00:00:00Z',
  },
};

it('uses the shared range picker and converts tenant-local selections to UTC', () => {
  const onChange = jest.fn();
  render(
    <MovePhaseDateRow
      phase={phase}
      defaultOpen
      errors={[]}
      onChange={onChange}
    />
  );

  const props = jest.mocked(DatePhasePicker).mock.calls.at(-1)![0];
  expect(props.selectedRange.from).toEqual(new Date(2026, 10, 5, 1));
  expect(props.selectedRange.to).toEqual(new Date(2026, 10, 15, 1));

  act(() =>
    props.onUpdateRange({
      from: new Date(2026, 10, 6, 9, 30),
      to: new Date(2026, 10, 10, 1),
    })
  );
  expect(onChange).toHaveBeenLastCalledWith({
    start_at: '2026-11-06T08:30:00.000Z',
    end_at: '2026-11-10T00:00:00.000Z',
  });

  act(() => props.onUpdateRange({ from: new Date(2026, 10, 6, 9, 30) }));
  expect(onChange).toHaveBeenLastCalledWith({
    start_at: '2026-11-06T08:30:00.000Z',
    end_at: null,
  });
});

it('shows only the relevant conflict and clears it when dates are corrected', () => {
  const other = {
    ...phase,
    id: 'other',
    attributes: {
      ...phase.attributes,
      title_multiloc: { en: 'Timeline survey B' },
    },
  };
  const onChange = jest.fn();
  const { rerender } = render(
    <MovePhaseDateRow
      phase={phase}
      defaultOpen
      errors={[{ type: 'overlap', phase: other }]}
      onChange={onChange}
    />
  );

  expect(
    screen.getByText(/Overlaps with "Timeline survey B"/)
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/must last at least 24 hours/)
  ).not.toBeInTheDocument();

  rerender(
    <MovePhaseDateRow
      phase={phase}
      defaultOpen
      errors={[]}
      onChange={onChange}
    />
  );
  expect(screen.queryByText(/Overlaps with/)).not.toBeInTheDocument();
});
