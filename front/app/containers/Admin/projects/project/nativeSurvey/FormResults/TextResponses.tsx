import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { useVirtualizer } from '@tanstack/react-virtual';
import Divider from 'components/admin/Divider';
import React from 'react';
import styled from 'styled-components';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

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
};

const TextResponses = ({ textResponses }: TextResponsesProps) => {
  const parentRef = React.useRef(null);
  const { formatMessage } = useIntl();

  // The virtualizer
  const { measureElement, getTotalSize, getVirtualItems } = useVirtualizer({
    count: textResponses.length,
    getScrollElement: () => parentRef?.current,
    estimateSize: () => 100,
  });

  return (
    <Box bg={colors.background}>
      <Box borderBottom={`1px solid ${colors.divider}`} p="24px">
        <Text fontWeight="bold" m="0px">
          {formatMessage(messages.allResponses)} ({textResponses.length})
        </Text>
      </Box>

      <Box ref={parentRef} height="450px" overflow="auto" pt="12px">
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
