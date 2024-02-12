import React from 'react';
import AgeWidget from '.';
import { render } from 'utils/testUtils/rtl';

const mockUsersByBirthyear: any = null;
jest.mock('api/users_by_birthyear/useUsersByBirthyear', () =>
  jest.fn(() => mockUsersByBirthyear)
);

describe.skip('<AgeWidget />', () => {
  const startAt = undefined;
  const endAt = undefined;
  const projectId = undefined;
  const title = { en: 'AGE TITLE' };

  it('renders a title and bar chart when there is data', () => {
    const validData = {
      data: {
        type: 'users_by_custom_field',
        attributes: {
          series: {
            users: {
              10: 1,
              20: 1,
            },
          },
        },
      },
    };

    // @ts-ignore
    useAgeSerie.mockReturnValue(validData);

    const { container } = render(
      <AgeWidget
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
              10: 0,
              20: 0,
            },
          },
        },
      },
    };

    // @ts-ignore
    useAgeSerie.mockReturnValue(emptyData);

    const { container } = render(
      <AgeWidget
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
