import React from 'react';

import { Box, colors, Divider, Text } from '@citizenlab/cl2-component-library';
import { useVirtualizer } from '@tanstack/react-virtual';
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

type FilesProps = {
  files: {
    name: string;
    url: string;
  }[];
};

const Files = ({ files }: FilesProps) => {
  const parentRef = React.useRef(null);
  const { formatMessage } = useIntl();

  // The virtualizer
  const { measureElement, getTotalSize, getVirtualItems } = useVirtualizer({
    count: files.length,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    getScrollElement: () => parentRef?.current,
    estimateSize: () => 100,
  });

  return (
    <Box bg={colors.background}>
      <Box borderBottom={`1px solid ${colors.divider}`} p="24px">
        <Text fontWeight="bold" m="0px">
          {formatMessage(messages.allFiles)} ({files.length})
        </Text>
      </Box>

      <Box ref={parentRef} height="400px" overflow="auto" pt="12px">
        <Box height={`${getTotalSize()}px`} width="100%" position="relative">
          {getVirtualItems().map((virtualItem) => (
            <Item
              ref={measureElement}
              data-index={virtualItem.index}
              key={virtualItem.key}
              start={virtualItem.start}
            >
              <Text m="0px" px="24px">
                <a
                  href={files[virtualItem.index].url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {files[virtualItem.index].name}
                </a>
              </Text>
              <Divider />
            </Item>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Files;
