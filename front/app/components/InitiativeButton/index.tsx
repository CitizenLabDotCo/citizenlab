import React from 'react';

import { ButtonStyles } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';

import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import Button from 'components/UI/Button';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

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
    clHistory.push(
      {
        pathname: `/initiatives/new`,
        search:
          lat && lng
            ? stringify({ lat, lng }, { addQueryPrefix: true })
            : undefined,
      },
      { scrollToTop: true }
    );
  };

  const onNewInitiativeButtonClick = (event?: React.FormEvent) => {
    event?.preventDefault();
    trackEventByName('New initiative button clicked', {
      extra: {
        disabledReason: initiativePermissions?.disabledReason,
        location,
      },
    });

    if (initiativePermissions?.enabled) {
      if (initiativePermissions?.authenticationRequirements) {
        const context = {
          type: 'initiative',
          action: 'posting_initiative',
        } as const;

        const successAction: SuccessAction = {
          name: 'redirectToInitiativeForm',
          params: { lat, lng },
        };

        trackEventByName(
          'Sign up/in modal opened in response to clicking new initiative'
        );
        triggerAuthenticationFlow({
          context,
          successAction,
        });
      } else {
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
