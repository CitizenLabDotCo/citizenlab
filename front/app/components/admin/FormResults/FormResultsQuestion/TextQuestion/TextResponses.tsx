import React from 'react';

import { Box, colors, Divider, Text } from '@citizenlab/cl2-component-library';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import { getTextResponseTitle } from './utils';

const Item = styled.div<{ start: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(${(props) => props.start}px);
`;

type TextResponsesProps = {
  textResponses: {
    answer: string;
  }[];
  hasOtherResponses?: boolean;
  hasFollowUpResponses?: boolean;
};

const TextResponses = ({
  textResponses,
  hasOtherResponses,
  hasFollowUpResponses,
}: TextResponsesProps) => {
  const parentRef = React.useRef(null);
  const { formatMessage } = useIntl();

  // The virtualizer
  const { measureElement, getTotalSize, getVirtualItems } = useVirtualizer({
    count: textResponses.length,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    getScrollElement: () => parentRef?.current,
    estimateSize: () => 100,
  });

  return (
    <Box bg={colors.grey100} height="460px">
      <Box borderBottom={`1px solid ${colors.divider}`} p="24px" height="60px">
        <Text fontWeight="bold" m="0px">
          {formatMessage(
            getTextResponseTitle({ hasOtherResponses, hasFollowUpResponses })
          )}{' '}
          ({textResponses.length})
        </Text>
      </Box>

      <Box ref={parentRef} overflow="auto" pt="12px" height="400px">
        <Box height={`${getTotalSize()}px`} width="100%" position="relative">
          {getVirtualItems().map((virtualItem) => (
            <Item
              ref={measureElement}
              data-index={virtualItem.index}
              key={virtualItem.key}
              start={virtualItem.start}
            >
              <Text m="0px" px="24px">
                {textResponses[virtualItem.index].answer}
              </Text>
              <Divider />
            </Item>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TextResponses;
