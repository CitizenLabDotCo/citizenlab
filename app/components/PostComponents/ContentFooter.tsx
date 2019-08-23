import React, { memo } from 'react';
import { isEmpty } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import AvatarBubbles from 'components/AvatarBubbles';
import Icon from 'components/UI/Icon';
import ContentChangeLog from 'components/PostComponents/ContentChangeLog';

// resources
import GetRandomAvatars, { GetRandomAvatarsChildProps } from 'resources/GetRandomAvatars';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedRelative } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: solid 1px ${colors.separation};
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  margin-right: 12px;
`;

const TimeAgo = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: normal;
  margin-right: 12px;
`;

const CommentsIcon = styled(Icon)`
  width: 21px;
  height: 21px;
  fill: ${colors.clIconSecondary};
  margin-right: 6px;
`;

const CommentsCount = styled.div`
  color: ${colors.secondaryText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  margin-left: 3px;
`;

interface InputProps {
  id: string;
  postType: 'idea' | 'initiative';
  publishedAt: string;
  commentsCount: number;
  className?: string;
}

interface DataProps {
  randomAvatars: GetRandomAvatarsChildProps;
}

interface Props extends InputProps, DataProps {}

const avatarLimit = 3;

const IdeaContentFooter = memo<Props>(({ publishedAt, commentsCount, randomAvatars, className, postType, id }) => {

  const avatarIds = (!isNilOrError(randomAvatars) && randomAvatars.data.length > 0 ? randomAvatars.data.map(avatar => avatar.id) : []);
  const userCount = !isNilOrError(randomAvatars) ? randomAvatars.meta.total : undefined;

  return (
    <Container id="e2e-idea-content-footer" className={className}>
      <Left>
        {!isEmpty(avatarIds) &&
          <StyledAvatarBubbles
            size={26}
            limit={avatarLimit}
            avatarIds={avatarIds}
            userCount={userCount}
          />
        }

        <TimeAgo>
          <FormattedMessage {...messages.createdTimeAgo} values={{ timeAgo: <FormattedRelative value={publishedAt} /> }} />
          <ContentChangeLog postId={id} postType={postType} />
        </TimeAgo>
      </Left>

      <Right>
        <CommentsIcon name="comments" />
        <CommentsCount>{commentsCount}</CommentsCount>
      </Right>
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  randomAvatars: ({ id, postType, render }) => <GetRandomAvatars limit={avatarLimit} context={{ id, type: postType }}>{render}</GetRandomAvatars>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaContentFooter {...inputProps} {...dataProps} />}
  </Data>
);
