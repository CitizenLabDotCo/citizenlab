import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
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

  describe('N < 10', () => {
    const data = generateData(4);

    it('renders chart by default', () => {
      // TODO
    });

    it('renders labels', () => {
      // TODO
    });

    it('renders ticks', () => {
      // TODO
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
      // TODO
    });
  });
});
