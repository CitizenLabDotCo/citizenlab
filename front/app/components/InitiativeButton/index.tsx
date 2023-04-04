import React from 'react';

// hooks
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import useOpenAuthModal from 'hooks/useOpenAuthModal';

import { trackEventByName } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';
import { openVerificationModal } from 'events/verificationModal';
import { FormattedMessage } from 'utils/cl-intl';
import Button from 'components/UI/Button';
import messages from './messages';
import { ButtonStyles } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';
import { SuccessAction } from 'containers/NewAuthModal/SuccessActions/actions';

interface Props {
  lat?: number | null;
  lng?: number | null;
  location: 'initiatives_footer' | 'initiatives_header' | 'in_map';
  buttonStyle?: ButtonStyles;
}

const InitiativeButton = ({ lat, lng, location, buttonStyle }: Props) => {
  const initiativePermissions = useInitiativesPermissions('posting_initiative');

  const redirectToInitiativeForm = () => {
    trackEventByName('redirected to initiatives form');
    clHistory.push({
      pathname: `/initiatives/new`,
      search:
        lat && lng
          ? stringify({ lat, lng }, { addQueryPrefix: true })
          : undefined,
    });
  };

  const openAuthModal = useOpenAuthModal();

  const onNewInitiativeButtonClick = (event?: React.FormEvent) => {
    event?.preventDefault();
    trackEventByName('New initiative button clicked', {
      extra: {
        disabledReason: initiativePermissions?.disabledReason,
        location,
      },
    });

    if (initiativePermissions?.enabled) {
      const context = {
        type: 'initiative',
        action: 'posting_initiative',
      } as const;

      const successAction: SuccessAction = {
        name: 'redirectToInitiativeForm',
        params: { lat, lng },
      };

      switch (initiativePermissions?.authenticationRequirements) {
        case 'sign_in_up':
          trackEventByName(
            'Sign up/in modal opened in response to clicking new initiative'
          );
          openAuthModal({
            flow: 'signup',
            verification: false,
            context,
            successAction,
          });
          break;
        case 'complete_registration':
          openAuthModal({ context, successAction });
          break;
        case 'sign_in_up_and_verify':
          trackEventByName(
            'Sign up/in modal opened in response to clicking new initiative'
          );
          openAuthModal({
            flow: 'signup',
            verification: true,
            context,
            successAction,
          });
          break;
        case 'verify':
          trackEventByName(
            'Verification modal opened in response to clicking new initiative'
          );
          openVerificationModal({ context });
          break;
        default:
          redirectToInitiativeForm();
      }
    }
  };

  return (
    <Button
      fontWeight="500"
      padding="13px 22px"
      buttonStyle={buttonStyle || 'primary'}
      onClick={onNewInitiativeButtonClick}
      icon="arrow-right"
      iconPos="right"
      disabled={!!initiativePermissions?.disabledReason}
      text={<FormattedMessage {...messages.startInitiative} />}
    />
  );
};

export default InitiativeButton;
