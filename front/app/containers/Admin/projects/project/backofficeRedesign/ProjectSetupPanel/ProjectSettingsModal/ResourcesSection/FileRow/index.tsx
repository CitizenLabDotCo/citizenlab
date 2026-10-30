import React, { ReactNode } from 'react';

import { Box, Icon, Text, bo, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { getFileIcon } from '../utils';

const ACTIONS_CLASS = 'file-row-actions';

const Row = styled(Box)`
  & + & {
    border-top: 1px solid ${colors.grey100};
  }

  &:hover,
  &:focus-within,
  &:has([aria-expanded='true']) {
    background: ${colors.grey50};
  }

  .${ACTIONS_CLASS} {
    opacity: 0;
  }

  &:hover
    .${ACTIONS_CLASS},
    &:focus-within
    .${ACTIONS_CLASS},
    &:has([aria-expanded='true'])
    .${ACTIONS_CLASS} {
    opacity: 1;
  }
`;

interface Props {
  name: string;
  mimeType: string;
  meta?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
}

const FileRow = ({ name, mimeType, meta, status, actions }: Props) => (
  <Row
    display="flex"
    alignItems="center"
    gap="12px"
    minHeight="48px"
    p="0 4px 0 8px"
    borderRadius={bo.borderRadius}
  >
    <Icon
      name={getFileIcon(mimeType)}
      width="16px"
      height="16px"
      fill={colors.coolGrey500}
    />
    <Box flex="1" minWidth="0">
      <Text
        variant="boControl"
        fontSize="xs"
        m="0px"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {name}
      </Text>
      {meta}
    </Box>
    {status}
    <Box flexShrink={0} w="28px" className={ACTIONS_CLASS}>
      {actions}
    </Box>
  </Row>
);

export default FileRow;
