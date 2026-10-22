import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { useTheme } from 'styled-components';

import { bo, semanticColors, themeColors } from '../utils/styleUtils';

import { Code, Page, Section } from './_shared';

const Swatch = ({ name, value }: { name: string; value: string }) => (
  <div style={{ width: 132 }}>
    <div
      style={{
        height: 56,
        borderRadius: 8,
        background: value,
        border: '1px solid rgba(0,0,0,0.08)',
      }}
    />
    <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{name}</div>
    <div style={{ fontSize: 11, color: '#596B7A' }}>{value}</div>
  </div>
);

const Swatches = ({ colors }: { colors: Record<string, string> }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
    {Object.entries(colors).map(([name, value]) => (
      <Swatch key={name} name={name} value={value} />
    ))}
  </div>
);

const TenantSwatches = () => {
  const theme = useTheme() as { colors: Record<string, string> };
  const keys = [
    'tenantPrimary',
    'tenantSecondary',
    'tenantText',
    'tenantPrimaryLighten75',
    'tenantPrimaryLighten90',
    'tenantPrimaryLighten95',
  ];
  return (
    <Swatches
      colors={Object.fromEntries(keys.map((k) => [k, theme.colors[k]]))}
    />
  );
};

const ColoursPage = () => (
  <Page
    title="Colours"
    intro={
      <>
        Live from <Code>component-library/utils/styleUtils.ts</Code>. Change a
        value there and this page changes with it.
      </>
    }
  >
    <Section
      title="City colours (tenant)"
      note="The only brand colours. Each city sets these; switch City in the toolbar to see them change. Never hardcode a brand colour."
    >
      <TenantSwatches />
    </Section>
    <Section
      title="Back office"
      note={
        <>
          The 2026 back office block (<Code>bo.colors</Code>). Never
          city-themed.
        </>
      }
    >
      <Swatches colors={bo.colors} />
    </Section>
    <Section
      title="Semantic"
      note="Colours by role. Prefer these over the raw palette."
    >
      <Swatches colors={semanticColors} />
    </Section>
    <Section title="Palette" note="Raw scales the roles point to.">
      <Swatches colors={themeColors} />
    </Section>
  </Page>
);

const meta = {
  title: 'Foundations/Colours',
  component: ColoursPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ColoursPage>;

export default meta;

export const Colours: StoryObj<typeof meta> = {};
