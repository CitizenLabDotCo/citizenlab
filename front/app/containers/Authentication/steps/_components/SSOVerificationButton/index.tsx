import React from 'react';

import {
  TVerificationMethod,
  TVerificationMethodName,
} from 'api/verification_methods/types';

import { AUTH_PATH } from 'containers/App/constants';

import VerificationMethodButton from 'components/UI/VerificationMethodButton';

import { getJwt } from 'utils/auth/jwt';
import { removeUrlLocale } from 'utils/removeUrlLocale';
import { colors, IconNames } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import { MessageDescriptor } from 'react-intl';
import messages from './messages';

interface Props {
  last: boolean;
  verificationMethodName?: TVerificationMethodName; // TODO: JS - tidy up the fact we have both here
  verificationMethod?: TVerificationMethod;
  grayBorder?: boolean;
  standardSSOBehavior?: boolean;
  onClick?: (method: TVerificationMethod) => void;
  onClickStandardSSO?: () => void;
}

const SSOVerificationButton = ({
  verificationMethodName,
  verificationMethod,
  last,
  grayBorder,
  standardSSOBehavior,
  onClick,
  onClickStandardSSO,
}: Props) => {
  const methodName =
    verificationMethodName || verificationMethod?.attributes.name;
  if (!methodName) return null;

  const handleOnClick = () => {
    if (verificationMethod && onClick) {
      onClick(verificationMethod);
    }

    if (standardSSOBehavior) {
      onClickStandardSSO?.();
    } else {
      const jwt = getJwt();
      window.location.href = `${AUTH_PATH}/${
        verificationMethod?.attributes.name
      }?token=${jwt}&pathname=${removeUrlLocale(window.location.pathname)}`;
    }
  };

  const buttonLabelMessages: {
    [methodName in TVerificationMethodName]?: MessageDescriptor;
  } = {
    id_austria: messages.verifyIdAustria,
    criipto: messages.verifyMitId,
    nemlog_in: messages.verifyMitId,
    fake_sso: messages.verifyFakeSSO,
  };

  const icons: {
    [methodName in TVerificationMethodName]?: IconNames;
  } = {
    id_austria: 'idaustria',
    criipto: 'mitid',
    nemlog_in: 'mitid',
    fake_sso: 'bullseye',
  };

  return (
    <VerificationMethodButton
      id={`e2e-${methodName}-verification-button`}
      icon={icons[methodName]}
      last={last}
      onClick={handleOnClick}
      borderColor={grayBorder ? colors.grey500 : undefined}
    >
      <FormattedMessage {...buttonLabelMessages[methodName]} />
    </VerificationMethodButton>
  );
};

export default SSOVerificationButton;
