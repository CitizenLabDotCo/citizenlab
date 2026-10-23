import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor } from 'storybook/test';

import NavigationTabs, { Tab } from '.';

type ExampleProps = {
  labels: string[];
  disabledTooltipText?: string;
  badge?: boolean;
};

// Tabs are links; the first one is the active tab. `position: relative`
// keeps the bar in the canvas instead of fixed to the page top.
const TabsExample = ({ labels, disabledTooltipText, badge }: ExampleProps) => (
  <Box width="900px" p="16px">
    <NavigationTabs position="relative">
      {labels.map((label, i) => (
        <Tab
          key={label}
          label={label}
          url={`/admin/projects/${i}`}
          active={i === 0}
          disabledTooltipText={i === 2 ? disabledTooltipText : undefined}
          badge={
            badge && i === 1 ? (
              <Box
                as="span"
                ml="6px"
                px="6px"
                borderRadius="10px"
                bg="#e52516"
                color="white"
              >
                3
              </Box>
            ) : undefined
          }
        />
      ))}
    </NavigationTabs>
  </Box>
);

const meta = {
  title: 'Components/Navigation/NavigationTabs',
  tags: ['shared'],
  parameters: { gv: {} },
  component: NavigationTabs,
  render: (args) => <TabsExample {...(args as unknown as ExampleProps)} />,
} satisfies Meta<typeof NavigationTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const labels = ['General', 'Phases', 'Permissions', 'Events'];

export const Default: Story = {
  args: { labels } as never,
};

// Each tab sits in a tooltip span. Hover on the second (inactive) tab.
export const Hover: Story = {
  args: { labels } as never,
  parameters: { pseudo: { hover: ['nav > span:nth-child(2) > div'] } },
};

export const Focus: Story = {
  args: { labels } as never,
  parameters: {
    pseudo: {
      focus: ['nav > span:nth-child(2) a'],
      focusVisible: ['nav > span:nth-child(2) a'],
    },
  },
};

// A tab with a tooltip text is disabled. It looks like the others, so the
// story hovers it to show the tooltip that explains why.
export const DisabledTab: Story = {
  args: {
    labels,
    disabledTooltipText: 'Add a phase first',
  } as never,
  play: async ({ canvasElement }) => {
    const tab = canvasElement.querySelector('nav > span:nth-child(3) > div');
    await userEvent.hover(tab as Element);
    await waitFor(() => {
      if (!document.querySelector('[data-tippy-root]')) {
        throw new Error('tooltip not shown');
      }
    });
  },
};

export const WithBadge: Story = {
  args: { labels, badge: true } as never,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { labels: ['عام', 'المراحل', 'الأذونات', 'الفعاليات'] } as never,
};
