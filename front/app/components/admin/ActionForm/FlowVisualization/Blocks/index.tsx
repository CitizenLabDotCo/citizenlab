import React from 'react';

import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
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
  permissionsCustomFields: IPermissionsCustomFieldData[];
  verificationEnabled: boolean;
  verificationExpiry: number | null;
  onChangeVerificationExpiry: (value: number | null) => void;
}

const Blocks = ({
  permittedBy,
  permissionsCustomFields,
  verificationEnabled,
  verificationExpiry,
  onChangeVerificationExpiry,
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
        {showCustomFields && (
          <>
            <Edge />
            <Block
              number={
                2 + enabledSteps(emailConfirmationEnabled, verificationEnabled)
              }
              text={formatMessage(messages.completeTheExtraQuestionsBelow)}
            />
          </>
        )}
      </>
    );
  }

  if (permittedBy === 'users') {
    return (
      <>
        <Block
          number={1}
          text={formatMessage(messages.enterNameLastNameEmailAndPassword)}
        />
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
        {showCustomFields && (
          <>
            <Edge />
            <Block
              number={
                2 + enabledSteps(emailConfirmationEnabled, verificationEnabled)
              }
              text={formatMessage(messages.completeTheExtraQuestionsBelow)}
            />
          </>
        )}
      </>
    );
  }

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (permittedBy === 'verified') {
    return (
      <>
        <SSOBlock
          verificationExpiry={verificationExpiry}
          onChangeVerificationExpiry={onChangeVerificationExpiry}
        />
        {showCustomFields && (
          <>
            <Edge />
            <Block
              number={2}
              text={formatMessage(messages.completeTheExtraQuestionsBelow)}
            />
          </>
        )}
      </>
    );
  }

  // Unreachable
  return null;
};

export default Blocks;
