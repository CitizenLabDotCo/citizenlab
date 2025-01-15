import React from 'react';

import { colors, Box } from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';

import useAuthUser from 'api/me/useAuthUser';
import { IdeaMiniData } from 'api/user_survey_submissions/types';

import useLocale from 'hooks/useLocale';

import {
  BodyWrapper,
  StyledAvatar,
  StyledUserName,
  BodyDiv,
  Separator,
  TimeAgo,
} from 'components/IdeaCard/Body/components';

import { timeAgo } from 'utils/dateUtils';

interface Props {
  ideaMini: IdeaMiniData;
}

const Body = ({ ideaMini }: Props) => {
  const { data: user } = useAuthUser();
  const locale = useLocale();

  if (!user) return null;

  const authorId = user.data.id;
  const publishedAt = ideaMini.attributes.published_at;

  return (
    <BodyWrapper>
      <Box display="flex" alignItems="center">
        <StyledAvatar
          size={36}
          userId={authorId}
          fillColor={transparentize(0.6, colors.textSecondary)}
        />
        <BodyDiv>
          <StyledUserName userId={authorId || null} />
          <Separator aria-hidden>&bull;</Separator>
          {publishedAt && (
            <TimeAgo>{timeAgo(Date.parse(publishedAt), locale)}</TimeAgo>
          )}
        </BodyDiv>
      </Box>
    </BodyWrapper>
  );
};

export default Body;
