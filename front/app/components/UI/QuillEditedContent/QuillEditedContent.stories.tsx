import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import QuillEditedContent from '.';

// Styles the HTML that the rich text editor produces.
const html = `
<h2>About this project</h2>
<p>We want to make the <strong>city centre</strong> greener. Read the <a href="#plan">full plan</a> before you share your ideas.</p>
<ul><li>More trees on the main square</li><li>Safer bike lanes</li></ul>
<blockquote>Every idea is read by the project team.</blockquote>
`;

const htmlAr = `
<h2>حول هذا المشروع</h2>
<p>نريد أن نجعل <strong>وسط المدينة</strong> أكثر خضرة. اقرأ <a href="#plan">الخطة الكاملة</a> قبل مشاركة أفكارك.</p>
<ul><li>المزيد من الأشجار في الساحة الرئيسية</li><li>مسارات دراجات أكثر أمانا</li></ul>
`;

const meta = {
  title: 'Components/Typography/QuillEditedContent',
  tags: ['shared'],
  parameters: { gv: {} },
  component: QuillEditedContent,
  args: {
    children: <div dangerouslySetInnerHTML={{ __html: html }} />,
  },
  render: (args) => (
    <div style={{ width: '640px', padding: '8px' }}>
      <QuillEditedContent {...args} />
    </div>
  ),
} satisfies Meta<typeof QuillEditedContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { fontSize: 's' },
};

export const Large: Story = {
  args: { fontSize: 'l' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    children: <div dangerouslySetInnerHTML={{ __html: htmlAr }} />,
  },
};
