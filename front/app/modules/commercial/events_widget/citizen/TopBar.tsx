import React from 'react';

// components
import Link from 'utils/cl-router/Link';

// i18n
import messages from 'containers/HomePage/messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes, isRtl, media } from 'utils/styleUtils';

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 30px;
  border-bottom: 1px solid #d1d1d1;
  margin-bottom: 30px;

  ${media.phone`
    margin-bottom: 21px;
  `}

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  padding: 0;
  margin: 0;

  ${media.phone`
    text-align: center;
    margin: 0;
  `};
`;

const EventPageLink = styled(Link)`
  color: ${colors.textSecondary};
  margin-top: auto;
`;

export default injectIntl<WrappedComponentProps>(({ intl }) => (
  <Header>
    <Title>{intl.formatMessage(messages.upcomingEventsWidgetTitle)}</Title>
    <EventPageLink to="/events">
      {intl.formatMessage(messages.viewAllEventsText)}
    </EventPageLink>
  </Header>
));
