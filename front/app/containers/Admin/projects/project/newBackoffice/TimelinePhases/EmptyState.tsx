import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import methodMessages from 'containers/Admin/inspirationHub/messages';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { ExampleRow } from '../phaseRowUtils';

const EXAMPLE_PHASES: {
  title: MessageDescriptor;
  method: MessageDescriptor;
}[] = [
  { title: messages.examplePhaseCollectIdeas, method: methodMessages.ideation },
  {
    title: messages.examplePhaseVoteOnShortlist,
    method: methodMessages.voting,
  },
  {
    title: messages.examplePhaseShareWhatWeHeard,
    method: methodMessages.information,
  },
];

const EmptyState = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Text m="0 0 4px 0" px="10px" fontSize="s" color="textSecondary">
        {formatMessage(messages.timelineEmptyDescription)}
      </Text>
      <Box display="flex" flexDirection="column">
        {EXAMPLE_PHASES.map(({ title, method }, index) => (
          <ExampleRow
            key={title.id}
            withConnector
            isFirst={index === 0}
            isLast={index === EXAMPLE_PHASES.length - 1}
          >
            {formatMessage(title)} · {formatMessage(method)}
          </ExampleRow>
        ))}
      </Box>
    </>
  );
};

export default EmptyState;
