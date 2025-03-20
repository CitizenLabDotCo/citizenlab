import Quote from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Quote',
  component: Quote,
} satisfies Meta<typeof Quote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    maxWidth: '500px',
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tempus dolor eget nisi volutpat luctus. Donec sed semper nisl. Praesent leo nisi, egestas vitae maximus quis, facilisis vel massa. Maecenas maximus viverra ex vitae lobortis. Vestibulum mattis risus pharetra suscipit porttitor. Sed ornare feugiat luctus. Quisque pulvinar efficitur ultrices',
  },
};
