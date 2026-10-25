import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import {
  backofficeRedesignHandlers,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  projectWith,
  topicsHandler,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignSetupPanel';

import TopicTagsCard from './TopicTagsCard';

// The topic tags card in the setup panel: the platform's tags as chips to
// switch on for the project. Each click saves. It sits folded in the panel;
// the stories open it.

const expand = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const toggle = await within(canvasElement).findByRole('button', {
    expanded: false,
  });
  await userEvent.click(toggle);
};

const meta = {
  title: 'Components/Redesigned/Setup panel/Topic tags card',
  tags: ['bo', 'redesigned'],
  component: TopicTagsCard,
  parameters: { msw: [topicsHandler, ...backofficeRedesignHandlers] },
  args: {
    project: projectWith(
      {},
      {
        global_topics: {
          data: [
            { id: 'bo-topic-1', type: 'global_topic' },
            { id: 'bo-topic-3', type: 'global_topic' },
          ],
        },
      }
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 292, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async (context) => {
    await expand(context);
    await waitForText(context.canvasElement, 'Mobility');
  },
} satisfies Meta<typeof TopicTagsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two of six tags on. */
export const Default: Story = {};

/** No tags picked yet. */
export const Empty: Story = {
  args: { project: projectWith({}, { global_topics: { data: [] } }) },
};

/** Folded, as it first shows in the panel. */
export const Collapsed: Story = {
  play: async () => {},
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: expand,
};
