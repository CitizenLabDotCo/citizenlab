import React from 'react';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import Settings from './Settings';

let props: Record<string, unknown> = {};
const setProp = jest.fn((mutate: (draft: Record<string, unknown>) => void) =>
  mutate(props)
);
jest.mock('@craftjs/core', () => ({
  useNode: (collect: (node: { data: { props: unknown } }) => unknown) => ({
    ...(collect({ data: { props } }) as object),
    actions: { setProp },
  }),
}));

let spacesEnabled = true;
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => spacesEnabled));

const list = (...entities: [string, string][]) => ({
  data: entities.map(([id, title]) => ({
    id,
    attributes: { title_multiloc: { en: title } },
  })),
});

let areas: unknown = list(['area-1', 'North'], ['area-2', 'South']);
jest.mock('api/areas/useAreas', () => ({
  __esModule: true,
  default: () => ({ data: areas }),
}));
jest.mock('api/global_topics/useGlobalTopics', () => ({
  __esModule: true,
  default: () => ({ data: list(['tag-1', 'Mobility']) }),
}));
jest.mock('api/spaces/useSpaces', () => ({
  __esModule: true,
  default: () => ({ data: list(['space-1', 'Downtown']) }),
}));

describe('ProjectsByFilter Settings', () => {
  beforeEach(() => {
    props = {};
    spacesEnabled = true;
    areas = list(['area-1', 'North'], ['area-2', 'South']);
    setProp.mockClear();
  });

  const dimensions = () =>
    Array.from(screen.getByTestId('select').querySelectorAll('option'))
      .map((option) => option.textContent)
      .filter(Boolean);

  it('offers tags, areas and spaces when the spaces feature is on', () => {
    render(<Settings />);

    expect(dimensions()).toEqual([
      'One of these tags',
      'One of these areas',
      'One of these spaces',
    ]);
  });

  it('hides the spaces dimension when its feature is off', () => {
    spacesEnabled = false;

    render(<Settings />);

    expect(dimensions()).not.toContain('One of these spaces');
  });

  // Ids only mean something within their own dimension: kept across a switch, area ids would
  // silently be read as tag ids.
  it('clears the selection when the dimension changes', () => {
    props = { filterType: 'areas', ids: ['area-1'] };

    render(<Settings />);
    fireEvent.change(screen.getByTestId('select'), {
      target: { value: 'global_topics' },
    });

    expect(props).toEqual({ filterType: 'global_topics', ids: [] });
  });

  // The panel used to return a spinner in place of everything until its entity list arrived,
  // so a query that never resolved left the title and the dimension unreachable.
  it('keeps the rest of the panel usable while the entity list is missing', () => {
    areas = undefined;
    props = { filterType: 'areas' };

    render(<Settings />);

    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });
});
