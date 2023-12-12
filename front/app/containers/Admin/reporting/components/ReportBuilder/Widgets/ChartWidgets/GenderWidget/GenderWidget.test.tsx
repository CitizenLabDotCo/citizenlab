import React from 'react';
import GenderWidget from '.';
import { render } from 'utils/testUtils/rtl';

jest.mock('containers/Admin/reporting/hooks/useLayout', () => () => 'narrow');

let mockGenderSerie: any = null;
jest.mock(
  'containers/Admin/dashboard/users/Charts/GenderChart/useGenderSerie',
  () => jest.fn(() => mockGenderSerie)
);

describe.skip('<GenderWidget />', () => {
  const startAt = undefined;
  const endAt = undefined;
  const projectId = undefined;
  const title = { en: 'GENDER TITLE' };

  it('renders a title and pie chart when there is data', () => {
    const validData = [
      { value: 4, name: 'male', code: 'male', percentage: 40 },
      { value: 6, name: 'female', code: 'female', percentage: 60 },
    ];

    mockGenderSerie = validData;

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
    const emptyData = [
      { value: 0, name: 'male', code: 'male', percentage: 0 },
      { value: 0, name: 'female', code: 'female', percentage: 0 },
    ];

    mockGenderSerie = emptyData;

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
