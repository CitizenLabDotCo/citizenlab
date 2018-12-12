import React, { PureComponent } from 'react';

// resources TODO
import GetAvatars, { GetAvatarsChildProps } from 'resources/GetAvatars';

// i18n
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Style
import styled, { css } from 'styled-components';
import { colors } from 'utils/styleUtils';

const AvatarWrapper = styled.div`
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
`;

const AvatarImage: any = styled.img`
  height: ${(props: any) => props.size}px;
  width: ${(props: any) => props.size}px;
  border-radius: 50%;
`;

const Container: any = styled.div`
  height: ${(props: any) => props.size + 4}px;
  width: ${(props: any) => props.width}px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${(props: any) => props.count >= 1 ? [...Array(props.count + 1).keys()].map(index =>
    css`
    ${AvatarWrapper} {
      position: absolute;

      &:nth-child(${index + 1}) {
        z-index: ${index};
        left: ${index * (props.size - 7)}px;
      }
    }
  `) : css``};
`;

const SSpan: any = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${(props: any) => props.size}px;
  width: ${(props: any) => props.size}px;
  padding-bottom: ${(props: any) => Math.round(props.size / 10) - 1}px;
  font-size: 13px;
  background: ${colors.clIconSecondary};
  border-radius: 50%;
  color: white;
  font-weight: 700;
`;

/* inputProps
* limit: the number of avatars you need, you'll get one extra bubble with the remaining count, defaults to 3
* context: extra info if you use the component in a specific context
* size: image size, each bubble will be 4px bigger because of margins.
*/
interface InputProps {
  limit?: number;
  context?: {
    type: 'project' | 'group';
    id: string;
  };
  size?: number;
}

interface DataProps {
  avatars: GetAvatarsChildProps;
}
interface Props extends InputProps, DataProps { }

interface State { }

class AvatarBubbles extends PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { avatars, size } = this.props;
    if (avatars) {
      const avatarList = avatars.data;
      const avatarCount = avatarList.length;
      const userCount = avatars.meta.total;
      const definedSize = size || 30;

      const imageSize = (definedSize > 160 ? 'large' : 'medium');

      // total width is the highest left position offset plus the total width of last bubble
      const calcWidth = avatarCount * (definedSize - 7) + definedSize + 4;

      return (
        <Container count={avatarCount} size={definedSize} width={calcWidth}>
          {[...Array(avatarCount + 1).keys()].map((index) => {
            if (index === avatarCount) {
              return (
                <AvatarWrapper key={index}>
                    <SSpan size={definedSize} >+&nbsp;{userCount - index}</SSpan>
                </AvatarWrapper>
              );
            }
            return (
              <AvatarWrapper key={index}>
                <AvatarImage
                  src={avatarList[index].attributes.avatar[imageSize]}
                  alt={this.props.intl.formatMessage(messages.avatarAltText)}
                  size={definedSize}
                />
              </AvatarWrapper>
            );
          })}
        </Container>
      );
    }

    return null;
  }
}

const AvatarBubblesWithHoCs = injectIntl(AvatarBubbles);

export default (inputProps: InputProps) => (
  <GetAvatars limit={inputProps.limit || 3} context={inputProps.context}>
    {avatars => <AvatarBubblesWithHoCs avatars={avatars} {...inputProps} />}
  </GetAvatars>
);
