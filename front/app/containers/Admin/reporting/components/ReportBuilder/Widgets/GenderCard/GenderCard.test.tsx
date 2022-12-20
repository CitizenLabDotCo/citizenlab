import React from 'react';
import GenderCard from '.';
import { render } from 'utils/testUtils/rtl';

jest.mock(
  'containers/Admin/dashboard/users/Charts/GenderChart/useGenderSerie',
  () => () =>
    [
      { name: '10 - 19', value: 0 },
      { name: '20 - 29', value: 0 },
    ]
);

jest.mock('containers/Admin/reporting/hooks/useNarrow', () => () => true);

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

// @ts-ignore
window.ResizeObserver = FakeResizeObserver;

describe('<GenderCard />', () => {
  it('renders a title and pie chart', () => {
    const startAt = null;
    const endAt = null;
    const projectId = undefined;
    const title = 'GENDER TITLE';

    const { container } = render(
      <GenderCard
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
});
