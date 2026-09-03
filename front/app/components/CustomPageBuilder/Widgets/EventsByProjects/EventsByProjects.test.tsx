import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import { filtersFor } from './utils';

import EventsByProjects from '.';

let advancedCustomPages = true;
jest.mock('hooks/useFeatureFlag', () => ({
  __esModule: true,
  default: () => advancedCustomPages,
}));

let inBuilder = true;
jest.mock('@craftjs/core', () => ({
  useEditor: (collect: (state: { options: { enabled: boolean } }) => unknown) =>
    collect({ options: { enabled: inBuilder } }),
  useNode: jest.fn(),
}));

const eventsWidget = jest.fn();
jest.mock(
  'components/admin/ContentBuilder/useCraftComponentDefaultPadding',
  () => ({ __esModule: true, default: () => '0px' })
);

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
    advancedCustomPages = true;
    eventsWidget.mockClear();
  });

  it('shows every project’s events when unconfigured', () => {
    render(<EventsByProjects />);

    expect(screen.getByTestId('events-widget')).toBeInTheDocument();
    expect(eventsWidget).toHaveBeenCalledWith({
      filters: {},
      titleMultiloc: {},
    });
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

  it('passes an admin heading through to the events list', () => {
    const titleMultiloc = { en: 'Events in Northside' };
    render(<EventsByProjects titleMultiloc={titleMultiloc} />);

    expect(eventsWidget).toHaveBeenCalledWith(
      expect.objectContaining({ titleMultiloc })
    );
  });

  it('passes the selected dimension through', () => {
    render(<EventsByProjects mode="areas" ids={['area-1']} />);

    expect(eventsWidget).toHaveBeenCalledWith({
      filters: { areas: ['area-1'] },
      titleMultiloc: {},
    });
  });

  it.each([
    ['projects', { projectIds: ['x'] }],
    ['global_topics', { globalTopics: ['x'] }],
    ['areas', { areas: ['x'] }],
    ['spaces', { spaces: ['x'] }],
  ] as const)('maps %s onto its query param', (mode, expected) => {
    expect(filtersFor(mode, ['x'])).toEqual(expected);
  });

  it('renders nothing in the front office when a filtered mode loses the feature', () => {
    advancedCustomPages = false;
    inBuilder = false;

    render(<EventsByProjects mode="areas" ids={['area-1']} />);

    expect(screen.queryByTestId('events-widget')).not.toBeInTheDocument();
  });

  it('still shows every project’s events without the feature', () => {
    advancedCustomPages = false;

    render(<EventsByProjects />);

    expect(screen.getByTestId('events-widget')).toBeInTheDocument();
  });
});
