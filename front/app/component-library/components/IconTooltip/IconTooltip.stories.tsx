import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import IconTooltip from '.';

const meta = {
  title: 'Components/Overlays/IconTooltip',
  tags: ['shared'],
  parameters: { gv: {} },
  component: IconTooltip,
} satisfies Meta<typeof IconTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'Some text',
  },
  name: 'IconTooltip (hover me)',
};

export const WithJsxElement: Story = {
  args: { content: <div>A div with some text</div> },
};

export const FixedBottomPlacement: Story = {
  args: { ...Default.args, placement: 'bottom' },
};

export const WithTransformTranslate: Story = {
  args: {
    ...Default.args,
    placement: 'bottom',
    transform: 'translate(10,10)',
  },
};

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: true } },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focus: true, focusVisible: true } },
};

export const Open: Story = {
  args: Default.args,
  decorators: [
    (Story) => (
      <div style={{ minHeight: '120px', padding: '16px' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('tooltip');
    await userEvent.hover(button);
  },
};

export const LongContent: Story = {
  args: {
    content:
      "Participants can submit ideas, comment on each other's ideas and vote on the ones they want to see next, for as long as the phase stays open to the whole community.",
    maxTooltipWidth: 240,
  },
};

export const RTL: Story = {
  args: { content: 'هذا نص توضيحي' },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
