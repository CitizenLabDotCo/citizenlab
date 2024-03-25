import ColorPickerInput from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/ColorPickerInput',
  component: ColorPickerInput,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ColorPickerInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'text',
    value: '#000',
    onChange: () => {},
    label: 'Color picker',
  },
};

export const WithLabelAnbdLabelTooptip = {
  args: {
    type: 'text',
    value: '#000',
    onChange: () => {},
    label: 'This is a very long and unnecessary label',
    labelTooltipText: 'this is a tooltip',
  },
};
