import React from 'react';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import { PermittedBy } from 'api/phase_permissions/types';

import { useIntl } from 'utils/cl-intl';

import { getNumberOfVerificationLockedItems } from '../../utils';

import Block from './Block';
import Edge from './Edge';
import messages from './messages';
import VerificationBlock from './VerificationBlock';

interface Props {
  permittedBy: PermittedBy;
  permissionsCustomFields: IPermissionsPhaseCustomFieldData[];
  verificationEnabled: boolean;
  userFieldsInForm: boolean | null;
}

const Blocks = ({
  permittedBy,
  permissionsCustomFields,
  verificationEnabled,
  userFieldsInForm,
}: Props) => {
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

  return (
    <>
      <Block number={1} text={formatMessage(messages.enterYourEmail)} />
      <Edge />
      <Block number={2} text={formatMessage(messages.confirmYourEmail)} />
      <Edge />
      <Block
        number={3}
        text={formatMessage(messages.enterNameLastNameAndPassword)}
      />
      {verificationEnabled && (
        <>
          <Edge />
          <VerificationBlock number={4} />
        </>
      )}
      {showCustomFields && !userFieldsInForm && (
        <>
          <Edge />
          <Block
            number={4 + Number(verificationEnabled)}
            text={formatMessage(
              messages.completeTheDemographicQuestionsAbove
            )}
          />
        </>
      )}
    </>
  );
};

export default Blocks;
