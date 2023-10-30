import type { Meta, StoryObj } from '@storybook/react';
import FullscreenReport from '.';

const meta = {
  title: 'Example/FullscreenReport',
  component: FullscreenReport,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FullscreenReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    reportId: '1',
  },
  parameters: {},
};
