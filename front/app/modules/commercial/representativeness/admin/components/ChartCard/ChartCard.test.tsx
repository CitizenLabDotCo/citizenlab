import React from 'react';
import { render, screen, waitFor, fireEvent } from 'utils/testUtils/rtl';
import ChartCard from './';

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocalize');
jest.mock('services/appConfiguration');
jest.mock('services/auth');

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

jest.mock('../../hooks/useReferenceData', () => (field) => ({
  referenceData: generateData(field.id as number),
  includedUserPercentage: 85,
  referenceDataUploaded: true,
}));

let customField: any = {
  id: '4',
  attributes: {
    title_multiloc: { en: 'FIELD TITLE' },
    required: false,
  },
};

describe('<ChartCard />', () => {
  it('renders title', () => {
    render(<ChartCard customField={{ ...customField, id: '4' }} />);

    expect(screen.getByText('FIELD TITLE')).toBeInTheDocument();
  });
});

describe('<ChartCard /> (chart view)', () => {
  it('renders legend', () => {
    render(<ChartCard customField={{ ...customField, id: '4' }} />);

    expect(screen.getByTestId('graph-legend')).toBeInTheDocument();
  });

  describe('N <= 10', () => {
    customField.id = '6';
    it('renders chart by default', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '6' }} />
      );

      expect(
        container.querySelector('.recharts-responsive-container')
      ).toBeInTheDocument();
    });

    it('renders labels', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '6' }} />
      );

      waitFor(() => {
        expect(container.querySelectorAll('.recharts-label')).toHaveLength(8);
      });
    });

    it('renders ticks', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '6' }} />
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
      render(<ChartCard customField={{ ...customField, id: '6' }} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(<ChartCard customField={{ ...customField, id: '6' }} />);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('10 < N <= 12', () => {
    it('renders chart by default', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '11' }} />
      );

      expect(
        container.querySelector('.recharts-responsive-container')
      ).toBeInTheDocument();
    });

    it('does not render labels', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '11' }} />
      );

      waitFor(() => {
        expect(container.querySelectorAll('.recharts-label')).toHaveLength(0);
      });
    });

    it('renders ticks', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '11' }} />
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
      render(<ChartCard customField={{ ...customField, id: '11' }} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(<ChartCard customField={{ ...customField, id: '11' }} />);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('12 < N <= 24', () => {
    it('does not render chart by default', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '16', log: true }} />
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
        <ChartCard customField={{ ...customField, id: '16' }} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      waitFor(() => {
        expect(container.querySelectorAll('.recharts-label')).toHaveLength(0);
      });
    });

    it('on select chart view: does not render ticks', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '16' }} />
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
        <ChartCard customField={{ ...customField, id: '16' }} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('on select chart view: does not render warning', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '16' }} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('24 < N', () => {
    it('does not render chart by default', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '26' }} />
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
        <ChartCard customField={{ ...customField, id: '26' }} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('on select chart view: renders warning', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '26' }} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(
        screen.getByTestId('representativeness-items-hidden-warning')
      ).toBeInTheDocument();
    });

    it('on select chart view: link in warning switches to tab view', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '26' }} />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      const switchToTableViewLink = screen.getByTestId(
        'switch-to-table-view-link'
      );
      expect(switchToTableViewLink).toBeInTheDocument();

      fireEvent.click(switchToTableViewLink);
      expect(container.querySelector('table.ui.table')).toBeInTheDocument();
    });
  });
});

describe('<ChartCard /> (table view)', () => {
  it('does not render legend in table view', () => {
    const { container } = render(
      <ChartCard customField={{ ...customField, id: '6' }} />
    );

    expect(screen.getByTestId('graph-legend')).toBeInTheDocument();

    const tableTabButton = container.querySelector('button#table');
    fireEvent.click(tableTabButton);

    expect(screen.queryByTestId('graph-legend')).not.toBeInTheDocument();
  });

  describe('N <= 12', () => {
    it('does not render table by default', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '4' }} />
      );

      expect(container.querySelector('table.ui.table')).not.toBeInTheDocument();

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(container.querySelector('table.ui.table')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '4' }} />
      );

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(container.querySelectorAll('tbody > tr')).toHaveLength(4);
    });

    it('renders included users percentage', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '4' }} />
      );

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '4' }} />
      );

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });

    it('does not render open modal button', () => {
      render(<ChartCard customField={{ ...customField, id: '4' }} />);

      expect(screen.queryByTestId('show-modal-button')).not.toBeInTheDocument();
    });
  });

  describe('12 < N <= 24', () => {
    it('renders table by default', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '16' }} />
      );

      expect(container.querySelector('table.ui.table')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '16' }} />
      );

      expect(container.querySelectorAll('tbody > tr')).toHaveLength(12);
    });

    it('renders included users percentage', () => {
      render(<ChartCard customField={{ ...customField, id: '16' }} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(<ChartCard customField={{ ...customField, id: '16' }} />);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });

    it('renders open modal button', () => {
      render(<ChartCard customField={{ ...customField, id: '16' }} />);

      expect(screen.getByTestId('show-modal-button')).toBeInTheDocument();
    });
  });

  describe('24 < N', () => {
    it('renders included users percentage', () => {
      render(<ChartCard customField={{ ...customField, id: '26' }} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(<ChartCard customField={{ ...customField, id: '26' }} />);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('Opening modal', () => {
    it('opens modal on click button', () => {
      const { container } = render(
        <ChartCard customField={{ ...customField, id: '16' }} />
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
        <ChartCard customField={{ ...customField, id: '16' }} />
      );

      const button = screen.getByTestId('show-modal-button');
      fireEvent.click(button);

      const modal = container.querySelector('div#e2e-modal-container');
      const rows = modal.querySelectorAll('tbody > tr');
      expect(rows).toHaveLength(16);
    });
  });
});
