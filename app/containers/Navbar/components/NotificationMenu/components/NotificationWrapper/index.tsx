import React from 'react';
import { FormattedRelative } from 'react-intl';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';
import { trackEventByName } from 'utils/analytics';
import tracks from '../../../../tracks';
import clHistory from 'utils/cl-router/history';

const Container = styled.button`
  padding: 10px 0px;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  color: ${colors.label};
  border-radius: ${(props: any) => props.theme.borderRadius};
  text-align: left;
  outline: none;
  width: 100%;

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

const StyledIcon: any = styled(Icon)`
  height: 17px;
  opacity: ${(props: any) => props.isRead ? '0.35' : '1'};
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div<{ isRead: boolean }>`
  color: red;
  font-size: ${fontSizes.base}px;
  font-weight: ${props => props.isRead ? 'normal' : '500'};
  flex-grow: 1;
  padding-bottom: 3px;
  white-space: normal;

  a {
    color: #000;
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: #000;
      text-decoration: underline;
    }
  }

`;

const Timing = styled.span`
  font-size: ${fontSizes.small}px;
`;

type Props = {
  icon?: string,
  timing?: string,
  children: any,
  linkTo: string,
  isRead: boolean,
};

class NotificationWrapper extends React.PureComponent<Props> {
  navigate = () => {
    const { linkTo } = this.props;
    if (linkTo) {
      trackEventByName(tracks.clickNotification.name, { extra: { linkTo } });
      clHistory.push(linkTo);
    }
  }

  render() {
    const { icon, children, timing, isRead } = this.props;

    return (
      <Container role="link" onClick={this.navigate}>
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

export default NotificationWrapper;
