import React from 'react';

import { colors, isRtl, fontSizes } from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';
import styled from 'styled-components';

import { IIdea } from 'api/ideas/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

import { timeAgo } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

const BodyWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 6px;
  margin-left: -4px;
  margin-top: -2px;
  ${isRtl`
    margin-left: 6px;
    margin-right: -4px;
  `}
`;

const BodyDiv = styled.div`
  font-size: ${fontSizes.s}px;
  font-weight: 300;
  color: ${colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 21px;
  max-height: 42px;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const StyledUserName = styled(UserName)`
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  color: ${colors.textSecondary};
  font-weight: 500;
`;

const Separator = styled.span`
  margin-left: 4px;
  margin-right: 4px;
`;

const TimeAgo = styled.span`
  font-weight: 500;
  margin-right: 5px;
`;

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
        {!isNilOrError(locale) && publishedAt && (
          <TimeAgo>{timeAgo(Date.parse(publishedAt), locale)}</TimeAgo>
        )}
        <span aria-hidden> {bodyText}</span>
      </BodyDiv>
    </BodyWrapper>
  );
};

export default Body;
