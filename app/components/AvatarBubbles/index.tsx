import React, { PureComponent } from 'react';
import { isNumber, isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';

// services
import { IAvatarData } from 'services/avatars';

// resources
import GetRandomAvatars from 'resources/GetRandomAvatars';
import GetAvatars from 'resources/GetAvatars';

// i18n
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes, ScreenReaderOnly } from 'utils/styleUtils';

const EmptyContainer = styled.div``;

const Container = styled.div<{ width: number, height: number }>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: relative;
`;

const AvatarWrapper = styled.div<{ overlap: number, index: number, size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  position: absolute;
  z-index: ${(props) => props.index + 1};
  left: ${(props) => props.index * (props.size - props.overlap)}px;
`;

const AvatarImage = styled.img<{ size: number }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  text-indent: -9999px;
`;

const UserCount = styled.div<{ size: number, bgColor: string }>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  color: #fff;
  line-height: ${(props) => props.size}px;
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0;
  border-radius: 50%;
  background: ${(props: any) => props.bgColor};

  &.too-many-users {
    font-size: ${fontSizes.xs}px;
  }
`;

const PlusIcon = styled(Icon)`
  width: 8px;
  height: 8px;
  margin-right: 1px;
`;

/* InputProps
* limit: the number of avatars you need, you'll get one extra bubble with the remaining count, defaults to 3
* context: extra info if you use the component in a specific context, defaults to platform-wide
* size: image size, each bubble will be 4px bigger because of margins, defaults to 30px
* overlap: the number of pixel the bubbles overlap, defaults to 7
*/
interface InputProps {
  limit?: number;
  context?: {
    type: 'project' | 'group';
    id: string;
  };
  size?: number;
  overlap?: number;
  userCount?: number;
  userCountBgColor?: string;
  avatarIds?: string[];
  className?: string;
}

interface DataProps {
  avatars: (IAvatarData | Error)[] | null;
}

interface Props extends InputProps, DataProps {}

interface State {}

const defaultLimit = 4;

class AvatarBubbles extends PureComponent<Props & InjectedIntlProps, State> {
  static defaultProps = {
    limit: defaultLimit
  };

  render() {
    const { avatars, avatarIds, context, size, overlap, userCount, className, intl: { formatMessage } } = this.props;

    if (!isNilOrError(avatars) && isNumber(userCount) && userCount > 0) {
      const bubbleInnerSize = size || 34;
      const bubbleOuterSize = bubbleInnerSize + 4;
      const bubbleOverlap = overlap || 10;
      const imageSize = (bubbleInnerSize > 160 ? 'large' : 'medium');
      const avatarsWithImage = avatars.filter(avatar => (!isError(avatar) && avatar.attributes.avatar) && avatar.attributes.avatar[imageSize]) as IAvatarData[];
      const avatarImagesCount = avatarsWithImage.length;
      const userCountBgColor = this.props.userCountBgColor || colors.clIconSecondary;
      const remainingUsers = userCount - avatarImagesCount;
      const bubblesCount = avatarImagesCount + (remainingUsers > 0 ? 1 : 0);
      const containerHeight = bubbleOuterSize + 2;
      const containerWidth = bubblesCount * (bubbleOuterSize - bubbleOverlap) + bubbleOverlap + 2;

      if (avatarIds || context || (avatarImagesCount > 0)) {
        return (
          <Container
            className={className}
            width={containerWidth}
            height={containerHeight}
          >
            {avatarsWithImage.map((avatar, index) => (
              <AvatarWrapper
                key={index}
                className={index === 0 ? 'first' : ''}
                overlap={bubbleOverlap}
                size={bubbleOuterSize}
                index={index}
              >
                <AvatarImage
                  src={avatar.attributes.avatar[imageSize]}
                  alt=""
                  size={bubbleInnerSize}
                />
              </AvatarWrapper>
            ))}
            {remainingUsers > 0 &&
              <AvatarWrapper
                key={avatarImagesCount}
                overlap={bubbleOverlap}
                size={bubbleOuterSize}
                index={avatarsWithImage.length}
              >
                <UserCount
                  className={(remainingUsers > 999) ? 'too-many-users' : ''}
                  size={bubbleInnerSize}
                  bgColor={userCountBgColor}
                >
                  <PlusIcon name="plus" ariaHidden />
                  <span aria-hidden>{remainingUsers}</span>
                  <ScreenReaderOnly>
                    {formatMessage(messages.numberOfUsers, { numberOfUsers: userCount })}
                  </ScreenReaderOnly>
                </UserCount>
              </AvatarWrapper>
            }
          </Container>
        );
      }
    }

    return <EmptyContainer className={className} />;
  }
}

const AvatarBubblesWithHoCs = injectIntl(AvatarBubbles);

export default (inputProps: InputProps) => {
  if (inputProps.avatarIds) {
    return (
      <GetAvatars ids={inputProps.avatarIds}>
        {avatars => <AvatarBubblesWithHoCs {...inputProps} avatars={!isNilOrError(avatars) ? avatars : null} />}
      </GetAvatars>
    );
  }

  return (
    <GetRandomAvatars limit={inputProps.limit || defaultLimit} context={inputProps.context}>
      {avatars => <AvatarBubblesWithHoCs {...inputProps} avatars={!isNilOrError(avatars) ? avatars.data : null} userCount={!isNilOrError(avatars) ? avatars.meta.total : undefined} />}
    </GetRandomAvatars>
  );
};
