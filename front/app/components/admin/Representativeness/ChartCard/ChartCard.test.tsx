import React from 'react';

import { render, screen, waitFor, fireEvent } from 'utils/testUtils/rtl';

import ChartCard from '.';

const generateData = (n: number) => {
  const data: any = [];

  for (let i = 0; i < n; i++) {
    data.push({
      title_multiloc: { en: `label ${i}` },
      actualPercentage: i,
      referencePercentage: i,
      actualNumber: i,
      referenceNumber: i,
    });
  }

  return data;
};

let mockData = generateData(4);

class FakeResizeObserver {
  observe() {}
  disconnect() {}
}

// @ts-ignore
window.ResizeObserver = FakeResizeObserver;

jest.mock('api/r_score/useRScore', () => () => ({
  data: {
    data: {
      attributes: {
        score: 0.8,
      },
    },
  },
}));

jest.mock('hooks/useReferenceData', () => () => ({
  referenceData: mockData,
  includedUsers: {
    known: 85,
    total: 100,
    percentage: 85,
  },
  referenceDataUploaded: true,
}));

const userCustomField: any = {
  id: '4',
  attributes: {
    title_multiloc: { en: 'FIELD TITLE' },
    required: false,
  },
};

describe('<ChartCard />', () => {
  it('renders title', () => {
    render(<ChartCard userCustomField={userCustomField} />);

    expect(screen.getByText('FIELD TITLE')).toBeInTheDocument();
  });

  it('shows representativeness score', () => {
    render(<ChartCard userCustomField={userCustomField} />);

    expect(screen.getByText('Representativeness score:')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });
});

describe('<ChartCard /> (chart view)', () => {
  it('renders legend', () => {
    render(<ChartCard userCustomField={userCustomField} />);

    expect(screen.getByTestId('graph-legend')).toBeInTheDocument();
  });

  describe('N <= 10', () => {
    beforeEach(() => {
      mockData = generateData(6);
    });

    it('renders chart by default', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      expect(
        container.querySelector('.recharts-responsive-container')
      ).toBeInTheDocument();
    });

    it('renders labels', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      waitFor(() => {
        expect(container.querySelectorAll('.recharts-label')).toHaveLength(8);
      });
    });

    it('renders ticks', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      waitFor(() => {
        expect(
          container.querySelectorAll('.recharts-cartesian-axis-tick-line')
        ).toHaveLength(4);
        expect(
          container.querySelectorAll('.recharts-cartesian-axis-tick-value')
        ).toHaveLength(4);
      });
    });

    it('renders included users percentage', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('10 < N <= 12', () => {
    beforeEach(() => {
      mockData = generateData(11);
    });

    it('renders chart by default', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      expect(
        container.querySelector('.recharts-responsive-container')
      ).toBeInTheDocument();
    });

    it('does not render labels', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      waitFor(() => {
        expect(container.querySelectorAll('.recharts-label')).toHaveLength(0);
      });
    });

    it('renders ticks', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      waitFor(() => {
        expect(
          container.querySelectorAll('.recharts-cartesian-axis-tick-line')
        ).toHaveLength(4);
        expect(
          container.querySelectorAll('.recharts-cartesian-axis-tick-value')
        ).toHaveLength(4);
      });
    });

    it('renders included users percentage', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('12 < N <= 24', () => {
    beforeEach(() => {
      mockData = generateData(16);
    });

    it('does not render chart by default', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      expect(
        container.querySelector('.recharts-responsive-container')
      ).not.toBeInTheDocument();

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(
        container.querySelector('.recharts-responsive-container')
      ).toBeInTheDocument();
    });

    it('on select chart view: does not render labels', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      waitFor(() => {
        expect(container.querySelectorAll('.recharts-label')).toHaveLength(0);
      });
    });

    it('on select chart view: does not render ticks', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      waitFor(() => {
        expect(
          container.querySelectorAll('.recharts-cartesian-axis-tick-line')
        ).toHaveLength(0);
        expect(
          container.querySelectorAll('.recharts-cartesian-axis-tick-value')
        ).toHaveLength(0);
      });
    });

    it('on select chart view: renders included users percentage', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('on select chart view: does not render warning', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('24 < N', () => {
    beforeEach(() => {
      mockData = generateData(26);
    });

    it('does not render chart by default', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      expect(
        container.querySelector('.recharts-responsive-container')
      ).not.toBeInTheDocument();

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(
        container.querySelector('.recharts-responsive-container')
      ).toBeInTheDocument();
    });

    it('on select chart view: renders included users percentage', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('on select chart view: renders warning', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(
        screen.getByTestId('representativeness-items-hidden-warning')
      ).toBeInTheDocument();
    });

    it('on select chart view: link in warning switches to tab view', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      const switchToTableViewLink = screen.getByTestId(
        'switch-to-table-view-link'
      );
      expect(switchToTableViewLink).toBeInTheDocument();

      fireEvent.click(switchToTableViewLink);
      expect(container.querySelector('table')).toBeInTheDocument();
    });
  });
});

describe('<ChartCard /> (table view)', () => {
  beforeEach(() => {
    mockData = generateData(6);
  });

  it('does not render legend in table view', () => {
    const { container } = render(
      <ChartCard userCustomField={userCustomField} />
    );

    expect(screen.getByTestId('graph-legend')).toBeInTheDocument();

    const tableTabButton = container.querySelector('button#table');
    fireEvent.click(tableTabButton);

    expect(screen.queryByTestId('graph-legend')).not.toBeInTheDocument();
  });

  describe('N <= 12', () => {
    beforeEach(() => {
      mockData = generateData(4);
    });

    it('does not render table by default', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      expect(container.querySelector('table')).not.toBeInTheDocument();

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(container.querySelectorAll('tbody > tr')).toHaveLength(4);
    });

    it('renders included users percentage', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });

    it('does not render open modal button', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(screen.queryByTestId('show-modal-button')).not.toBeInTheDocument();
    });
  });

  describe('12 < N <= 24', () => {
    beforeEach(() => {
      mockData = generateData(16);
    });

    it('renders table by default', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      expect(container.querySelectorAll('tbody > tr')).toHaveLength(12);
    });

    it('renders included users percentage', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });

    it('renders open modal button', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(screen.getByTestId('show-modal-button')).toBeInTheDocument();
    });
  });

  describe('24 < N', () => {
    beforeEach(() => {
      mockData = generateData(26);
    });

    it('renders included users percentage', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(<ChartCard userCustomField={userCustomField} />);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('Opening modal', () => {
    beforeEach(() => {
      mockData = generateData(16);
    });

    it('opens modal on click button', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      expect(
        container.querySelector('#e2e-modal-container')
      ).not.toBeInTheDocument();

      const button = screen.getByTestId('show-modal-button');
      fireEvent.click(button);

      expect(
        container.querySelector('#e2e-modal-container')
      ).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      const { container } = render(
        <ChartCard userCustomField={userCustomField} />
      );

      const button = screen.getByTestId('show-modal-button');
      fireEvent.click(button);

      const modal = container.querySelector('div#e2e-modal-container');
      const rows = modal.querySelectorAll('tbody > tr');
      expect(rows).toHaveLength(16);
    });
  });
});
