import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import { TVerificationMethod } from 'api/verification_methods/types';

import { AUTH_PATH } from 'containers/App/constants';

import VerificationMethodButton from 'components/UI/VerificationMethodButton';

import { getJwt } from 'utils/auth/jwt';
import { FormattedMessage } from 'utils/cl-intl';
import { removeUrlLocale } from 'utils/removeUrlLocale';

import messages from './messages';

interface Props {
  method?: TVerificationMethod;
  last: boolean;
  grayBorder?: boolean;
  standardSSOBehavior?: boolean;
  onClick?: (method: TVerificationMethod) => void;
  onClickStandardSSO?: () => void;
}

const NemlogInButton = ({
  method,
  last,
  grayBorder,
  standardSSOBehavior,
  onClick,
  onClickStandardSSO,
}: Props) => {
  const handleOnClick = () => {
    if (method && onClick) {
      onClick(method);
    }

    if (standardSSOBehavior) {
      onClickStandardSSO?.();
    } else {
      const jwt = getJwt();
      window.location.href = `${AUTH_PATH}/nemlog_in?token=${jwt}&pathname=${removeUrlLocale(
        window.location.pathname
      )}`;
    }
  };

  return (
    <VerificationMethodButton
      id="e2e-nemlogin-button"
      last={last}
      onClick={handleOnClick}
      borderColor={grayBorder ? colors.grey500 : undefined}
    >
      <FormattedMessage {...messages.verifyNemLogIn} />
    </VerificationMethodButton>
  );
};

export default NemlogInButton;
