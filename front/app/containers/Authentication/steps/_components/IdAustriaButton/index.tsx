import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import { TVerificationMethod } from 'api/verification_methods/types';

import { AUTH_PATH } from 'containers/App/constants';
import messages from 'containers/Authentication/steps/_components/IdAustriaButton/messages';

import VerificationMethodButton from 'components/UI/VerificationMethodButton';

import { getJwt } from 'utils/auth/jwt';
import { FormattedMessage } from 'utils/cl-intl';
import { removeUrlLocale } from 'utils/removeUrlLocale';

interface Props {
  method?: TVerificationMethod;
  last: boolean;
  grayBorder?: boolean;
  standardSSOBehavior?: boolean;
  onClick?: (method: TVerificationMethod) => void;
  onClickStandardSSO?: () => void;
}

const IdAustriaButton = ({
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
      window.location.href = `${AUTH_PATH}/${
        method?.attributes.name
      }?token=${jwt}&pathname=${removeUrlLocale(window.location.pathname)}`;
    }
  };

  return (
    <VerificationMethodButton
      id="e2e-id-austria-button"
      icon="idaustria"
      last={last}
      onClick={handleOnClick}
      borderColor={grayBorder ? colors.grey500 : undefined}
    >
      <FormattedMessage {...messages.verifyIdAustria} />
    </VerificationMethodButton>
  );
};

export default IdAustriaButton;
