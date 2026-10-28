import React from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import PageWrapper, { ButtonWrapper } from '.';

const Content = ({
  title,
  text,
  button,
}: {
  title: string;
  text: string;
  button: string;
}) => (
  <>
    <Title variant="h3" m="0px">
      {title}
    </Title>
    <Text>{text}</Text>
    <ButtonWrapper>
      <Button buttonStyle="admin-dark" width="auto">
        {button}
      </Button>
    </ButtonWrapper>
  </>
);

// The white admin page panel. The background shows its border and corners.
const meta = {
  title: 'Components/Layout/PageWrapper',
  tags: ['bo'],
  parameters: { gv: {} },
  component: PageWrapper,
  args: {
    children: (
      <Content
        title="Registration"
        text="Choose which fields people fill in when they sign up."
        button="Save"
      />
    ),
  },
  render: (args) => (
    <Box width="900px" p="24px" bg="#f4f4f6">
      <PageWrapper {...args} />
    </Box>
  ),
} satisfies Meta<typeof PageWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Square top corners, for a panel that sits under tabs.
export const FlatTopBorder: Story = {
  args: { flatTopBorder: true },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    children: (
      <Content
        title="التسجيل"
        text="اختر الحقول التي يملؤها الناس عند التسجيل."
        button="حفظ"
      />
    ),
  },
};
