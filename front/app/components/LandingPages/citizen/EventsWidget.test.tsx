import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import EventsWidget from './EventsWidget';

// internals/jest/setup.js mocks useLocalize globally with a version that drops the fallback
// option, which is what the heading depends on. Restore the real behaviour here.
jest.mock('hooks/useLocalize', () => ({
  __esModule: true,
  default:
    () => (multiloc?: { en?: string }, options?: { fallback?: string }) =>
      multiloc?.en || options?.fallback || '',
}));

const eventsQuery = jest.fn();
jest.mock('api/events/useEvents', () => ({
  __esModule: true,
  default: (params: unknown) => {
    eventsQuery(params);
    return { data: { data: [] } };
  },
}));

jest.mock('components/EventCards', () => ({
  __esModule: true,
  default: () => <div data-testid="event-cards" />,
}));

describe('EventsWidget', () => {
  beforeEach(() => eventsQuery.mockClear());

  // The homepage renders it with no props at all.
  it('asks for every project when given nothing', () => {
    render(<EventsWidget />);

    expect(eventsQuery).toHaveBeenCalledWith({
      projectPublicationStatuses: ['published'],
      currentAndFutureOnly: true,
      pageSize: 3,
      sort: '-start_at',
    });
  });

  it('keeps filtering by page for the legacy custom page section', () => {
    render(<EventsWidget staticPageId="page-1" />);

    expect(eventsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ staticPageId: 'page-1' })
    );
  });

  it('passes a widget filter through', () => {
    render(<EventsWidget filters={{ areas: ['area-1'] }} />);

    expect(eventsQuery).toHaveBeenCalledWith(
      expect.objectContaining({ areas: ['area-1'] })
    );
  });

  it('keeps its own heading when no title is given', () => {
    render(<EventsWidget />);

    expect(screen.getByText('Upcoming and ongoing events')).toBeInTheDocument();
  });

  it('shows an admin heading instead when one is given', () => {
    render(<EventsWidget titleMultiloc={{ en: 'Events in Northside' }} />);

    expect(screen.getByText('Events in Northside')).toBeInTheDocument();
    expect(
      screen.queryByText('Upcoming and ongoing events')
    ).not.toBeInTheDocument();
  });
});
