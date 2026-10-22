import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Text from './';

const meta = {
  title: 'Components/Typography/Text',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BodyL: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
    variant: 'bodyL',
  },
};

export const BodyM: Story = {
  args: {
    ...BodyL.args,
    variant: 'bodyM',
  },
};

export const BodyS: Story = {
  args: {
    ...BodyL.args,
    variant: 'bodyS',
  },
};

export const BodyXs: Story = {
  args: {
    ...BodyL.args,
    variant: 'bodyXs',
  },
};

export const BackOfficeSection: Story = {
  args: {
    children: 'Section header · group / field label',
    variant: 'boSection',
  },
};

export const BackOfficeLabel: Story = {
  args: {
    children: 'Control / option label',
    variant: 'boLabel',
  },
};

export const BackOfficeHelper: Story = {
  args: {
    children: 'Helper / description text',
    variant: 'boHelper',
  },
};

export const BackOfficeMicro: Story = {
  args: {
    children: 'Micro / hint',
    variant: 'boMicro',
  },
};

export const Default: Story = {
  args: {
    children: 'Participants can submit ideas and vote on them.',
    variant: 'bodyM',
  },
};

export const LongContent: Story = {
  args: {
    variant: 'bodyM',
    children:
      "Participants can submit ideas, comment on each other's ideas and vote on the ones they want to see in the next budget cycle, for as long as the phase stays open to the whole community",
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <Text {...args} />
    </div>
  ),
};

export const RTL: Story = {
  args: {
    variant: 'bodyM',
    children: 'يمكن للمشاركين إرسال الأفكار والتصويت عليها.',
  },
  render: (args) => (
    <div dir="rtl">
      <Text {...args} />
    </div>
  ),
};
