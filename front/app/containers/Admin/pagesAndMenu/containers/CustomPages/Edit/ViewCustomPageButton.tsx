import React from 'react';

import { WrappedComponentProps } from 'react-intl';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';

import messages from '../messages';

import type { LinkProps } from '@tanstack/react-router';

interface Props {
  to?: LinkProps['to'];
  params?: Record<string, string>;
  search?: Record<string, unknown>;
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
