import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const SmartGroupModalHeader = () => (
  <FormattedMessage {...messages.modalHeaderRules} />
);

export default SmartGroupModalHeader;
