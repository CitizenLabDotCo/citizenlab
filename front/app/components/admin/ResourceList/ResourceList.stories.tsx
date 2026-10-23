import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import { HeadRow, List, Row, TextCell } from '.';

type Item = { title: string; meta: string };

type ExampleProps = {
  head: [string, string];
  items: Item[];
  action: string;
  disableNestedStyles?: boolean;
};

const ListExample = ({
  head,
  items,
  action,
  disableNestedStyles,
}: ExampleProps) => (
  <Box width="720px" p="16px" bg="white">
    <List>
      <HeadRow>
        <div className="expand">{head[0]}</div>
        <div>{head[1]}</div>
      </HeadRow>
      {items.map((item, i) => (
        <Row
          key={item.title}
          isLastItem={i === items.length - 1}
          disableNestedStyles={disableNestedStyles}
        >
          <TextCell className="expand">
            <h2>{item.title}</h2>
            <p>{item.meta}</p>
          </TextCell>
          <Button buttonStyle="secondary-outlined" icon="edit">
            {action}
          </Button>
        </Row>
      ))}
    </List>
  </Box>
);

const meta = {
  title: 'Components/Data display/ResourceList',
  tags: ['shared'],
  parameters: { gv: {} },
  component: List,
  render: (args) => <ListExample {...(args as unknown as ExampleProps)} />,
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: Item[] = [
  { title: 'Green streets', meta: '24 inputs' },
  { title: 'Budget 2027', meta: '118 inputs' },
  { title: 'New library', meta: '7 inputs' },
];

export const Default: Story = {
  args: { head: ['Project', 'Actions'], items, action: 'Edit' } as never,
};

// Rows without the list's nested heading, text and spacing styles.
export const PlainRows: Story = {
  args: {
    head: ['Project', 'Actions'],
    items,
    action: 'Edit',
    disableNestedStyles: true,
  } as never,
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    head: ['المشروع', 'الإجراءات'],
    items: [
      { title: 'شوارع خضراء', meta: '24 مدخلا' },
      { title: 'ميزانية 2027', meta: '118 مدخلا' },
      { title: 'مكتبة جديدة', meta: '7 مدخلات' },
    ],
    action: 'تعديل',
  } as never,
};
