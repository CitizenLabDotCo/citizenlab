import React from 'react';

import { Input } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import { FormLabel, FormSection, FormSectionTitle } from '.';

// A form section with its title and a labelled field. The states are the
// label's options.
type ExampleProps = {
  title: string;
  subtitle: string;
  label: string;
  value: string;
  optional?: boolean;
  subtext?: string;
  icon?: boolean;
  questionNumber?: number;
};

const FormExample = ({
  title,
  subtitle,
  label,
  value,
  optional,
  subtext,
  icon,
  questionNumber,
}: ExampleProps) => (
  <FormSection>
    <FormSectionTitle
      message={{ id: 'storybook.formSection.title', defaultMessage: title }}
      subtitleMessage={{
        id: 'storybook.formSection.subtitle',
        defaultMessage: subtitle,
      }}
    />
    <FormLabel
      htmlFor="story-field"
      labelValue={label}
      optional={optional}
      subtextValue={subtext}
      iconName={icon ? 'info-outline' : undefined}
      questionNumber={questionNumber}
    />
    <Input id="story-field" type="text" value={value} onChange={() => {}} />
  </FormSection>
);

const meta = {
  title: 'Components/Forms/FormComponents',
  tags: ['shared'],
  parameters: { gv: {} },
  component: FormSection,
  render: (args) => <FormExample {...(args as unknown as ExampleProps)} />,
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const copy: ExampleProps = {
  title: 'Your profile',
  subtitle: 'This is how other participants see you.',
  label: 'Display name',
  value: 'Sam Peeters',
};

export const Default: Story = {
  args: copy as never,
};

export const Optional: Story = {
  args: { ...copy, optional: true } as never,
};

export const WithSubtext: Story = {
  args: {
    ...copy,
    subtext: 'Use your first name, or a name people know you by.',
  } as never,
};

export const WithIcon: Story = {
  args: { ...copy, icon: true } as never,
};

export const QuestionNumber: Story = {
  args: { ...copy, questionNumber: 3 } as never,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    title: 'ملفك الشخصي',
    subtitle: 'هكذا يراك المشاركون الآخرون.',
    label: 'الاسم المعروض',
    value: 'سامي',
    optional: true,
  } as never,
};
