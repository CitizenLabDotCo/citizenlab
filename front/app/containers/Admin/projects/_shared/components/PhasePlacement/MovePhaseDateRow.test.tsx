import React from 'react';

import { mockPhaseIdeationData } from 'api/phases/__mocks__/_mockServer';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import MovePhaseDateRow from './MovePhaseDateRow';

jest.mock('api/app_configuration/useAppConfiguration');
jest.mock('hooks/useLocalize', () => () => (multiloc) => multiloc.en);

const phase = {
  ...mockPhaseIdeationData,
  attributes: {
    ...mockPhaseIdeationData.attributes,
    title_multiloc: { en: 'Survey' },
    start_at: '2026-11-05T00:00:00Z',
    end_at: '2026-11-15T00:00:00Z',
  },
};

it('shows tenant-local dates and converts edits back to UTC', () => {
  const onChange = jest.fn();
  render(
    <MovePhaseDateRow
      phase={phase}
      defaultOpen
      invalid={false}
      onChange={onChange}
    />
  );

  const start = screen.getByLabelText('Start date · Survey');
  const end = screen.getByLabelText('End date · Survey');
  expect(start).toHaveValue('2026-11-05T01:00');
  expect(end).toHaveValue('2026-11-15T01:00');

  fireEvent.change(end, { target: { value: '2026-11-10T01:00' } });
  expect(onChange).toHaveBeenLastCalledWith({
    start_at: phase.attributes.start_at,
    end_at: '2026-11-10T00:00:00.000Z',
  });

  fireEvent.change(start, { target: { value: '2026-11-06T09:30' } });
  expect(onChange).toHaveBeenLastCalledWith({
    start_at: '2026-11-06T08:30:00.000Z',
    end_at: phase.attributes.end_at,
  });
});

it('allows clearing the end date and preserves a missing start for validation', () => {
  const onChange = jest.fn();
  render(
    <MovePhaseDateRow
      phase={phase}
      defaultOpen
      invalid={false}
      onChange={onChange}
    />
  );

  fireEvent.change(screen.getByLabelText('End date · Survey'), {
    target: { value: '' },
  });
  expect(onChange).toHaveBeenLastCalledWith({
    start_at: phase.attributes.start_at,
    end_at: null,
  });

  fireEvent.change(screen.getByLabelText('Start date · Survey'), {
    target: { value: '' },
  });
  expect(onChange).toHaveBeenLastCalledWith({
    start_at: '',
    end_at: phase.attributes.end_at,
  });
});
