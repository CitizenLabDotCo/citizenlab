import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { RootContents } from './useRootContents';

interface Props {
  contents: RootContents;
}

// "3 spaces · 1 folder · 2 projects", leaving out what there's none of.
const RootSummary = ({ contents }: Props) => {
  const { formatMessage } = useIntl();

  const counts = [
    { message: messages.spacesCount, count: contents.spaces?.data.length },
    {
      message: messages.foldersCount,
      count: contents.folders.data?.pages[0].meta.total,
    },
    {
      message: messages.projectsCount,
      count: contents.projects.data?.pages[0].meta.total,
    },
  ];

  const parts = counts.flatMap(({ message, count }) =>
    count ? [formatMessage(message, { count })] : []
  );

  if (parts.length === 0) return null;

  return (
    <Text variant="boMicro" m="0">
      {parts.join(' · ')}
    </Text>
  );
};

export default RootSummary;
