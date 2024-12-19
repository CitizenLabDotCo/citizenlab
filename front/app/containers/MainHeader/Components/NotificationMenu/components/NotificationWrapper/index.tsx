import React from 'react';

import {
  Icon,
  IconNames,
  fontSizes,
  colors,
  media,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import { RouteType } from 'routes';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { trackEventByName } from 'utils/analytics';
import Link from 'utils/cl-router/Link';
import { timeAgo } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

import tracks from '../../tracks';

const Container = styled(Link)`
  display: flex;
  text-align: left;
  cursor: pointer;
  border-radius: ${(props) => props.theme.borderRadius};
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

const StyledIcon = styled(Icon)<{ isRead: boolean }>`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  opacity: ${(props) => (props.isRead ? '0.4' : '1')};
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
  children: React.ReactNode;
  linkTo: RouteType;
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
  const track = () => {
    trackEventByName(tracks.clickNotification.name, { linkTo });
  };

  if (!isNilOrError(locale)) {
    return (
      <Container to={linkTo} onClick={track}>
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
