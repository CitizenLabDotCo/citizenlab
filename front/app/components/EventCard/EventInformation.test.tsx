// @ts-nocheck
// libraries
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from 'utils/testUtils/rtl';
import moment from 'moment';

// component to test
import EventInformation from './EventInformation';

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

const createEvent = (description) => ({
  attributes: {
    location_multiloc: { en: 'Test Location' },
    title_multiloc: { en: 'Test Event ' },
    description_multiloc: { en: description },
  },
  relationships: { project: { data: { id: '2' } } },
});

const defaultProps = {
  isMultiDayEvent: false,
  startAtMoment: moment('2021-07-01T09:13:00.145Z'),
  endAtMoment: moment('2021-07-01T14:13:00.300Z'),
};

describe('<EventInformation />', () => {
  it('renders', () => {
    const event = createEvent('');

    render(<EventInformation {...defaultProps} event={event} />);
    expect(screen.getByTestId('EventInformation')).toBeInTheDocument();
  });

  it('shows project title if showProjectTitle={true}', () => {
    const event = createEvent('');

    render(
      <EventInformation
        {...defaultProps}
        event={event}
        showProjectTitle={true}
      />
    );
    expect(
      screen.getByText(mockProjectData.attributes.title_multiloc.en)
    ).toBeInTheDocument();
  });

  it('does not show project title if showProjectTitle={false}', () => {
    const event = createEvent('');

    render(<EventInformation {...defaultProps} event={event} />);
    expect(
      screen.queryByText(mockProjectData.attributes.title_multiloc.en)
    ).not.toBeInTheDocument();
  });

  it('does not show "read more" button if description is short', async () => {
    const event = createEvent('Short description');

    render(<EventInformation {...defaultProps} event={event} />);

    await waitForElementToBeRemoved(() =>
      screen.queryByTestId('ReadMoreButton')
    );
    expect(screen.queryByTestId('ReadMoreButton')).not.toBeInTheDocument();
  });

  it('shows "read more" button if description is long', () => {
    const event = createEvent(`
      some
      description
      with
      multiple
      lines
    `);

    render(<EventInformation {...defaultProps} event={event} />);
    expect(screen.getByTestId('ReadMoreButton')).toBeInTheDocument();
  });
});
