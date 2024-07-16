import React from 'react';

import { WrappedComponentProps } from 'react-intl';
import { RouteType } from 'routes';

import Button from 'components/UI/Button';

import { injectIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  linkTo: RouteType;
}

const ViewCustomPageButton = ({
  linkTo,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  return (
    <Button
      buttonStyle="secondary-outlined"
      icon="eye"
      id="to-custom-page"
      openLinkInNewTab
      linkTo={linkTo}
    >
      {formatMessage(messages.viewCustomPage)}
    </Button>
  );
};

export default injectIntl(ViewCustomPageButton);
