import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import {
  GraphCard,
  GraphCardHeader,
  GraphCardInner,
  GraphCardTitle,
  GraphsContainer,
  NoDataContainer,
} from '.';

// The dashboard card wrappers around a graph. A plain bar block stands in
// for the chart.
type ExampleProps = {
  titles: string[];
  noData?: string;
  fullWidth?: boolean;
};

const Bars = () => (
  <Box display="flex" alignItems="flex-end" gap="12px" height="160px" px="20px">
    {[40, 90, 65, 120, 80].map((h) => (
      <Box key={h} width="32px" height={`${h}px`} bg="#2f6fb1" />
    ))}
  </Box>
);

const GraphExample = ({ titles, noData, fullWidth }: ExampleProps) => (
  <Box width="1000px" p="10px" bg="#f4f4f6">
    <GraphsContainer>
      {titles.map((title) => (
        <GraphCard key={title} className={fullWidth ? 'fullWidth' : ''}>
          <GraphCardInner>
            <GraphCardHeader>
              <GraphCardTitle>{title}</GraphCardTitle>
            </GraphCardHeader>
            {noData ? <NoDataContainer>{noData}</NoDataContainer> : <Bars />}
          </GraphCardInner>
        </GraphCard>
      ))}
    </GraphsContainer>
  </Box>
);

const meta = {
  title: 'Components/Data display/GraphWrappers',
  tags: ['shared'],
  parameters: { gv: {} },
  component: GraphsContainer,
  render: (args) => <GraphExample {...(args as unknown as ExampleProps)} />,
} satisfies Meta<typeof GraphsContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { titles: ['Registrations', 'Inputs'] } as never,
};

export const NoData: Story = {
  args: {
    titles: ['Registrations', 'Inputs'],
    noData: 'No data for this period',
  } as never,
};

export const FullWidth: Story = {
  args: { titles: ['Registrations'], fullWidth: true } as never,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { titles: ['التسجيلات', 'المدخلات'] } as never,
};
