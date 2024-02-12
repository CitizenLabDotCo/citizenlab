import React from 'react';
import GenderWidget from '.';
import { render } from 'utils/testUtils/rtl';

jest.mock('containers/Admin/reporting/hooks/useLayout', () => () => 'narrow');

let mockUsersByGender: any = null;
jest.mock('api/users_by_gender/useUsersByGender', () =>
  jest.fn(() => mockUsersByGender)
);

describe.skip('<GenderWidget />', () => {
  const startAt = undefined;
  const endAt = undefined;
  const projectId = undefined;
  const title = { en: 'GENDER TITLE' };

  it('renders a title and pie chart when there is data', () => {
    const validData = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
          series: {
            users: {
              male: 4,
              female: 6,
            },
          },
        },
      },
    };

    mockUsersByGender = validData;

    const { container } = render(
      <GenderWidget
        startAt={startAt}
        endAt={endAt}
        title={title}
        projectId={projectId}
      />
    );

    // Title
    expect(container.querySelector('h3').innerHTML).toBe(title);

    // Pie chart
    expect(
      container.querySelector('.recharts-responsive-container')
    ).toBeInTheDocument();
  });

  it('renders a title and no data message if all values are zero', () => {
    const emptyData = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
          series: {
            users: {
              male: 0,
              female: 0,
            },
          },
        },
      },
    };

    mockUsersByGender = emptyData;

    const { container } = render(
      <GenderWidget
        startAt={startAt}
        endAt={endAt}
        title={title}
        projectId={projectId}
      />
    );

    // Title
    expect(container.querySelector('h3').innerHTML).toBe(title);

    // Empty data
    expect(container.querySelector('.no-chart-data')).toBeInTheDocument();
  });
});
