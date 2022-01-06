import React from 'react';
import { FormattedRelative } from 'react-intl';
import styled from 'styled-components';
import { darken } from 'polished';
import { fontSizes, colors, media } from 'utils/styleUtils';
import { Icon } from '@citizenlab/cl2-component-library';
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';
import clHistory from 'utils/cl-router/history';

const Container = styled.button`
  display: flex;
  text-align: left;
  cursor: pointer;
  border-radius: ${(props: any) => props.theme.borderRadius};
  padding-left: 15px;
  padding-right: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 0;
  margin-bottom: 5px;

  &:hover,
  &:focus {
    color: ${colors.text};
    background-color: ${colors.clDropdownHoverBackground};
  }

  ${media.smallerThanMinTablet`
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
  `}
`;

const IconContainer = styled.div`
  flex: 0 0 22px;
  width: 22px;
  display: flex;
  justify-content: center;
  margin-right: 15px;
`;

const StyledIcon: any = styled(Icon)`
  flex: 0 0 22px;
  height: 22px;
  fill: ${colors.label};
  opacity: ${(props: any) => (props.isRead ? '0.4' : '1')};
`;

const Body = styled.div`
  flex: 1 1 auto;
`;

const Message = styled.div<{ isRead: boolean }>`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: ${(props) => (props.isRead ? 'normal' : '500')};
  text-align: left;
  white-space: normal;
  margin-bottom: 4px;

  a {
    color: ${colors.clBlueDark};
    text-decoration: underline;
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
`;

const Timing = styled.span`
  width: 100%;
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  text-align: left;
`;

type Props = {
  icon?: string;
  timing?: string;
  children: any;
  linkTo: string;
  isRead: boolean;
};

class NotificationWrapper extends React.PureComponent<Props> {
  navigate = () => {
    const { linkTo } = this.props;
    if (linkTo) {
      trackEventByName(tracks.clickNotification.name, { extra: { linkTo } });
      clHistory.push(linkTo);
    }
  };

  render() {
    const { icon, children, timing, isRead } = this.props;

    return (
      <Container role="link" onClick={this.navigate}>
        <IconContainer>
          {icon && <StyledIcon name={icon} isRead={isRead} />}
        </IconContainer>
        <Body>
          <Message isRead={isRead}>{children}</Message>
          {timing && (
            <Timing>
              <FormattedRelative value={timing} />
            </Timing>
          )}
        </Body>
      </Container>
    );
  }
}

export default NotificationWrapper;
