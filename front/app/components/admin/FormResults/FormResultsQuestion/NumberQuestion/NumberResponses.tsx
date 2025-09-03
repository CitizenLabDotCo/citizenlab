import React from 'react';

import { Box, colors, Divider, Text } from '@citizenlab/cl2-component-library';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

const Item = styled.div<{ start: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(${(props) => props.start}px);
`;

type NumberResponsesProps = {
  numberResponses: {
    answer: number;
  }[];
};

const NumberResponses = ({ numberResponses }: NumberResponsesProps) => {
  const { formatMessage } = useIntl();
  const parentRef = React.useRef(null);

  // The virtualizer
  const { measureElement, getTotalSize, getVirtualItems } = useVirtualizer({
    count: numberResponses.length,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    getScrollElement: () => parentRef?.current,
    estimateSize: () => 100,
  });

  return (
    <Box bg={colors.background} height="460px" width="100%" maxWidth="524px">
      <Box borderBottom={`1px solid ${colors.divider}`} p="24px" height="60px">
        <Text fontWeight="bold" m="0px">
          {formatMessage(messages.allResponses)} {'('}
          {numberResponses.length}
          {')'}
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
                {numberResponses[virtualItem.index].answer}
              </Text>
              <Divider />
            </Item>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default NumberResponses;
