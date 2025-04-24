import React from 'react';

import { colors, IconNames } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import {
  TVerificationMethod,
  TVerificationMethodName,
} from 'api/verification_methods/types';

import { AUTH_PATH } from 'containers/App/constants';

import VerificationMethodButton from 'components/UI/VerificationMethodButton';

import { getJwt } from 'utils/auth/jwt';
import { FormattedMessage } from 'utils/cl-intl';
import { removeUrlLocale } from 'utils/removeUrlLocale';

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

  const verificationButtonConfigs: {
    [methodName in TVerificationMethodName]?: {
      label: MessageDescriptor;
      icon: IconNames;
    };
  } = {
    id_austria: {
      label: messages.verifyIdAustria,
      icon: 'idaustria',
    },
    criipto: {
      label: messages.verifyMitId,
      icon: 'mitid',
    },
    nemlog_in: {
      label: messages.verifyMitId,
      icon: 'mitid',
    },
    fake_sso: {
      label: messages.verifyFakeSSO,
      icon: 'bullseye',
    },
    keycloak: {
      label: messages.verifyKeycloak,
      icon: 'idporten',
    },
    twoday: {
      label: messages.verifyTwoday,
      icon: 'bankId',
    },
    auth0: {
      label: messages.verifyAuth0,
      icon: 'shield-check',
    },
    bosa_fas: {
      label: messages.verifyBosaFas,
      icon: 'shield-check',
    },
  };

  const buttonConfig = verificationButtonConfigs[methodName];
  if (!buttonConfig) return null;

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
      }?token=${jwt}&verification_pathname=${removeUrlLocale(
        window.location.pathname
      )}`;
    }
  };

  return (
    <VerificationMethodButton
      id={`e2e-${methodName}-verification-button`}
      icon={buttonConfig.icon}
      last={last}
      onClick={handleOnClick}
      borderColor={grayBorder ? colors.grey500 : undefined}
    >
      <FormattedMessage {...buttonConfig.label} />
    </VerificationMethodButton>
  );
};

export default SSOVerificationButton;
