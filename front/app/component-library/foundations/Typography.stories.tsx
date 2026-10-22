import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { bo, fontSizes } from '../utils/styleUtils';

import { Code, Page, Section } from './_shared';

const SAMPLE = 'Get citizens closer to where decisions are made';

// Proposal only: the type scale on Tali's Augur design system page
// (22 Oct 2026). Not used by the code yet; to be decided by Tali.
const proposal = [
  { role: 'Display', size: 36, lineHeight: 44, weight: 300 },
  { role: 'Title', size: 24, lineHeight: 32, weight: 400 },
  { role: 'Heading', size: 20, lineHeight: 28, weight: 400 },
  { role: 'Subheading', size: 18, lineHeight: 24, weight: 400 },
  { role: 'Body', size: 16, lineHeight: 24, weight: 400 },
  { role: 'Body strong', size: 16, lineHeight: 24, weight: 500 },
  { role: 'Body small', size: 14, lineHeight: 20, weight: 400 },
  { role: 'Label', size: 14, lineHeight: 20, weight: 400 },
  { role: 'Caption', size: 12, lineHeight: 16, weight: 400 },
];

const Row = ({
  name,
  meta,
  style,
}: {
  name: string;
  meta: string;
  style: React.CSSProperties;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '140px 160px 1fr',
      alignItems: 'baseline',
      gap: 16,
      padding: '12px 0',
      borderTop: '1px solid #EBEDEF',
    }}
  >
    <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
    <div style={{ fontSize: 12, color: '#596B7A' }}>{meta}</div>
    <div style={style}>{SAMPLE}</div>
  </div>
);

const TypographyPage = () => (
  <Page
    title="Type scale"
    intro={
      <>
        Font: Public Sans (cities can set their own). Two lists: what the code
        has today, and a proposal to decide on.
      </>
    }
  >
    <Section
      title="Proposal: roles with size, line height and weight"
      note="From Tali's Augur design system page. Every size and line height is on the 4px grid. Not in the code yet."
    >
      {proposal.map((t) => (
        <Row
          key={t.role}
          name={t.role}
          meta={`${t.size}/${t.lineHeight} · ${t.weight}`}
          style={{
            fontSize: t.size,
            lineHeight: `${t.lineHeight}px`,
            fontWeight: t.weight,
          }}
        />
      ))}
    </Section>
    <Section
      title="Today: fontSizes"
      note={
        <>
          <Code>fontSizes</Code> in styleUtils.ts: sizes only, no roles, line
          heights or weights. 21, 25 and 34 are off the 4px grid; base and m
          are both 16.
        </>
      }
    >
      {Object.entries(fontSizes).map(([name, size]) => (
        <Row
          key={name}
          name={name}
          meta={`${size}px${size % 4 ? ' · off grid' : ''}`}
          style={{ fontSize: size }}
        />
      ))}
    </Section>
    <Section
      title="Today: back office"
      note={
        <>
          <Code>bo.headerFontSize</Code> and <Code>bo.controlFontSize</Code>,
          used by the 2026 back office controls.
        </>
      }
    >
      <Row
        name="headerFontSize"
        meta={bo.headerFontSize}
        style={{ fontSize: bo.headerFontSize }}
      />
      <Row
        name="controlFontSize"
        meta={`${bo.controlFontSize}px`}
        style={{ fontSize: bo.controlFontSize }}
      />
    </Section>
  </Page>
);

const meta = {
  title: 'Foundations/Type scale',
  component: TypographyPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TypographyPage>;

export default meta;

export const TypeScale: StoryObj<typeof meta> = {};
