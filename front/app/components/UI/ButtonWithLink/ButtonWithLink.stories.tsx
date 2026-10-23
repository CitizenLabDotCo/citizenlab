import { Meta, StoryObj } from '@storybook/react';

import ButtonWithLink from '.';

const meta = {
  title: 'Components/Actions/ButtonWithLink',
  tags: ['shared'],
  parameters: { gv: {} },
  component: ButtonWithLink,
} satisfies Meta<typeof ButtonWithLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// With `to` or `linkTo` the button renders as a link, so the states target
// the `a` element.
export const Default: Story = {
  args: {
    linkTo: '/projects',
    text: 'View all projects',
    buttonStyle: 'primary',
    width: 'auto',
  },
};

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['a'] } },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focus: ['a'], focusVisible: ['a'] } },
};

// Disabled drops the link and renders a disabled button.
export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

export const Secondary: Story = {
  args: { ...Default.args, buttonStyle: 'secondary-outlined' },
};

export const WithIcon: Story = {
  args: { ...Default.args, icon: 'arrow-right', iconPos: 'right' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    ...Default.args,
    text: 'عرض كل المشاريع',
  },
};
