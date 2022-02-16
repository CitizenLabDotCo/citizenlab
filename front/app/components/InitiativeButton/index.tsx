import React, { useCallback } from 'react';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import { trackEventByName } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';
import { FormattedMessage } from 'utils/cl-intl';
import Button from 'components/UI/Button';
import messages from './messages';
import { openSignUpInModal } from 'components/SignUpIn/events';
import { ButtonStyles } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';

interface Props {
  lat?: number | null;
  lng?: number | null;
  location: 'initiatives_footer' | 'initiatives_header' | 'in_map';
  buttonStyle?: ButtonStyles;
}

export default ({ lat, lng, location, buttonStyle }: Props) => {
  const { disabledReason, action, enabled } = useInitiativesPermissions(
    'posting_initiative'
  ) || { disabledReason: null, action: null, enabled: null };

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

  const onNewInitiativeButtonClick = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();

      trackEventByName('New initiative button clicked', {
        extra: {
          disabledReason,
          location,
        },
      });

      if (enabled) {
        switch (action) {
          case 'sign_in_up':
            trackEventByName(
              'Sign up/in modal opened in response to clicking new initiative'
            );
            openSignUpInModal({
              flow: 'signup',
              verification: false,
              verificationContext: undefined,
              action: redirectToInitiativeForm,
            });
            break;
          case 'sign_in_up_and_verify':
            trackEventByName(
              'Sign up/in modal opened in response to clicking new initiative'
            );
            openSignUpInModal({
              flow: 'signup',
              verification: true,
              verificationContext: {
                type: 'initiative',
                action: 'posting_initiative',
              },
              action: redirectToInitiativeForm,
            });
            break;
          case 'verify':
            trackEventByName(
              'Verification modal opened in response to clicking new initiative'
            );
            openVerificationModal({
              context: {
                action: 'posting_initiative',
                type: 'initiative',
              },
            });
            break;
          default:
            redirectToInitiativeForm();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, action, disabledReason, location]
  );

  return (
    <Button
      fontWeight="500"
      padding="13px 22px"
      buttonStyle={buttonStyle || 'primary'}
      onClick={onNewInitiativeButtonClick}
      icon="arrowLeft"
      iconPos="right"
      disabled={!!disabledReason}
      text={<FormattedMessage {...messages.startInitiative} />}
    />
  );
};
