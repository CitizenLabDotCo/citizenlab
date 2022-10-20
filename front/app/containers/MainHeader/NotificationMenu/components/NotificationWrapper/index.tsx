import React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import { Icon, IconNames } from '@citizenlab/cl2-component-library';

// utils
import { fontSizes, colors, media } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import { timeAgo } from 'utils/dateUtils';
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

// hooks
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

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
    color: ${colors.textPrimary};
    background-color: ${colors.grey300};
  }

  ${media.phone`
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
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  opacity: ${(props: any) => (props.isRead ? '0.4' : '1')};
`;

const Body = styled.div`
  flex: 1 1 auto;
`;

const Message = styled.div<{ isRead: boolean }>`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: ${(props) => (props.isRead ? 'normal' : '500')};
  text-align: left;
  white-space: normal;
  margin-bottom: 4px;

  a {
    color: ${colors.teal};
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${darken(0.15, colors.teal)};
      text-decoration: underline;
    }
  }
`;

const Timing = styled.span`
  width: 100%;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  text-align: left;
`;

type Props = {
  icon?: IconNames;
  timing?: string;
  children: any;
  linkTo: string;
  isRead: boolean;
};

const NotificationWrapper = ({
  icon,
  children,
  timing,
  isRead,
  linkTo,
}: Props) => {
  const locale = useLocale();
  const navigate = () => {
    if (linkTo) {
      trackEventByName(tracks.clickNotification.name, { extra: { linkTo } });
      clHistory.push(linkTo);
    }
  };

  if (!isNilOrError(locale)) {
    return (
      <Container role="link" onClick={navigate}>
        <IconContainer>
          {icon && <StyledIcon name={icon} isRead={isRead} />}
        </IconContainer>
        <Body>
          <Message isRead={isRead}>{children}</Message>
          {timing && <Timing>{timeAgo(Date.parse(timing), locale)}</Timing>}
        </Body>
      </Container>
    );
  }
  return null;
};

export default NotificationWrapper;
