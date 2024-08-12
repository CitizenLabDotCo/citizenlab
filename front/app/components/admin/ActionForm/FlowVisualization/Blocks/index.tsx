import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import { PermittedBy } from 'api/phase_permissions/types';
import useVerificationMethodVerifiedActions from 'api/verification_methods/useVerificationMethodVerifiedActions';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { Block, SSOBlock } from './Block';
import Edge from './Edge';
import messages from './messages';
import SSOConfigModal from './SSOConfigModal';
import { getReturnedFieldsPreview } from './utils';

interface Props {
  permittedBy: PermittedBy;
  permissionsCustomFields: IPermissionsCustomFieldData[];
  verificationEnabled: boolean;
}

const Blocks = ({
  permittedBy,
  permissionsCustomFields,
  verificationEnabled,
}: Props) => {
  const { data: verificationMethod } = useVerificationMethodVerifiedActions();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [modalOpen, setModalOpen] = useState(false);

  const showCustomFields = permissionsCustomFields.length > 0;

  const verificationMethodMetadata =
    verificationMethod?.data.attributes.action_metadata;

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
        {verificationEnabled && (
          <>
            <Edge />
            <Block
              number={3}
              text={formatMessage(messages.identityVerification)}
            />
          </>
        )}
        {showCustomFields && (
          <>
            <Edge />
            <Block
              number={verificationEnabled ? 4 : 3}
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
        {verificationEnabled && (
          <>
            <Edge />
            <Block
              number={3}
              text={formatMessage(messages.identityVerification)}
            />
          </>
        )}
        {showCustomFields && (
          <>
            <Edge />
            <Block
              number={verificationEnabled ? 4 : 3}
              text={formatMessage(messages.completeTheExtraQuestionsBelow)}
            />
          </>
        )}
      </>
    );
  }

  if (permittedBy === 'verified' && verificationMethodMetadata) {
    const authenticateMessage = formatMessage(
      messages.authenticateWithVerificationProvider,
      {
        verificationMethod: verificationMethodMetadata.name,
      }
    );

    const verifiedFieldsMessage = formatMessage(messages.verifiedFields);
    const returnedFieldsPreview = getReturnedFieldsPreview(
      verificationMethodMetadata,
      localize
    );

    return (
      <>
        <SSOBlock
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
          onClick={() => setModalOpen(true)}
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
        {verificationMethodMetadata && (
          <SSOConfigModal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            verificationMethodMetadata={verificationMethodMetadata}
          />
        )}
      </>
    );
  }

  // Unreachable
  return null;
};

export default Blocks;
