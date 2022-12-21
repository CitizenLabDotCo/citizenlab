import React from 'react';
import AgeCard from './AgeCard';
import { render } from 'utils/testUtils/rtl';

jest.mock(
  'containers/Admin/dashboard/users/Charts/AgeChart/useAgeSerie',
  () => () =>
    [
      { name: '10 - 19', value: 0 },
      { name: '20 - 29', value: 0 },
    ]
);

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

// @ts-ignore
window.ResizeObserver = FakeResizeObserver;

describe('<AgeCard />', () => {
  it('renders a title and bar graph', () => {
    const startAt = null;
    const endAt = null;
    const projectId = undefined;
    const title = 'AGE TITLE';

    const { container } = render(
      <AgeCard
        startAt={startAt}
        endAt={endAt}
        title={title}
        projectId={projectId}
      />
    );

    // Title
    expect(container.querySelector('h3').innerHTML).toBe(title);

    // Bar graph
    expect(
      container.querySelector('.recharts-responsive-container')
    ).toBeInTheDocument();
  });
});
