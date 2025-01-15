import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';

import { IIdea } from 'api/ideas/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { timeAgo } from 'utils/dateUtils';

import {
  BodyWrapper,
  StyledAvatar,
  BodyDiv,
  StyledUserName,
  Separator,
  TimeAgo,
} from './components';

interface Props {
  idea: IIdea;
}

const Body = ({ idea }: Props) => {
  const locale = useLocale();
  const localize = useLocalize();

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const authorId = idea.data.relationships?.author?.data?.id || null;
  const authorHash = idea.data.attributes.author_hash;

  // remove html tags from wysiwyg output
  const bodyText = localize(idea.data.attributes.body_multiloc)
    .replace(/<[^>]*>?/gm, '')
    .replaceAll('&amp;', '&')
    .trim();
  const publishedAt = idea.data.attributes.published_at;

  return (
    <BodyWrapper>
      <StyledAvatar
        size={36}
        userId={authorId}
        fillColor={transparentize(0.6, colors.textSecondary)}
        authorHash={authorHash}
      />
      <BodyDiv>
        <StyledUserName
          userId={authorId || null}
          anonymous={idea.data.attributes.anonymous}
        />
        <Separator aria-hidden>&bull;</Separator>
        {publishedAt && (
          <TimeAgo>{timeAgo(Date.parse(publishedAt), locale)}</TimeAgo>
        )}
        <span aria-hidden> {bodyText}</span>
      </BodyDiv>
    </BodyWrapper>
  );
};

export default Body;
