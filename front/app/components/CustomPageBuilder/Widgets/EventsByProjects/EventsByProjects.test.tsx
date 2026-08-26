import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import { filtersFor } from './types';

import EventsByProjects from '.';

let inBuilder = true;
jest.mock('@craftjs/core', () => ({
  useEditor: (collect: (state: { options: { enabled: boolean } }) => unknown) =>
    collect({ options: { enabled: inBuilder } }),
  useNode: jest.fn(),
}));

const eventsWidget = jest.fn();
const sectionBackground = jest.fn();
jest.mock('components/ProjectPageBuilder/Widgets/SectionBackground', () => ({
  __esModule: true,
  default: ({
    colored,
    children,
  }: {
    colored: boolean;
    children: React.ReactNode;
  }) => {
    sectionBackground({ colored });
    return <div>{children}</div>;
  },
}));
jest.mock('components/ProjectPageBuilder/Widgets/useIsPageBodyChild', () => ({
  __esModule: true,
  default: () => true,
}));

jest.mock('components/LandingPages/citizen/EventsWidget', () => ({
  __esModule: true,
  default: (props: unknown) => {
    eventsWidget(props);
    return <div data-testid="events-widget" />;
  },
}));

describe('EventsByProjects', () => {
  beforeEach(() => {
    inBuilder = true;
    eventsWidget.mockClear();
    sectionBackground.mockClear();
  });

  it('renders on white unless an admin asks for a coloured band', () => {
    render(<EventsByProjects />);

    expect(sectionBackground).toHaveBeenCalledWith({ colored: false });
  });

  it('renders a coloured band when set, which is what migration sets', () => {
    render(<EventsByProjects sectionBackground="colored" />);

    expect(sectionBackground).toHaveBeenCalledWith({ colored: true });
  });

  it('shows every project’s events when unconfigured', () => {
    render(<EventsByProjects />);

    expect(screen.getByTestId('events-widget')).toBeInTheDocument();
    expect(eventsWidget).toHaveBeenCalledWith({ filters: {} });
  });

  it('prompts for a selection in the builder when a mode is picked but nothing is', () => {
    render(<EventsByProjects mode="areas" ids={[]} />);

    expect(screen.getByText(/pick at least one/i)).toBeInTheDocument();
    expect(screen.queryByTestId('events-widget')).not.toBeInTheDocument();
  });

  it('renders nothing in the front office when nothing is selected', () => {
    inBuilder = false;
    render(<EventsByProjects mode="areas" ids={[]} />);

    expect(screen.queryByText(/pick at least one/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('events-widget')).not.toBeInTheDocument();
  });

  it('passes the selected dimension through', () => {
    render(<EventsByProjects mode="areas" ids={['area-1']} />);

    expect(eventsWidget).toHaveBeenCalledWith({
      filters: { areas: ['area-1'] },
    });
  });

  // The four filtered modes map onto the query params the events endpoint understands.
  it.each([
    ['projects', { projectIds: ['x'] }],
    ['global_topics', { globalTopics: ['x'] }],
    ['areas', { areas: ['x'] }],
    ['spaces', { spaces: ['x'] }],
  ] as const)('maps %s onto its query param', (mode, expected) => {
    expect(filtersFor(mode, ['x'])).toEqual(expected);
  });
});
