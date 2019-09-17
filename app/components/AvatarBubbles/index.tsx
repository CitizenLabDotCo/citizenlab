import React, { PureComponent, MouseEvent } from 'react';
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
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const EmptyContainer = styled.div``;

const AvatarWrapper = styled.div`
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  background: #fff;
`;

const AvatarImage: any = styled.img`
  height: ${(props: any) => props.size}px;
  width: ${(props: any) => props.size}px;
  border-radius: 50%;
  text-indent: -9999px;
`;

const Container: any = styled.div`
  width: ${(props: any) => props.width}px;
  height: ${(props: any) => props.size + 6}px;
  position: relative;

  ${(props: any) => props.count >= 1 ? [...Array(props.count + 1).keys()].map(index =>
    css`
    ${AvatarWrapper} {
      position: absolute;

      &:nth-child(${index + 1}) {
        z-index: ${index};
        left: ${index * (props.size - props.overlap)}px;
      }
    }
  `) : css``};
`;

const UserCount: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${(props: any) => props.size}px;
  line-height: ${(props: any) => props.size}px;
  width: ${(props: any) => props.size}px;
  padding-bottom: 0;
  font-size: ${fontSizes.small}px;
  background: ${(props: any) => props.bgColor};
  border-radius: 50%;
  color: white;
  font-weight: 500;

  &.too-many-users {
    font-size: ${fontSizes.xs}px;
  }

  .screenreader-only {
    position:absolute;
    left:-10000px;
    top:auto;
    width:1px;
    height:1px;
    overflow:hidden;
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
      const definedSize = size || 34;
      const definedOverlap = overlap || 10;
      const imageSize = (definedSize > 160 ? 'large' : 'medium');
      const avatarsWithImage = avatars.filter(avatar => (!isError(avatar) && avatar.attributes.avatar) && avatar.attributes.avatar[imageSize]) as IAvatarData[];
      const avatarCount = avatarsWithImage.length;
      const userCountBgColor = this.props.userCountBgColor || colors.clIconSecondary;
      const remainingUsers = userCount - avatarCount;
      const calcWidth = avatarCount * (definedSize - definedOverlap) + definedSize + 8; // total component width is the highest left position offset plus the total width of last bubble

      if (avatarIds || context || (avatarCount > 0)) {
        return (
          <Container
            className={className}
            count={avatarCount}
            size={definedSize}
            width={calcWidth}
            overlap={definedOverlap}
          >
            {avatarsWithImage.map((avatar, index) => (
              <AvatarWrapper key={index}>
                <AvatarImage
                  src={avatar.attributes.avatar[imageSize]}
                  alt=""
                  size={definedSize}
                />
              </AvatarWrapper>
            ))}
            {remainingUsers > 0 &&
              <AvatarWrapper key={avatarCount}>
                <UserCount
                  className={(remainingUsers > 999) ? 'too-many-users' : ''}
                  size={definedSize}
                  bgColor={userCountBgColor}
                >
                  <PlusIcon name="plus" ariaHidden />
                  <span aria-hidden>{remainingUsers}</span>
                  <span className="screenreader-only">
                    {formatMessage(messages.numberOfUsers, { numberOfUsers: userCount })}
                  </span>
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
