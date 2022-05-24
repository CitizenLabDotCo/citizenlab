import React from 'react';
import { render, screen, waitFor, fireEvent } from 'utils/testUtils/rtl';
import ChartCard from './';
import moment from 'moment';

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocalize');
jest.mock('services/appConfiguration');
jest.mock('services/auth');

const generateData = (n: number) => {
  const data: any = [];

  for (let i = 0; i < n; i++) {
    data.push({
      name: `label ${i}`,
      actualPercentage: i,
      referencePercentage: i,
      actualNumber: i,
      referenceNumber: i,
    });
  }

  return data;
};

const customField: any = {
  id: '1',
  attributes: {
    title_multiloc: { en: 'FIELD TITLE' },
    required: false,
  },
};

const demographicDataDate = moment('2021-09-02');

describe('<ChartCard />', () => {
  it('renders title', () => {
    const data = generateData(4);

    render(
      <ChartCard
        data={data}
        customField={customField}
        representativenessScore={70}
        demographicDataDate={demographicDataDate}
        includedUserPercentage={85}
      />
    );

    expect(screen.getByText('FIELD TITLE')).toBeInTheDocument();
  });

  it('renders representativeness score', () => {
    const data = generateData(4);

    render(
      <ChartCard
        data={data}
        customField={customField}
        representativenessScore={70}
        demographicDataDate={demographicDataDate}
        includedUserPercentage={85}
      />
    );

    expect(screen.getByText('70')).toBeInTheDocument();
  });
});

describe('<ChartCard /> (chart view)', () => {
  it('renders legend', () => {
    const data = generateData(6);

    render(
      <ChartCard
        data={data}
        customField={customField}
        representativenessScore={70}
        demographicDataDate={demographicDataDate}
        includedUserPercentage={85}
      />
    );

    expect(screen.getByTestId('graph-legend')).toBeInTheDocument();
  });

  describe('N <= 10', () => {
    const data = generateData(4);

    it('renders chart by default', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(
        container.querySelector('.recharts-responsive-container')
      ).toBeInTheDocument();
    });

    it('renders labels', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      waitFor(() => {
        expect(container.querySelectorAll('.recharts-label')).toHaveLength(8);
      });
    });

    it('renders ticks', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
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
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('10 < N <= 12', () => {
    const data = generateData(11);

    it('renders chart by default', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(
        container.querySelector('.recharts-responsive-container')
      ).toBeInTheDocument();
    });

    it('does not render labels', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      waitFor(() => {
        expect(container.querySelectorAll('.recharts-label')).toHaveLength(0);
      });
    });

    it('renders ticks', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
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
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('12 < N <= 24', () => {
    const data = generateData(16);

    it('does not render chart by default', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
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
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      waitFor(() => {
        expect(container.querySelectorAll('.recharts-label')).toHaveLength(0);
      });
    });

    it('on select chart view: does not render ticks', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
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
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('on select chart view: does not render warning', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('24 < N', () => {
    const data = generateData(26);

    it('does not render chart by default', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
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
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('on select chart view: renders warning', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      const chartTabButton = container.querySelector('button#chart');
      fireEvent.click(chartTabButton);

      expect(
        screen.getByTestId('representativeness-items-hidden-warning')
      ).toBeInTheDocument();
    });

    it('on select chart view: link in warning switches to tab view', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
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
    const data = generateData(6);

    const { container } = render(
      <ChartCard
        data={data}
        customField={customField}
        representativenessScore={70}
        demographicDataDate={demographicDataDate}
        includedUserPercentage={85}
      />
    );

    expect(screen.getByTestId('graph-legend')).toBeInTheDocument();

    const tableTabButton = container.querySelector('button#table');
    fireEvent.click(tableTabButton);

    expect(screen.queryByTestId('graph-legend')).not.toBeInTheDocument();
  });

  describe('N <= 12', () => {
    const data = generateData(4);

    it('does not render table by default', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(container.querySelector('table.ui.table')).not.toBeInTheDocument();

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(container.querySelector('table.ui.table')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(container.querySelectorAll('tbody > tr')).toHaveLength(4);
    });

    it('renders included users percentage', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      const tableTabButton = container.querySelector('button#table');
      fireEvent.click(tableTabButton);

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });

    it('does not render open modal button', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(screen.queryByTestId('show-modal-button')).not.toBeInTheDocument();
    });
  });

  describe('12 < N <= 24', () => {
    const data = generateData(16);

    it('renders table by default', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(container.querySelector('table.ui.table')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(container.querySelectorAll('tbody > tr')).toHaveLength(12);
    });

    it('renders included users percentage', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });

    it('renders open modal button', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(screen.getByTestId('show-modal-button')).toBeInTheDocument();
    });
  });

  describe('24 < N', () => {
    const data = generateData(26);

    it('renders included users percentage', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('does not render warning', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      expect(
        screen.queryByTestId('representativeness-items-hidden-warning')
      ).not.toBeInTheDocument();
    });
  });

  describe('Opening modal', () => {
    const data = generateData(16);

    it('opens modal on click button', () => {
      const { container } = render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
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
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      const button = screen.getByTestId('show-modal-button');
      fireEvent.click(button);

      const modal = container.querySelector('div#e2e-modal-container');
      const rows = modal.querySelectorAll('tbody > tr');
      expect(rows).toHaveLength(16);
    });
  });
});
