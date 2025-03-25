import React from 'react';

import {
  Box,
  Title,
  Button,
  fontSizes,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Comment from './Comment';

const StyledBox = styled(Box)`
  font-size: ${fontSizes.base}px;
  height: 40px;

  &:focus {
    outline: 1px solid ${colors.primary};
    height: auto;
  }
`;

const DUMMY_DATA = [
  {
    name: 'Michael Bluth',
    createdAt: '2021-08-10T12:00:00Z',
    badgeText: 'Go Vocal',
    badgeType: 'go-vocal',
  },
  {
    name: 'Tobias Funke',
    createdAt: '2021-08-10T12:00:00Z',
    badgeText: 'Vienna',
    badgeType: 'platform-moderator',
  },
  {
    name: 'George Michael Bluth',
    createdAt: '2021-08-10T12:00:00Z',
  },
] as const;

const Comments = () => {
  return (
    <>
      <Title variant="h3">Comments</Title>
      <StyledBox
        as="textarea"
        rows={5}
        width="100%"
        maxWidth="500px"
        border={`1px solid ${colors.borderDark}`}
        borderRadius={stylingConsts.borderRadius}
        p="10px"
        placeholder="Write your comment here"
      />
      <Box w="100%" mt="8px" display="flex">
        <Button w="auto" bgColor={colors.primary}>
          Post your comment
        </Button>
      </Box>
      <Box mt="20px">
        {DUMMY_DATA.map((comment, i) => (
          <Comment {...comment} key={i} />
        ))}
      </Box>
    </>
  );
};

export default Comments;
