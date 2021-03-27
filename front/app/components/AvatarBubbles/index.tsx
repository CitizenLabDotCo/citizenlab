import React, { PureComponent } from 'react';
import { isNumber, isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

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
import { colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const getFontSize = (size: number, digits: number) => {
  if (size >= 34) {
    if (digits <= 2) {
      return 14;
    }

    if (digits === 3) {
      return 12;
    }

    if (digits >= 4) {
      return 11;
    }
  } else {
    if (digits <= 2) {
      return 12;
    }

    if (digits === 3) {
      return 11;
    }

    if (digits >= 4) {
      return 10;
    }
  }

  return 14;
};

const EmptyContainer = styled.div``;

const Container = styled.div<{ width: number; height: number }>`
  flex-shrink: 0;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: relative;
`;

const AvatarImageBubble = styled.img<{
  overlap: number;
  index: number;
  size: number;
}>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  border: solid 2px #fff;
  text-indent: -9999px;
  position: absolute;
  z-index: ${(props) => props.index + 1};
  left: ${(props) => props.index * (props.size - props.overlap)}px;
  object-fit: cover;
  object-position: center;
`;

const UserCountBubble = styled.div<{
  overlap: number;
  index: number;
  size: number;
  bgColor: string;
}>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0;
  border-radius: 50%;
  border: solid 2px #fff;
  background: ${(props: any) => props.bgColor};
  position: absolute;
  z-index: ${(props) => props.index + 1};
  left: ${(props) => props.index * (props.size - props.overlap)}px;
`;

const UserCountBubbleInner = styled.div<{ size: number; digits: number }>`
  color: #fff;
  font-size: ${({ size, digits }) => getFontSize(size, digits)}px;
  font-weight: 500;
  display: flex;
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
    limit: defaultLimit,
    size: 34,
  };

  render() {
    const {
      avatars,
      avatarIds,
      context,
      size,
      overlap,
      userCount,
      className,
      intl: { formatMessage },
    } = this.props;

    if (!isNilOrError(avatars) && isNumber(userCount) && userCount > 0) {
      const bubbleSize = (size as number) + 4;
      const bubbleOverlap = overlap || 10;
      const imageSize = bubbleSize > 160 ? 'large' : 'medium';
      const avatarsWithImage = avatars.filter(
        (avatar) =>
          !isError(avatar) &&
          avatar.attributes.avatar &&
          avatar.attributes.avatar[imageSize]
      ) as IAvatarData[];
      const avatarImagesCount = avatarsWithImage.length;
      const userCountBgColor =
        this.props.userCountBgColor || colors.clIconSecondary;
      const remainingUsers = userCount - avatarImagesCount;
      const remainingUsersDigits = remainingUsers.toString().length;
      const bubblesCount = avatarImagesCount + (remainingUsers > 0 ? 1 : 0);
      const containerHeight = bubbleSize + 2;
      const containerWidth =
        bubblesCount * (bubbleSize - bubbleOverlap) + bubbleOverlap + 2;

      if (avatarIds || context || avatarImagesCount > 0) {
        return (
          <Container
            className={className}
            width={containerWidth}
            height={containerHeight}
          >
            {avatarsWithImage.map((avatar, index) => (
              <AvatarImageBubble
                key={index}
                index={index}
                overlap={bubbleOverlap}
                size={bubbleSize}
                src={avatar.attributes.avatar[imageSize]}
                alt=""
              />
            ))}
            {remainingUsers > 0 && (
              <UserCountBubble
                index={avatarsWithImage.length}
                overlap={bubbleOverlap}
                size={bubbleSize}
                bgColor={userCountBgColor}
              >
                <UserCountBubbleInner
                  size={bubbleSize}
                  digits={remainingUsersDigits}
                  aria-hidden
                >
                  +{remainingUsers}
                </UserCountBubbleInner>
                <ScreenReaderOnly>
                  {formatMessage(messages.numberOfUsers, {
                    numberOfUsers: userCount,
                  })}
                </ScreenReaderOnly>
              </UserCountBubble>
            )}
          </Container>
        );
      }
    } else if (avatars !== undefined) {
      return <EmptyContainer className={className} />;
    }

    return null;
  }
}

const AvatarBubblesWithHoCs = injectIntl(AvatarBubbles);

export default (inputProps: InputProps) => {
  if (inputProps.avatarIds) {
    return (
      <GetAvatars ids={inputProps.avatarIds}>
        {(avatars) => (
          <AvatarBubblesWithHoCs
            {...inputProps}
            avatars={!isNilOrError(avatars) ? avatars : null}
          />
        )}
      </GetAvatars>
    );
  }

  return (
    <GetRandomAvatars
      limit={inputProps.limit || defaultLimit}
      context={inputProps.context}
    >
      {(avatars) => (
        <AvatarBubblesWithHoCs
          {...inputProps}
          avatars={!isNilOrError(avatars) ? avatars.data : null}
          userCount={!isNilOrError(avatars) ? avatars.meta.total : undefined}
        />
      )}
    </GetRandomAvatars>
  );
};
