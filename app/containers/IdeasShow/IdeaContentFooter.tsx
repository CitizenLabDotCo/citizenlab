import React, { memo } from 'react';
import { isEmpty } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import AvatarBubbles from 'components/AvatarBubbles';
import Icon from 'components/UI/Icon';

// resources
import GetRandomAvatars, { GetRandomAvatarsChildProps } from 'resources/GetRandomAvatars';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const Left = styled.div``;

const Right = styled.div`
  display: flex;
`;

const CommentsIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: ${colors.label};
`;

const CommentsCount = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  margin-left: 3px;
`;

interface InputProps {
  ideaId: string;
  commentsCount: number;
  className?: string;
}

interface DataProps {
  randomAvatars: GetRandomAvatarsChildProps;
}

interface Props extends InputProps, DataProps {}

const avatarLimit = 3;

const IdeaContentFooter = memo<Props>(({ commentsCount, randomAvatars, className }) => {

  const avatarIds = (!isNilOrError(randomAvatars) && randomAvatars.data.length > 0 ? randomAvatars.data.map(avatar => avatar.id) : []);
  const userCount = !isNilOrError(randomAvatars) ? randomAvatars.meta.total : undefined;

  return (
    <Container className={className}>
      <Left>
        {!isEmpty(avatarIds) &&
          <AvatarBubbles
            size={26}
            limit={avatarLimit}
            avatarIds={avatarIds}
            userCount={userCount}
          />
        }
      </Left>

      <Right>
        <CommentsIcon name="comments" />
        <CommentsCount>{commentsCount}</CommentsCount>
      </Right>
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  randomAvatars: ({ ideaId, render }) => <GetRandomAvatars limit={avatarLimit} context={{ type: 'idea', id: ideaId }}>{render}</GetRandomAvatars>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaContentFooter {...inputProps} {...dataProps} />}
  </Data>
);
