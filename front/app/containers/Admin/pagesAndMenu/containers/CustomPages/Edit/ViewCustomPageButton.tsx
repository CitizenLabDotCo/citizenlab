import React from 'react';

import { WrappedComponentProps } from 'react-intl';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';

import messages from '../messages';

interface Props extends TypedLinkProps {
  linkTo?: string;
}

const ViewCustomPageButton = ({
  to,
  params,
  search,
  linkTo,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  return (
    <ButtonWithLink
      buttonStyle="secondary-outlined"
      icon="eye"
      id="to-custom-page"
      openLinkInNewTab
      to={to}
      params={params}
      search={search}
      linkTo={linkTo}
    >
      {formatMessage(messages.viewCustomPage)}
    </ButtonWithLink>
  );
};

export default injectIntl(ViewCustomPageButton);
