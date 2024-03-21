import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import IconTooltip from '.';

const meta = {
  title: 'Components/IconTooltip',
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
