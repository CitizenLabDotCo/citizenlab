import React from 'react';
import { render, screen, waitFor } from 'utils/testUtils/rtl';
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

  // it('allows switching from graph to table view and vice versa', () => {
  // TODO
  // })
});

describe('<ChartCard />: chart view', () => {
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

    it('does not render ticks', () => {
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
        ).toHaveLength(0);
        expect(
          container.querySelectorAll('.recharts-cartesian-axis-tick-value')
        ).toHaveLength(0);
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

      // expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
      // TODO
    });

    it('on select chart view: renders included users percentage', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      // TODO

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('on select chart view: does not render included users percentage', () => {
      render(
        <ChartCard
          data={data}
          customField={customField}
          representativenessScore={70}
          demographicDataDate={demographicDataDate}
          includedUserPercentage={85}
        />
      );

      // expect(screen.getByText('85%')).toBeInTheDocument();
      // TODO
    });

    it('on select chart view: renders warning', () => {
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
});

describe('<ChartCard />: table view', () => {
  // TODO
});
