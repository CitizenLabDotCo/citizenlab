import React from 'react';

import { render } from 'utils/testUtils/rtl';

import Tabs from './Tabs';

jest.mock('api/me/useAuthUser');
jest.mock('hooks/useFeatureFlag', () => () => true);

// The tabs read the admin projects search params; there is no router here.
let mockSearch: Record<string, unknown> = {};
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => mockSearch,
}));

const getByDataCy = (dataCy: string) =>
  document.querySelector(`[data-cy="${dataCy}"]`);

const getBadge = () => getByDataCy('projects-overview-active-filter-count');

describe('Tabs — active filter count', () => {
  beforeEach(() => {
    mockSearch = {};
  });

  it('does not show a count without active filters', () => {
    mockSearch = { sort: 'recently_viewed', search: 'park' };
    render(<Tabs />);

    expect(getBadge()).not.toBeInTheDocument();
  });

  it.each([
    ['projects', undefined],
    ['calendar', 'calendar'],
  ])('shows the count on the %s tab', (_, tab) => {
    mockSearch = {
      tab,
      status: ['published'],
      review_state: 'pending',
      sort: 'alphabetically_asc',
    };
    render(<Tabs />);

    const badge = getBadge();
    expect(badge).toHaveTextContent(/^3 filters$/);
    expect(
      getByDataCy(
        tab
          ? 'projects-overview-calendar-tab'
          : 'projects-overview-projects-tab'
      )
    ).toContainElement(badge as HTMLElement);
  });

  it('shows the count on the folders tab', () => {
    mockSearch = { tab: 'folders', managers: ['user-1'] };
    render(<Tabs />);

    expect(getByDataCy('projects-overview-folders-tab')).toContainElement(
      getBadge() as HTMLElement
    );
    expect(getBadge()).toHaveTextContent(/^1 filter$/);
  });
});
