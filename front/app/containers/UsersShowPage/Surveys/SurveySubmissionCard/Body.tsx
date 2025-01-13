import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';

import useAuthUser from 'api/me/useAuthUser';

import {
  BodyWrapper,
  StyledAvatar,
  BodyDiv,
  StyledUserName,
  Separator,
  // TimeAgo
} from 'components/IdeaCard/Body/components';

const Body = () => {
  const { data: user } = useAuthUser();

  if (!user) return null;

  const authorId = user.data.id;

  return (
    <BodyWrapper>
      <StyledAvatar
        size={36}
        userId={authorId}
        fillColor={transparentize(0.6, colors.textSecondary)}
      />
      <BodyDiv>
        <StyledUserName userId={authorId || null} />
        <Separator aria-hidden>&bull;</Separator>
        {/* {publishedAt && (
          <TimeAgo>{timeAgo(Date.parse(publishedAt), locale)}</TimeAgo>
        )} */}
      </BodyDiv>
    </BodyWrapper>
  );
};

export default Body;
