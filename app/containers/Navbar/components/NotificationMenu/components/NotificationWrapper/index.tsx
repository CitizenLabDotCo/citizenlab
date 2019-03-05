import React from 'react';
import Link from 'utils/cl-router/Link';
import { FormattedRelative } from 'react-intl';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';
import { injectTracks } from 'utils/analytics';
import tracks from '../../../../tracks';
import { darken } from 'polished';

const Container = styled(Link)`
  padding: 10px 0px;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  color: ${colors.label};
  border-radius: 5px;

  &:hover,
  &:focus {
    color: ${colors.text};
    background-color: ${colors.clDropdownHoverBackground};
  }
`;

const IconContainer = styled.div`
  padding-top: 4px;
  width: 60px;
  display: flex;
  justify-content: center;
`;

const StyledIcon = styled(Icon)`
  height: 17px;
  opacity: ${(props) => (props as any).isRead ? '0.35' : '1'};
` as any;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  font-size: ${fontSizes.base}px;
  flex-grow: 1;
  font-weight: ${(props) => (props as any).isRead ? 'normal' : '500'};
  padding-bottom: 3px;
  white-space: normal;

  a {
    color: ${colors.clBlueDark};
    text-decoration: none;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
      text-decoration: underline;
    }
  }

` as any;

const Timing = styled.span`
  font-size: ${fontSizes.small}px;
`;

interface ITracks {
  clickNotification: (arg: any) => void;
}

type Props = {
  icon?: string,
  timing?: string,
  children: any,
  linkTo: string,
  isRead: boolean,
};

class NotificationWrapper extends React.PureComponent<Props & ITracks> {

    track = () => {
      const { linkTo } = this.props;
      if (linkTo) this.props.clickNotification({ extra: { linkTo } });
    }

    render() {
      const { icon, children, timing, isRead, linkTo } = this.props;

      return (
        <Container to={linkTo} onClick={this.track}>
          <IconContainer>
            {icon && <StyledIcon name={icon} isRead={isRead} />}
          </IconContainer>
          <Body>
            <Message isRead={isRead}>{children}</Message>
            {timing && <Timing><FormattedRelative value={timing} /></Timing>}
          </Body>
        </Container>
      );
    }
}

export default injectTracks<Props>(tracks)(NotificationWrapper);
