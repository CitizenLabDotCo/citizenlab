import React from 'react';

import { Box, Input } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import {
  Section,
  SectionDescription,
  SectionField,
  SectionTitle,
  SubSectionTitle,
} from '.';

type Copy = {
  title: string;
  description: string;
  subTitle: string;
  label: string;
  value: string;
  fullWidth?: boolean;
};

const SectionExample = ({
  title,
  description,
  subTitle,
  label,
  value,
  fullWidth,
}: Copy) => (
  <Box width="900px" p="24px" bg="white">
    <Section>
      <SectionTitle>{title}</SectionTitle>
      <SectionDescription>{description}</SectionDescription>
      <SubSectionTitle>{subTitle}</SubSectionTitle>
      <SectionField className={fullWidth ? 'fullWidth' : undefined}>
        <Input type="text" label={label} value={value} onChange={() => {}} />
      </SectionField>
    </Section>
  </Box>
);

const meta = {
  title: 'Components/Layout/Section',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Section,
  render: (args) => <SectionExample {...(args as unknown as Copy)} />,
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

const copy: Copy = {
  title: 'Project settings',
  description:
    'Set the basics of your project. You can change these at any time.',
  subTitle: 'General',
  label: 'Project title',
  value: 'Green streets',
};

export const Default: Story = {
  args: copy as never,
};

export const FullWidthField: Story = {
  args: { ...copy, fullWidth: true } as never,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    title: 'إعدادات المشروع',
    description: 'حدد أساسيات مشروعك. يمكنك تغييرها في أي وقت.',
    subTitle: 'عام',
    label: 'عنوان المشروع',
    value: 'شوارع خضراء',
  } as never,
};
