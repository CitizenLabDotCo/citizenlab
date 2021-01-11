import React from 'react';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

const SmartGroupModalHeader = () => (
  <FormattedMessage {...messages.modalHeaderRules} />
);

export default SmartGroupModalHeader;
