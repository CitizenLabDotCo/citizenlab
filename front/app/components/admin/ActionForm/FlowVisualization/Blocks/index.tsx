import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import { PermittedBy } from 'api/phase_permissions/types';
import useVerificationMethodVerifiedActions from 'api/verification_methods/useVerificationMethodVerifiedActions';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { getNumberOfVerificationLockedItems } from '../../utils';

import { Block, SSOBlock } from './Block';
import Edge from './Edge';
import messages from './messages';
import SSOConfigModal from './SSOConfigModal';
import {
  getReturnedFieldsPreview,
  enabledSteps,
  getVerificationFrequencyExplanation,
} from './utils';

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
  const { data: verificationMethod } = useVerificationMethodVerifiedActions();
  const emailConfirmationEnabled = useFeatureFlag({
    name: 'user_confirmation',
  });
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [modalOpen, setModalOpen] = useState(false);

  const numberOfVerificatiomLockedItems = getNumberOfVerificationLockedItems(
    permissionsCustomFields
  );

  const showCustomFields =
    permissionsCustomFields.length > numberOfVerificatiomLockedItems;

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
        {emailConfirmationEnabled && (
          <>
            <Edge />
            <Block number={2} text={formatMessage(messages.confirmYourEmail)} />
          </>
        )}
        {verificationEnabled && (
          <>
            <Edge />
            <Block
              number={2 + enabledSteps(emailConfirmationEnabled)}
              text={formatMessage(messages.identityVerification)}
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
            <Block
              number={2 + enabledSteps(emailConfirmationEnabled)}
              text={formatMessage(messages.identityVerification)}
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

  if (permittedBy === 'verified' && verificationMethodMetadata) {
    const authenticateMessage = formatMessage(
      messages.authenticateWithVerificationProvider,
      {
        verificationMethod: verificationMethodMetadata.name,
      }
    );

    const verifiedFieldsMessage = formatMessage(messages.verifiedFields);

    const verificationFrequencyExplanation =
      getVerificationFrequencyExplanation(verificationExpiry, formatMessage);

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
              {verificationFrequencyExplanation && (
                <>
                  <Text fontSize="xs" mt="8px" color="primary">
                    {verificationFrequencyExplanation}
                  </Text>
                </>
              )}
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
            verificationExpiry={verificationExpiry}
            verificationMethodMetadata={verificationMethodMetadata}
            onChangeVerificationExpiry={onChangeVerificationExpiry}
          />
        )}
      </>
    );
  }

  // Unreachable
  return null;
};

export default Blocks;
