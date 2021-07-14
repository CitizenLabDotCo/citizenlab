import React from 'react';

// components
import Link from 'utils/cl-router/Link';

// i18n
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';
import { media, colors, isRtl, fontSizes } from 'utils/styleUtils';

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 30px;
  margin-bottom: 39px;
  border-bottom: 1px solid #d1d1d1;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  padding: 0;
  margin: 0;

  ${media.smallerThanMinTablet`
    text-align: center;
    margin: 0;
  `};
`;

const EventPageLink = styled(Link)`
  color: ${colors.label};
  margin-top: auto;
`;

export default injectIntl<InjectedIntlProps>(({ intl }) => (
  <Header>
    <Title>{intl.formatMessage(messages.eventsWidgetTitle)}</Title>
    <EventPageLink to="/events">
      {intl.formatMessage(messages.viewAllEventsText)}
    </EventPageLink>
  </Header>
));
