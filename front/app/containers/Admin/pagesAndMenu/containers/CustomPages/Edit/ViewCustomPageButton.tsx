import React from 'react';

import { WrappedComponentProps } from 'react-intl';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  linkTo: string;
}

const ViewCustomPageButton = ({
  linkTo,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  return (
    <ButtonWithLink
      buttonStyle="secondary-outlined"
      icon="eye"
      id="to-custom-page"
      openLinkInNewTab
      linkTo={linkTo}
    >
      {formatMessage(messages.viewCustomPage)}
    </ButtonWithLink>
  );
};

export default injectIntl(ViewCustomPageButton);
