import React from 'react';

import Badge from '../Badge';

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
      background: 'var(--gv-surface-panel-subtle)',
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
    notes: <Badge use="note">Beta</Badge>,
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

// The cards as the New participation method modal lays them out.
export const Grid: Story = {
  render: () => (
    <div
      style={{
        width: 680,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
      }}
    >
      {methods.map((method) => (
        <MethodCard
          key={method.title}
          title={method.title}
          description={method.description}
          art={<Art />}
          notes={method.hasNotes && <Badge use="note">Beta</Badge>}
        />
      ))}
    </div>
  ),
};
