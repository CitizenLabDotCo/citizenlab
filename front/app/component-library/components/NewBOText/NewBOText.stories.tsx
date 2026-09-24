import NewBOText from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/NewBOText',
  component: NewBOText,
} satisfies Meta<typeof NewBOText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Section: Story = {
  args: {
    variant: 'section',
    children: 'Section header · group / field label',
  },
};

export const Label: Story = {
  args: { variant: 'label', children: 'Control / option label' },
};

export const Helper: Story = {
  args: { variant: 'helper', children: 'Helper / description text' },
};

export const Micro: Story = {
  args: { variant: 'micro', children: 'Micro / hint' },
};
