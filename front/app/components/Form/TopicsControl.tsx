import { withJsonFormsControlProps } from '@jsonforms/react';
import { scopeEndsWith, RankedTester, rankWith } from '@jsonforms/core';
import React from 'react';

const TopicsControl = () => {
  return <div>topics</div>;
};

export default withJsonFormsControlProps(TopicsControl);

export const topicsControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('topics')
);
