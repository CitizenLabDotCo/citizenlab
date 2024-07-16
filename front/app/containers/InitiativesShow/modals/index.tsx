import React from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import SharingModalContent from 'components/PostShowComponents/SharingModalContent';
import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import useInitiativeReviewRequired from '../hooks/useInitiativeReviewRequired';
import messages from '../messages';

import InitiativeCreatedModalContent from './InitiativeCreatedModalContent';

interface Props {
  initiativeIdForSocialSharing: string | null;
  closeInitiativeSocialSharingModal: () => void;
}

const InitiativeModals = ({
  initiativeIdForSocialSharing,
  closeInitiativeSocialSharingModal,
}: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const initiativeReviewRequired = useInitiativeReviewRequired();
  const { formatMessage } = useIntl();

  if (!appConfiguration) return null;

  const initiativeSettings =
    appConfiguration.data.attributes.settings.initiatives;
  const reactingThreshold = initiativeSettings.reacting_threshold;
  const daysLimit = initiativeSettings.days_limit.toString();

  return (
    <Modal
      opened={!!initiativeIdForSocialSharing}
      close={closeInitiativeSocialSharingModal}
      hasSkipButton={true}
      skipText={<FormattedMessage {...messages.skipSharing} />}
    >
      {initiativeIdForSocialSharing &&
        (initiativeReviewRequired ? (
          <InitiativeCreatedModalContent />
        ) : (
          <SharingModalContent
            postType="initiative"
            postId={initiativeIdForSocialSharing}
            title={formatMessage(messages.shareTitle)}
            subtitle={formatMessage(messages.shareSubtitle, {
              votingThreshold: reactingThreshold,
              daysLimit,
            })}
          />
        ))}
    </Modal>
  );
};

export default InitiativeModals;
