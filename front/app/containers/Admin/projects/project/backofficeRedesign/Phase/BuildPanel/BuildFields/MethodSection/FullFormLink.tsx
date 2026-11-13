import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';

import messages from './messages';

// Opens in a new tab so the manager stays where it was.
const FullFormLink = ({ to, params, search }: TypedLinkProps) => {
  const { formatMessage } = useIntl();

  return (
    <ButtonWithLink
      buttonStyle="bo-text"
      to={to}
      params={params}
      search={search}
      openLinkInNewTab
    >
      {formatMessage(messages.openFullForm)}
    </ButtonWithLink>
  );
};

export default FullFormLink;
