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

let flags: Record<string, boolean> = {
  spaces: true,
  advanced_custom_pages: true,
};
jest.mock('hooks/useFeatureFlag', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => flags[name],
}));

const list = (...entities: [string, string][]) => ({
  data: entities.map(([id, title]) => ({
    id,
    attributes: { title_multiloc: { en: title } },
  })),
});

jest.mock('api/projects/useProjects', () => ({
  __esModule: true,
  default: () => ({ data: list(['project-1', 'Riverside']) }),
}));
jest.mock('api/areas/useAreas', () => ({
  __esModule: true,
  default: () => ({ data: list(['area-1', 'North']) }),
}));
jest.mock('api/global_topics/useGlobalTopics', () => ({
  __esModule: true,
  default: () => ({ data: list(['tag-1', 'Mobility']) }),
}));
jest.mock('api/spaces/useSpaces', () => ({
  __esModule: true,
  default: () => ({ data: list(['space-1', 'Downtown']) }),
}));

describe('EventsByProjects Settings', () => {
  beforeEach(() => {
    props = {};
    flags = { spaces: true, advanced_custom_pages: true };
    setProp.mockClear();
  });

  const modes = () =>
    Array.from(screen.getByTestId('select').querySelectorAll('option'))
      .map((option) => option.textContent)
      .filter(Boolean);

  it('offers every project plus the four filtered modes', () => {
    render(<Settings />);

    expect(modes()).toEqual([
      'Every project',
      'These projects',
      'Projects with one of these tags',
      'Projects in one of these areas',
      'Projects in one of these spaces',
    ]);
  });

  it('hides the spaces mode when its feature is off', () => {
    flags.spaces = false;

    render(<Settings />);

    expect(modes()).not.toContain('Projects in one of these spaces');
  });

  it('clears the selection when the mode changes', () => {
    props = { mode: 'areas', ids: ['area-1'] };

    render(<Settings />);
    fireEvent.change(screen.getByTestId('select'), {
      target: { value: 'projects' },
    });

    expect(props).toEqual({ mode: 'projects', ids: [] });
  });

  it('shows no selector in the every-project mode', () => {
    render(<Settings />);

    expect(screen.queryByText('Selection')).not.toBeInTheDocument();
  });

  it('shows a selector once a filtered mode is picked', () => {
    props = { mode: 'areas', ids: [] };

    render(<Settings />);

    expect(screen.getByText('Selection')).toBeInTheDocument();
  });

  // A one-option dropdown reads as broken, and the copy must not promise a picker.
  it('drops the mode dropdown and the picker copy without advanced_custom_pages', () => {
    flags.advanced_custom_pages = false;

    render(<Settings />);

    expect(screen.queryByTestId('select')).not.toBeInTheDocument();
    expect(
      screen.getByText(/from every published project/i)
    ).toBeInTheDocument();
  });

  it('describes the picker once a filtered mode is available', () => {
    props = { mode: 'areas', ids: [] };

    render(<Settings />);

    expect(screen.getByText(/you pick below/i)).toBeInTheDocument();
  });

  // A filtered mode outlives the feature it needed; the leftover picker would change nothing.
  it('drops the picker for a stored filtered mode once the feature is off', () => {
    props = { mode: 'areas', ids: ['area-1'] };
    flags.advanced_custom_pages = false;

    render(<Settings />);

    expect(screen.queryByText('Selection')).not.toBeInTheDocument();
    expect(screen.queryByTestId('select')).not.toBeInTheDocument();
    expect(screen.queryByText(/you pick below/i)).not.toBeInTheDocument();
  });
});
