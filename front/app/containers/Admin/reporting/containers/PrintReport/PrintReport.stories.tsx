import type { Meta, StoryObj } from '@storybook/react';
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
