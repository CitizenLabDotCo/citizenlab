import React, { useState } from 'react';

import PaginationItem from './PaginationItem';

import Pagination from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 8, onChange: () => {} },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination page={page} pageCount={8} onChange={setPage} />;
  },
};

const row = { display: 'flex', gap: 16, alignItems: 'center' };

export const Items: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={row}>
        <PaginationItem number={2} />
        <PaginationItem number={2} isSelected />
        <PaginationItem kind="ellipsis" />
      </div>
      <div style={row}>
        <PaginationItem kind="previous" />
        <PaginationItem kind="previous" isDisabled />
        <PaginationItem kind="next" />
        <PaginationItem kind="next" isDisabled />
      </div>
    </div>
  ),
};
