// @ts-nocheck
// libraries
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
  waitFor,
} from 'utils/testUtils/rtl';
import moment from 'moment';
import clHistory from 'utils/cl-router/history';

// component to test
import EventInformation from './';

// mocks
const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
  },
};

jest.mock('hooks/useResourceFiles', () => jest.fn(() => []));
jest.mock('hooks/useProject', () => jest.fn(() => mockProjectData));
jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('services/locale');
jest.mock('utils/cl-router/history');

const createEvent = (description) => ({
  attributes: {
    location_multiloc: { en: 'Test Location' },
    title_multiloc: { en: 'Test Event ' },
    description_multiloc: { en: description },
  },
  relationships: { project: { data: { id: '2' } } },
});

const eventWithShortDescription = createEvent('Short description');
const eventWithLongDescription = createEvent(`
  some
  description
  with
  multiple
  lines
`);

const defaultProps = {
  isMultiDayEvent: false,
  startAtMoment: moment('2021-07-01T09:13:00.145Z'),
  endAtMoment: moment('2021-07-01T14:13:00.300Z'),
};

describe('<EventInformation />', () => {
  it('renders', () => {
    render(
      <EventInformation {...defaultProps} event={eventWithShortDescription} />
    );
    expect(screen.getByTestId('EventInformation')).toBeInTheDocument();
  });

  it('shows project title if showProjectTitle={true}', () => {
    render(
      <EventInformation
        {...defaultProps}
        event={eventWithShortDescription}
        showProjectTitle={true}
      />
    );
    expect(
      screen.getByText(mockProjectData.attributes.title_multiloc.en)
    ).toBeInTheDocument();
  });

  it('does not show project title if showProjectTitle={false}', () => {
    render(
      <EventInformation {...defaultProps} event={eventWithShortDescription} />
    );
    expect(
      screen.queryByText(mockProjectData.attributes.title_multiloc.en)
    ).not.toBeInTheDocument();
  });

  it('does not show "Show more" button if description is short', async () => {
    render(
      <EventInformation {...defaultProps} event={eventWithShortDescription} />
    );

    await waitForElementToBeRemoved(() => screen.queryByText('Show more'));
    expect(screen.queryByText('Show more')).not.toBeInTheDocument();
  });

  it('shows "Show more" button if description is long', () => {
    render(
      <EventInformation {...defaultProps} event={eventWithLongDescription} />
    );
    expect(screen.getByText('Show more')).toBeInTheDocument();
  });

  it('correctly shows and hides text when "Show more" and "Show less" are clicked', () => {
    render(
      <EventInformation {...defaultProps} event={eventWithLongDescription} />
    );

    const showMoreButton = screen.getByText('Show more');
    expect(showMoreButton).toBeInTheDocument();

    fireEvent.click(showMoreButton);
    expect(screen.queryByText('Show more')).not.toBeInTheDocument();

    const showLessButton = screen.getByText('Show less');
    expect(showLessButton).toBeInTheDocument();

    fireEvent.click(showLessButton);
    expect(screen.queryByText('Show less')).not.toBeInTheDocument();
    expect(screen.getByText('Show more')).toBeInTheDocument();
  });
});
