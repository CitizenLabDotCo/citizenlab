import type { Meta, StoryObj } from '@storybook/react';
// import { reactRouterParameters } from 'storybook-addon-react-router-v6';
// import { rest } from 'msw';

import Button from '.';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Example/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    bgColor: { control: 'color' },
  },
  args: {
    children: 'Button text',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {},
  // parameters: {
  //   reactRouter: reactRouterParameters({
  //     location: {
  //       path: '/books/my-great-book',
  //     },
  //     routing: { path: '/books/:param' },
  //   }),
  // msw: [
  //   rest.get('*', (_req, res, ctx) => {
  //     return res(ctx.status(404));
  //   })
  // ]
  // },
};

export const Secondary: Story = {
  args: {},
};

export const Large: Story = {
  args: {},
};

export const Small: Story = {
  args: {},
};
