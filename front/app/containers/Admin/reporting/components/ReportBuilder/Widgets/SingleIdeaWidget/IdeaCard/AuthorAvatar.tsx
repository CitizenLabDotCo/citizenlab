import React from 'react';

import {
  colors,
  isRtl,
  fontSizes,
  Box,
} from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';
import styled from 'styled-components';

import { IIdeaData } from 'api/ideas/types';

import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

const StyledAvatar = styled(Avatar)`
  margin-right: 6px;
  margin-left: -4px;
  margin-top: -2px;
  ${isRtl`
    margin-left: 6px;
    margin-right: -4px;
  `}
`;
const StyledUserName = styled(UserName)`
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  color: ${colors.textSecondary};
  font-weight: 500;
`;

// Inspired by front/app/components/IdeaCard/Body/index.tsx
const AuthorAvatar = ({ idea }: { idea: IIdeaData }) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const authorId = idea.relationships?.author?.data?.id || null;
  const authorHash = idea.attributes.author_hash;

  return (
    <Box display="flex" alignItems="center">
      <StyledAvatar
        size={36}
        userId={authorId}
        fillColor={transparentize(0.6, colors.textSecondary)}
        authorHash={authorHash}
      />
      <Box>
        <StyledUserName
          userId={authorId || null}
          anonymous={idea.attributes.anonymous}
        />
      </Box>
    </Box>
  );
};

export default AuthorAvatar;
