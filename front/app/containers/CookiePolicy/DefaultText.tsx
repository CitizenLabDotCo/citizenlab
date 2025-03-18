import React from 'react';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import messages from './messages';
import StyledButton from './StyledButton';

const DefaultText = () => {
  const { formatMessage } = useIntl();
  const openConsentManager = () => {
    eventEmitter.emit('openConsentManager');
  };

  return (
    <>
      <p>{formatMessage(messages.intro)}</p>
      <h2>{formatMessage(messages.whatDoWeUseCookiesFor)}</h2>
      <p>
        <FormattedMessage
          {...messages.viewPreferencesText}
          values={{
            viewPreferencesButton: (
              <StyledButton
                data-testid="viewPreferencesButton"
                onClick={openConsentManager}
              >
                {formatMessage(messages.viewPreferencesButtonText)}
              </StyledButton>
            ),
          }}
        />
      </p>

      <h3>{formatMessage(messages.analyticsTitle)}</h3>
      <p>{formatMessage(messages.analyticsContent)}</p>

      <h3>{formatMessage(messages.advertisingTitle)}</h3>
      <p>{formatMessage(messages.advertisingContent)}</p>

      <h3>{formatMessage(messages.functionalTitle)}</h3>
      <p>{formatMessage(messages.functionalContent)}</p>

      <h3>{formatMessage(messages.essentialTitle)}</h3>
      <p>{formatMessage(messages.essentialContent)}</p>

      <h3>{formatMessage(messages.externalTitle)}</h3>
      <p>{formatMessage(messages.externalContent)}</p>

      <h2>{formatMessage(messages.manageCookiesTitle)}</h2>
      <p>{formatMessage(messages.manageCookiesDescription)}</p>

      <FormattedMessage
        tagName="p"
        {...messages.manageCookiesPreferences}
        values={{
          manageCookiesPreferencesButtonText: (
            <StyledButton
              onClick={openConsentManager}
              data-testid="managePreferencesButton"
            >
              {formatMessage(messages.manageCookiesPreferencesButtonText)}
            </StyledButton>
          ),
        }}
      />
    </>
  );
};

export default DefaultText;
