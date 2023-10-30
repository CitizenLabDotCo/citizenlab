import type { Meta, StoryObj } from '@storybook/react';
import { FullScreenReport } from '.';

const meta = {
  title: 'Example/FullScreenReport',
  component: FullScreenReport,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FullScreenReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    reportId: '1',
  },
  parameters: {},
};
