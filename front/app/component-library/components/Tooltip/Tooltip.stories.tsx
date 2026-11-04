import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
// eslint-plugin-storybook 0.8 knows expect from @storybook/test, not from
// storybook/test (Storybook 10), so it flags every expect here.
/* eslint-disable storybook/use-storybook-expect */

import Tooltip from './';

const meta = {
  title: 'Components/Overlays/Tooltip',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <p>Hover over me</p>,
  },
};

export const Open: Story = {
  args: {
    ...Default.args,
    visible: true,
    appendTo: 'parent',
    placement: 'bottom',
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '120px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

export const LongContent: Story = {
  args: {
    ...Open.args,
    content:
      "Participants can submit ideas, comment on each other's ideas and vote on the ones they want to see next, for as long as the phase stays open to the whole community.",
  },
  decorators: Open.decorators,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    ...Open.args,
    content: 'هذا نص توضيحي',
    children: <p>مرر المؤشر فوقي</p>,
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '120px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

// The tooltip box while it is shown (Tippy keeps it in the DOM while it
// fades out, with data-state hidden).
const shownTooltip = (el: HTMLElement) =>
  el.ownerDocument.querySelector('.tippy-box[data-state="visible"]');

// Focus on the trigger opens the tooltip; Escape closes it.
export const Keyboard: Story = {
  args: {
    content: 'Saved drafts stay for 30 days',
    children: <button type="button">About drafts</button>,
    placement: 'bottom',
  },
  decorators: Open.decorators,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'About drafts',
    });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() =>
      expect(body.getByText('Saved drafts stay for 30 days')).toBeVisible()
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(shownTooltip(canvasElement)).toBeNull());
  },
};
