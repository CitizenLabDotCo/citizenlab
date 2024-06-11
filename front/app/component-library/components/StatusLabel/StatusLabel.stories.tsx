import { Meta, StoryObj } from '@storybook/react';
import { colors } from 'component-library/utils/styleUtils';

import StatusLabel from './';

const meta = {
  title: 'Components/StatusLabel',
  component: StatusLabel,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof StatusLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'In consideration',
    backgroundColor: colors.blue700,
  },
};

export const WithIconProp: Story = {
  args: {
    ...Default.args,
    icon: 'lock',
  },
};
