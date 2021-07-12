import React from 'react';

// components
import Link from 'utils/cl-router/Link';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';
import { media, colors, isRtl, fontSizes } from 'utils/styleUtils';

const EventsWidgetContainer = styled.div`
  padding: 48px 0 124px 0;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 30px;
  margin-bottom: 39px;
  border-bottom: 1px solid #d1d1d1;
  line-height: ${fontSizes.xl}px;

  ${media.smallerThanMinTablet`
    justify-content: center;
    border: none;
  `};

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
`;

export default injectIntl<InjectedIntlProps>(({ intl }) => {
  return (
    <EventsWidgetContainer>
      <Header>
        <Title>{intl.formatMessage(messages.eventsWidgetTitle)}</Title>
        <EventPageLink to="/events">
          {intl.formatMessage(messages.viewAllEventsText)}
        </EventPageLink>
      </Header>
    </EventsWidgetContainer>
  );
});
