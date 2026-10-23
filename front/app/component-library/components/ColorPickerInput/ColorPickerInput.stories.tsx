import { userEvent, waitFor, within } from 'storybook/test';

import ColorPickerInput from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Forms/ColorPickerInput',
  tags: ['shared'],
  parameters: { gv: {} },
  component: ColorPickerInput,
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

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['input'] } },
};

// Focusing the input opens the picker, so Open covers the focus state too.
export const Open: Story = {
  args: Default.args,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('textbox'));
    // The picker is a lazy chunk; wait until it is on screen.
    await waitFor(
      () => {
        if (!canvasElement.querySelector('.chrome-picker')) {
          throw new Error('Colour picker not open yet');
        }
      },
      { timeout: 3000 }
    );
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { ...Default.args, label: 'اللون' },
};
