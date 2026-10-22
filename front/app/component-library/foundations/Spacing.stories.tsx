import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { bo, defaultStyles, stylingConsts } from '../utils/styleUtils';

import { Code, Page, Section } from './_shared';

// The 4px grid: every spacing, size and radius is a multiple of 4.
const steps = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

const SpacingPage = () => (
  <Page
    title="Spacing, radius and shadow"
    intro="Rule: multiples of 4px everywhere."
  >
    <Section
      title="Spacing scale"
      note="Proposed steps on the 4px grid. The code has no spacing tokens yet: components pass raw values like padding=&quot;12px&quot;."
    >
      {steps.map((s) => (
        <div
          key={s}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 8,
          }}
        >
          <div style={{ width: 48, fontSize: 12, color: '#596B7A' }}>
            {s}px
          </div>
          <div
            style={{
              width: s,
              height: 16,
              background: '#044D6C',
              borderRadius: 2,
            }}
          />
        </div>
      ))}
    </Section>
    <Section title="Corner radius">
      <div style={{ display: 'flex', gap: 24 }}>
        {[
          ['stylingConsts.borderRadius', stylingConsts.borderRadius],
          ['bo.borderRadius', bo.borderRadius],
          ['bo.panelBorderRadius', bo.panelBorderRadius],
        ].map(([name, value]) => (
          <div key={name} style={{ fontSize: 12 }}>
            <div
              style={{
                width: 96,
                height: 64,
                border: '1px solid #84939E',
                borderRadius: value,
                marginBottom: 6,
              }}
            />
            <Code>{name}</Code>
            <div style={{ color: '#596B7A' }}>{value}</div>
          </div>
        ))}
      </div>
    </Section>
    <Section
      title="Shadow"
      note={
        <>
          <Code>defaultStyles.boxShadow</Code>
        </>
      }
    >
      <div
        style={{
          width: 160,
          height: 80,
          borderRadius: 8,
          background: '#fff',
          boxShadow: defaultStyles.boxShadow,
        }}
      />
    </Section>
  </Page>
);

const meta = {
  title: 'Foundations/Spacing, radius and shadow',
  component: SpacingPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SpacingPage>;

export default meta;

export const SpacingRadiusShadow: StoryObj<typeof meta> = {};
