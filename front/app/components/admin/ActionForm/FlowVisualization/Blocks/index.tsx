import React from 'react';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import { PermittedBy } from 'api/phase_permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import { getNumberOfVerificationLockedItems } from '../../utils';

import Block from './Block';
import Edge from './Edge';
import messages from './messages';
import SSOBlock from './SSOBlock';
import { enabledSteps } from './utils';
import VerificationBlock from './VerificationBlock';

interface Props {
  permittedBy: PermittedBy;
  permissionsCustomFields: IPermissionsPhaseCustomFieldData[];
  verificationEnabled: boolean;
  verificationExpiry: number | null;
  onChangeVerificationExpiry: (value: number | null) => void;
  userFieldsInForm: boolean | null;
}

const Blocks = ({
  permittedBy,
  permissionsCustomFields,
  verificationEnabled,
  verificationExpiry,
  onChangeVerificationExpiry,
  userFieldsInForm,
}: Props) => {
  const emailConfirmationEnabled = useFeatureFlag({
    name: 'user_confirmation',
  });
  const { formatMessage } = useIntl();

  const numberOfVerificationLockedItems = getNumberOfVerificationLockedItems(
    permissionsCustomFields
  );

  const showCustomFields =
    permissionsCustomFields.length > numberOfVerificationLockedItems;

  if (permittedBy === 'admins_moderators') return null;

  if (permittedBy === 'everyone') {
    return (
      <>
        <Block number={1} text={formatMessage(messages.noActionsAreRequired)} />
      </>
    );
  }

  if (permittedBy === 'everyone_confirmed_email') {
    return (
      <>
        <Block number={1} text={formatMessage(messages.enterYourEmail)} />
        {emailConfirmationEnabled && (
          <>
            <Edge />
            <Block number={2} text={formatMessage(messages.confirmYourEmail)} />
          </>
        )}
        {verificationEnabled && (
          <>
            <Edge />
            <VerificationBlock
              number={2 + enabledSteps(emailConfirmationEnabled)}
            />
          </>
        )}
        {showCustomFields && userFieldsInForm === false && (
          <>
            <Edge />
            <Block
              number={
                2 + enabledSteps(emailConfirmationEnabled, verificationEnabled)
              }
              text={formatMessage(
                messages.completeTheDemographicQuestionsAbove
              )}
            />
          </>
        )}
      </>
    );
  }

  if (permittedBy === 'users') {
    return (
      <>
        <Block number={1} text={formatMessage(messages.enterYourEmail)} />
        {emailConfirmationEnabled && (
          <>
            <Edge />
            <Block number={2} text={formatMessage(messages.confirmYourEmail)} />
          </>
        )}
        <Edge />
        <Block
          number={3}
          text={formatMessage(messages.enterNameLastNameAndPassword)}
        />
        {verificationEnabled && (
          <>
            <Edge />
            <VerificationBlock
              number={3 + enabledSteps(emailConfirmationEnabled)}
            />
          </>
        )}
        {showCustomFields && !userFieldsInForm && (
          <>
            <Edge />
            <Block
              number={
                3 + enabledSteps(emailConfirmationEnabled, verificationEnabled)
              }
              text={formatMessage(
                messages.completeTheDemographicQuestionsAbove
              )}
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <SSOBlock
        verificationExpiry={verificationExpiry}
        onChangeVerificationExpiry={onChangeVerificationExpiry}
      />
      {showCustomFields && !userFieldsInForm && (
        <>
          <Edge />
          <Block
            number={2}
            text={formatMessage(messages.completeTheDemographicQuestionsAbove)}
          />
        </>
      )}
    </>
  );
};

export default Blocks;
