import type { Meta, StoryObj } from '@storybook/react';
import mockEndpoints from 'utils/storybook/mockEndpoints';
import { surveyReportHandler } from 'api/report_layout/__mocks__/_mockServer';
import { PrintReport } from '.';

const meta = {
  title: 'Example/PrintReport',
  component: PrintReport,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PrintReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ideation: Story = {
  args: {
    reportId: '1',
    _print: false,
  },
  parameters: {},
};

export const Survey: Story = {
  args: {
    reportId: '1',
    _print: false,
  },
  parameters: {
    msw: mockEndpoints({
      'GET reports/:id/layout': surveyReportHandler,
    }),
  },
};
