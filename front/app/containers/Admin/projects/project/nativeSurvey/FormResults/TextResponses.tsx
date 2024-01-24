import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { useVirtualizer } from '@tanstack/react-virtual';
import Divider from 'components/admin/Divider';
import React from 'react';
import styled from 'styled-components';

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

  // The virtualizer
  const { measureElement, getTotalSize, getVirtualItems } = useVirtualizer({
    count: textResponses.length,
    getScrollElement: () => parentRef?.current,
    estimateSize: () => 100,
  });

  return (
    <Box
      ref={parentRef}
      height="400px"
      overflow="auto"
      p="24px"
      bg={colors.background}
    >
      <Text fontWeight="bold" m="0px">
        All responses ({textResponses.length})
      </Text>
      <Box height={`${getTotalSize()}px`} width="100%" position="relative">
        {getVirtualItems().map((virtualItem) => (
          <Item
            ref={measureElement}
            data-index={virtualItem.index}
            key={virtualItem.key}
            start={virtualItem.start}
          >
            <Divider />
            <Text>{textResponses[virtualItem.index].answer}</Text>
          </Item>
        ))}
      </Box>
    </Box>
  );
};

export default TextResponses;
