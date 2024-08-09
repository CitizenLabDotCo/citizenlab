import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import { PermittedBy } from 'api/phase_permissions/types';
import useVerificationMethodVerifiedActions from 'api/verification_methods/useVerificationMethodVerifiedActions';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import Block from './Block';
import Edge from './Edge';
import messages from './messages';
import { getReturnedFieldsPreview } from './utils';

interface Props {
  permittedBy: PermittedBy;
  permissionsCustomFields: IPermissionsCustomFieldData[];
}

const Blocks = ({ permittedBy, permissionsCustomFields }: Props) => {
  const { data: verificationMethod } = useVerificationMethodVerifiedActions();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const showCustomFields = permissionsCustomFields.length > 0;

  const verificationMethodMetadata =
    verificationMethod?.data.attributes.action_metadata;
  const verificationMethodName = verificationMethodMetadata?.name;

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
        <Edge />
        <Block number={2} text={formatMessage(messages.confirmYourEmail)} />
        {showCustomFields && (
          <>
            <Edge />
            <Block
              number={3}
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
        <Edge />
        <Block number={2} text={formatMessage(messages.confirmYourEmail)} />
        {showCustomFields && (
          <>
            <Edge />
            <Block
              number={3}
              text={formatMessage(messages.completeTheExtraQuestionsBelow)}
            />
          </>
        )}
      </>
    );
  }

  if (permittedBy === 'verified') {
    const authenticateMessage = formatMessage(
      messages.authenticateWithVerificationProvider,
      {
        verificationMethod: verificationMethodName ?? '',
      }
    );

    const verifiedFieldsMessage = formatMessage(messages.verifiedFields);
    const returnedFieldsPreview = getReturnedFieldsPreview(
      verificationMethodMetadata,
      localize
    );

    return (
      <>
        <Block
          number={1}
          text={
            <>
              {authenticateMessage}
              <br />
              <Box mt="12px">
                {verifiedFieldsMessage}
                <br />
                <b>{returnedFieldsPreview}</b>
              </Box>
            </>
          }
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
