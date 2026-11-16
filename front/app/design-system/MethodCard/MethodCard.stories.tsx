import React from 'react';

import Badge from '../Badge';
import VerticalTabs, {
  TabPanel,
  VerticalTab,
  VerticalTabList,
} from '../VerticalTabs';

import MethodCard from '.';

import type { Meta, StoryObj } from '@storybook/react';

// Stand-in for the resident preview (Figma's _Slot).
const Art = () => (
  <div
    style={{
      width: 288,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      borderRadius: 8,
      border: '1px solid var(--gv-border-control)',
      background: 'var(--gv-surface-secondary)',
      color: 'var(--gv-text-tertiary)',
      font: '12px/16px var(--gv-font-family)',
    }}
  >
    Content: swap this slot
  </div>
);

const surveyDescription =
  'Understand your users’ needs and thinking via a wide range of private question types, including a geospatial set optimized for planners.';

const meta = {
  title: 'Design system/Data display/Method card',
  component: MethodCard,
  args: {
    title: 'Survey',
    description: surveyDescription,
    art: <Art />,
    notes: (
      <Badge use="note" tone="selected">
        Responses stay private
      </Badge>
    ),
  },
} satisfies Meta<typeof MethodCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <MethodCard
        title={args.title}
        description={args.description}
        art={args.art}
        notes={args.notes}
      />
    </div>
  ),
};

const methods = [
  {
    title: 'Ideation',
    description:
      'Tap into your users’ collective intelligence. Invite them to share, discuss and react to ideas.',
  },
  { title: 'Survey', description: surveyDescription, hasNotes: true },
  { title: 'Proposals and petitions', description: surveyDescription },
  { title: 'Document annotation', description: surveyDescription },
];

const groups = ['Gather input', 'Shape decisions', 'Inform and recruit'];

// The New participation method modal body.
export const MethodPicker: Story = {
  render: () => (
    <div
      style={{
        width: 920,
        height: 582,
        display: 'flex',
        border: '1px solid var(--gv-border-divider)',
      }}
    >
      <VerticalTabs defaultSelectedKey="Gather input">
        <div
          style={{
            width: 203,
            height: 582,
            flexShrink: 0,
            boxSizing: 'border-box',
            padding: '8px 20px 18px 8px',
            background: 'var(--gv-surface-secondary)',
            borderRight: '1px solid var(--gv-border-divider)',
          }}
        >
          <VerticalTabList aria-label="Method groups">
            {groups.map((group) => (
              <VerticalTab key={group} id={group}>
                {group}
              </VerticalTab>
            ))}
          </VerticalTabList>
        </div>
        {groups.map((group) => (
          <TabPanel key={group} id={group}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                padding: '24px 28px 0',
                overflow: 'auto',
                height: 582,
                boxSizing: 'border-box',
              }}
            >
              {methods.map((method) => (
                <MethodCard
                  key={method.title}
                  title={method.title}
                  description={method.description}
                  art={<Art />}
                  notes={
                    method.hasNotes && (
                      <Badge use="note" tone="selected">
                        Responses stay private
                      </Badge>
                    )
                  }
                />
              ))}
            </div>
          </TabPanel>
        ))}
      </VerticalTabs>
    </div>
  ),
};
