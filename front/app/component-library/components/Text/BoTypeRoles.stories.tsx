import React from 'react';

import Box from '../Box';
import { bo, colors } from '../../utils/styleUtils';

import Text from '.';

import type { Meta, StoryObj } from '@storybook/react';

// The type roles and theme values of the redesigned back office: the five
// bo Text variants with what each is for, and the `bo` object of
// styleUtils (control and panel radius, header and control sizes, colours)
// as labelled swatches.

const ROLES = [
  {
    variant: 'boSection',
    spec: '14px / 500, #1E1E1E',
    use: 'Card and section headings',
    sample: 'Topic tags',
  },
  {
    variant: 'boLabel',
    spec: '14px / 400, #474747',
    use: 'Row labels, option titles',
    sample: 'Who can find this project',
  },
  {
    variant: 'boControl',
    spec: '13px / 400, #1E1E1E',
    use: 'Text inside controls',
    sample: 'Parks and green spaces',
  },
  {
    variant: 'boHelper',
    spec: '14px / 400, coolGrey600',
    use: 'Helper and description text',
    sample: 'Residents see this on the project page.',
  },
  {
    variant: 'boMicro',
    spec: '12px / 400, coolGrey600',
    use: 'Small labels, section captions',
    sample: 'VISIBILITY',
  },
] as const;

const Caption = ({ children }: { children: React.ReactNode }) => (
  <Text variant="boMicro" m="0px">
    {children}
  </Text>
);

const TypeRoles = () => (
  <Box display="flex" flexDirection="column">
    {ROLES.map(({ variant, spec, use, sample }) => (
      <div
        key={variant}
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 220px',
          alignItems: 'baseline',
          gap: 'var(--gv-space-4)',
          padding: 'var(--gv-space-3) 0',
          borderTop: `1px solid ${colors.grey200}`,
        }}
      >
        <Text variant="boControl" fontWeight="semi-bold" m="0px">
          {variant}
        </Text>
        <Text variant={variant} m="0px">
          {sample}
        </Text>
        <Box>
          <Caption>{spec}</Caption>
          <Caption>{use}</Caption>
        </Box>
      </div>
    ))}
  </Box>
);

const Swatch = ({ name, value }: { name: string; value: string }) => (
  <Box display="flex" alignItems="center" gap="10px" w="230px">
    <Box
      w="36px"
      h="36px"
      borderRadius={bo.borderRadius}
      background={value}
      border={`1px solid ${colors.grey300}`}
      flex="0 0 auto"
    />
    <Box minWidth="0">
      <Text variant="boControl" m="0px">
        bo.colors.{name}
      </Text>
      <Caption>{value}</Caption>
    </Box>
  </Box>
);

const Radius = ({ name, value }: { name: string; value: string }) => (
  <Box display="flex" flexDirection="column" alignItems="flex-start" gap="8px">
    <Box
      w="96px"
      h="64px"
      borderRadius={value}
      background={colors.white}
      border={`1px solid ${colors.coolGrey500}`}
    />
    <Text variant="boControl" m="0px">
      {name}
    </Text>
    <Caption>{value}</Caption>
  </Box>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box mb="32px">
    <Text variant="boSection" m="0px" mb="12px">
      {title}
    </Text>
    {children}
  </Box>
);

const ThemeValues = () => (
  <>
    <Section title="Radius">
      <Box display="flex" gap="32px" flexWrap="wrap">
        <Radius name="bo.borderRadius (controls)" value={bo.borderRadius} />
        <Radius
          name="bo.panelBorderRadius (panels)"
          value={bo.panelBorderRadius}
        />
      </Box>
    </Section>
    <Section title="Sizes">
      <Box display="flex" gap="32px" flexWrap="wrap">
        {[
          ['bo.headerFontSize', bo.headerFontSize],
          ['bo.controlFontSize', `${bo.controlFontSize}px`],
          ['bo.buttonMedium.height', bo.buttonMedium.height],
          ['bo.buttonMedium.padding', bo.buttonMedium.padding],
          ['bo.buttonMedium.iconSize', bo.buttonMedium.iconSize],
        ].map(([name, value]) => (
          <Box key={name}>
            <Text variant="boControl" m="0px">
              {name}
            </Text>
            <Caption>{value}</Caption>
          </Box>
        ))}
      </Box>
    </Section>
    <Section title="Colours">
      <Box display="flex" gap="16px 24px" flexWrap="wrap">
        {Object.entries(bo.colors).map(([name, value]) => (
          <Swatch key={name} name={name} value={value} />
        ))}
      </Box>
    </Section>
  </>
);

const meta = {
  title: 'Components/Redesigned/Library variants/Back-office type roles',
  tags: ['bo', 'redesigned'],
  component: Text,
  args: { variant: 'boSection', children: 'Topic tags' },
  decorators: [
    (Story) => (
      <Box maxWidth="760px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The five type roles, then the bo theme values. */
export const Default: Story = {
  render: () => (
    <>
      <Section title="Type roles">
        <TypeRoles />
      </Section>
      <ThemeValues />
    </>
  ),
};

/** Only the type roles. */
export const TypeRolesOnly: Story = {
  render: () => <TypeRoles />,
};

/** Only the bo theme values: radius, sizes and colours. */
export const ThemeValuesOnly: Story = {
  render: () => <ThemeValues />,
};

/** One role, to try in the controls. */
export const Single: Story = {};

export const RTL: Story = {
  globals: { lang: 'ar' },
  render: () => <TypeRoles />,
};
