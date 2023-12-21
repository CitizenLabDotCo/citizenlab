import React from 'react';
import AgeWidget from '.';
import { render } from 'utils/testUtils/rtl';
import useAgeSerie from 'containers/Admin/dashboard/users/Charts/AgeChart/useAgeSerie';

const mockAgeSerie: any = null;
jest.mock('containers/Admin/dashboard/users/Charts/AgeChart/useAgeSerie', () =>
  jest.fn(() => mockAgeSerie)
);

describe.skip('<AgeWidget />', () => {
  const startAt = undefined;
  const endAt = undefined;
  const projectId = undefined;
  const title = { en: 'AGE TITLE' };

  it('renders a title and bar chart when there is data', () => {
    const validData = [
      { name: '10 - 19', value: 1 },
      { name: '20 - 29', value: 1 },
    ];

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
    const emptyData = [
      { name: '10 - 19', value: 0 },
      { name: '20 - 29', value: 0 },
    ];

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
