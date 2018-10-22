import React from 'react';
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import styled from 'styled-components';
import eventEmitter from 'utils/eventEmitter';
import { colors } from 'utils/styleUtils';

const openConsentManager = () => eventEmitter.emit('footer', 'openConsentManager', null);

const StyledButton = styled.button`
  color: ${colors.label};
  font-weight: 800;
  text-decoration: none;
  margin: 0;
  padding: 0;

  &:hover {
    color: #000;
  }
`;
const bigBreak = (
  <>
    <p />
    <p>
      <br />
    </p>
  </>
);
const littleBreak = (
  <>
    <p>
      <br />
    </p>
  </>
);

const CookiePolicy = (props: InjectedIntlProps) => {
  const { formatMessage } = props.intl;
  return (
    <>
      <FormattedMessage tagName="p" {...messages.intro} />
      <FormattedMessage
        tagName="p"
        {...messages.changePreferences}
        values={{
          changePreferencesButton: (
            <StyledButton onClick={openConsentManager}>
              <FormattedMessage {...messages.changePreferencesButtonText} />
            </StyledButton>
          )
        }}
      />
      {bigBreak}
      <FormattedMessage tagName="h2" {...messages.whoAreWeTitle} />

      <FormattedMessage
        tagName="p"
        {...messages.whoAreWeContent}
        values={{
          citizenLabLink: (
            <a href={formatMessage(messages.citizenLabHref)}>
              CitizenLab
            </a>
          )
        }}
      />
      {bigBreak}
      <FormattedMessage tagName="h2" {...messages.whatAreCookiesTitle} />
      <FormattedMessage
        tagName="p"
        {...messages.whatAreCookiesContent}
        values={{
          wikipediaCookieLink: (
            <a href={props.intl.formatMessage(messages.wikipediaCookieLinkHref)}>
              {formatMessage(messages.wikipediaCookieLinkText)}
            </a>
          )
        }}
      />
      {bigBreak}
      <FormattedMessage tagName="h2" {...messages.whatCookiesTitle} />
      <FormattedMessage {...messages.whatCookiesContent} />
      <p>
        <br />
      </p>
      <FormattedMessage tagName="h3" {...messages.analyticsTitle} />
      <FormattedMessage
        tagName="p"
        {...messages.analyticsContent}
        values={{
          analyticsLink: (
            <a href={formatMessage(messages.analyticsHref)}>
              {formatMessage(messages.analyticsLinkText)}
            </a>
          )
        }}
      />
      {littleBreak}
      <FormattedMessage tagName="h3" {...messages.advertisingTitle} />
      <FormattedMessage
        tagName="p"
        {...messages.advertisingContent}
        values={{
          advertisingLink: (
            <a href={formatMessage(messages.advertisingHref)}>
              {formatMessage(messages.advertisingLinkText)}
            </a>
          )
        }}
      />
      {littleBreak}
      <FormattedMessage tagName="h3" {...messages.functionalTitle} />
      <FormattedMessage
        tagName="p"
        {...messages.functionalContent}
        values={{
          functionalLink: (
            <a href={formatMessage(messages.functionalHref)}>
              {formatMessage(messages.functionalLinkText)}
            </a>
          )
        }}
      />
      {bigBreak}
      <FormattedMessage
        tagName="p"
        {...messages.cookiesList}
        values={{
          cookiesListButton: (
            <StyledButton onClick={openConsentManager}>
              {formatMessage(messages.cookiesListButtonText)}
            </StyledButton>
          )
        }}
      />
      <FormattedMessage tagName="p" {...messages.contactInfo} />
    </>
  );
};

export default injectIntl(CookiePolicy);
