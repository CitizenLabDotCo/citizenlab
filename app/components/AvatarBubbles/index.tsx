import React, { PureComponent, MouseEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Icon from 'components/UI/Icon';

// resources
import GetRandomAvatars, { GetRandomAvatarsChildProps } from 'resources/GetRandomAvatars';

// i18n
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled, { css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

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
  userCountBgColor?: string;
  className?: string;
  onClick?: (event: MouseEvent) => void;
}

interface DataProps {
  avatars: GetRandomAvatarsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

const defaultLimit = 4;

class AvatarBubbles extends PureComponent<Props & InjectedIntlProps, State> {
  static defaultProps = {
    limit: defaultLimit
  };

  handleOnClick = (event: MouseEvent) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  }

  render() {
    const { avatars, size, overlap, context, className } = this.props;

    if (!isNilOrError(avatars)) {
      const avatarList = avatars.data;
      const avatarCount = avatarList.length;
      const userCount = avatars.meta.total;
      const userCountBgColor = this.props.userCountBgColor || colors.clIconSecondary;
      const usersWithoutAvatar = userCount - avatarCount;
      const definedSize = size || 34;
      const definedOverlap = overlap || 10;
      const imageSize = (definedSize > 160 ? 'large' : 'medium');
      const calcWidth = avatarCount * (definedSize - definedOverlap) + definedSize + 8; // total component width is the highest left position offset plus the total width of last bubble

      if ((!context && userCount > 4) || (context)) {
        return (
          <Container
            className={className}
            count={avatarCount}
            size={definedSize}
            width={calcWidth}
            overlap={definedOverlap}
            onClick={this.handleOnClick}
          >
            {avatarList.map((avatar, index) => (
              <AvatarWrapper key={index}>
                <AvatarImage
                  src={avatar.attributes.avatar[imageSize]}
                  alt={this.props.intl.formatMessage(messages.avatarAltText)}
                  size={definedSize}
                />
              </AvatarWrapper>
            ))}
            <AvatarWrapper key={avatarCount}>
              <UserCount
                className={(usersWithoutAvatar > 999) ? 'too-many-users' : ''}
                size={definedSize}
                bgColor={userCountBgColor}
              >
                <PlusIcon name="plus" />
                {usersWithoutAvatar}
              </UserCount>
            </AvatarWrapper>
          </Container>
        );
      }
    }

    return null;
  }
}

const AvatarBubblesWithHoCs = injectIntl(AvatarBubbles);

export default (inputProps: InputProps) => {
  return (
    <GetRandomAvatars limit={inputProps.limit || defaultLimit} context={inputProps.context}>
      {avatars => <AvatarBubblesWithHoCs avatars={avatars} {...inputProps} />}
    </GetRandomAvatars>
  );
};
