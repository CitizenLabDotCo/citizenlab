import React from 'react';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

// styling
import styled from 'styled-components';
import { colors, isRtl, fontSizes } from 'utils/styleUtils';
import { transparentize } from 'polished';

// i18n
import useLocalize from 'hooks/useLocalize';
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { timeAgo } from 'utils/dateUtils';

// typings
import { IIdea } from 'api/ideas/types';

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

  const authorId = idea.data.relationships?.author?.data?.id || null;
  const authorHash = idea.data.attributes.author_hash;

  // remove html tags from wysiwyg output
  const bodyText = localize(idea.data.attributes.body_multiloc)
    .replace(/<[^>]*>?/gm, '')
    .replaceAll('&amp;', '&')
    .trim();

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
        {!isNilOrError(locale) && (
          <TimeAgo>
            {timeAgo(Date.parse(idea.data.attributes.created_at), locale)}
          </TimeAgo>
        )}
        <span aria-hidden> {bodyText}</span>
      </BodyDiv>
    </BodyWrapper>
  );
};

export default Body;
