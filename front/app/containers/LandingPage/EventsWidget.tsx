import React from 'react';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';
import { media, fontSizes, isRtl } from 'utils/styleUtils';

const EventsWidgetContainer = styled.div`
  padding: 48px 0 124px 0;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #d1d1d1;

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
  display: flex;
  align-items: center;
  padding: 0;
  margin-right: 45px;
  width: 100%;

  ${media.smallerThanMinTablet`
    text-align: center;
    margin: 0;
  `};

  ${isRtl`
    margin-right: 0;
    margin-left: 45px;
    justify-content: flex-end;
  `}
`;

export default injectIntl<InjectedIntlProps>(({ intl }) => {
  return (
    <EventsWidgetContainer>
      <Header>
        <Title>{intl.formatMessage(messages.eventsWidgetTitle)}</Title>
      </Header>
    </EventsWidgetContainer>
  );
});
