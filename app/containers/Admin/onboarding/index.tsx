// libraries
import React from 'react';
import Helmet from 'react-helmet';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media, quillEditedContent } from 'utils/styleUtils';
import { darken } from 'polished';

export const Onboarding = (props: InjectedIntlProps) => {
  const { formatMessage } = props.intl;

  return (
    <>
      <Helmet>
        <title>{formatMessage(messages.adminOnboardingTitle)}</title>
        <meta name="description" content={formatMessage(messages.adminOnboardingDescription)} />
      </Helmet>
      <div>hi</div>
    </>
  );
};

export default injectIntl(Onboarding);
