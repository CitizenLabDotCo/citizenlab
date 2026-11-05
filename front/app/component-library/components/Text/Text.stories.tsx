import { Meta, StoryObj } from '@storybook/react';

import Text from './';

const meta = {
  title: 'Components/Text',
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
