import React from 'react';

import { Text, Icon, colors } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { SetError, State } from '../../typings';
import TextButton from '../_components/TextButton';

import messages from './messages';
import PoliciesForm, { FormValues } from './PoliciesForm';

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
  onAccept: (
    phone: string,
    locale: string,
    smsManualCampaignConsent: boolean,
    claimTokens?: string[]
  ) => void;
  goBack: () => void;
}

const PhonePolicies = ({
  state,
  loading,
  setError,
  onAccept,
  goBack,
}: Props) => {
  const locale = useLocale();
  const localize = useLocalize();
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const { phone } = state;
  const orgName = localize(
    appConfiguration?.data.attributes.settings.core.organization_name
  );

  if (phone === null) return null;

  const handleSubmit = async ({ smsManualCampaignConsent }: FormValues) => {
    try {
      await onAccept(
        phone,
        locale,
        smsManualCampaignConsent,
        state.claimTokens ?? undefined
      );
    } catch (e) {
      setError('account_creation_failed');
    }
  };

  return (
    <>
      <Text mt="0px" mb="28px">
        <Icon
          width="20px"
          height="20px"
          name="user-circle"
          fill={colors.textSecondary}
          mr="8px"
          transform="translate(0,-1)"
        />
        <FormattedMessage
          {...messages.createANewAccountWithPhone}
          values={{
            phone: <strong>{phone}</strong>,
            changeLink: (
              <>
                {'('}
                <TextButton onClick={goBack}>
                  {formatMessage(messages.change)}
                </TextButton>
                {')'}
              </>
            ),
          }}
        />
      </Text>
      <PoliciesForm
        loading={loading}
        showSmsManualCampaignConsent
        byContinuingMessage={messages.byContinuingPhone2}
        byContinuingValues={{ orgName }}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default PhonePolicies;
