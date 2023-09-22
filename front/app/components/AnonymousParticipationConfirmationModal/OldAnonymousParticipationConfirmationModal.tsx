import React from 'react';
// components
import {
  Box,
  Title,
  Text,
  Icon,
  colors,
  Button,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';
// intl
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

type Props = {
  onCloseModal: () => void;
  onConfirmAnonymousParticipation: () => void;
};

// This needs to be

const OldAnonymousParticipationConfirmationModal = ({
  onCloseModal,
  onConfirmAnonymousParticipation,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal width="460px" opened close={onCloseModal}>
      <Box
        display="flex"
        height="64px"
        width="64px"
        borderRadius="100%"
        background={colors.successLight}
      >
        <Icon
          width="32px"
          height="32px"
          m="auto"
          fill={colors.success}
          name="shield-checkered"
        />
      </Box>
      <Box display="flex" flexDirection="column" width="100%">
        <Box mb="40px">
          <Title variant="h4" color="tenantText">
            {formatMessage(messages.participateAnonymously)}
          </Title>
          <Text color="tenantText" fontSize="s">
            <FormattedMessage
              values={{
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
              }}
              {...messages.participateAnonymouslyModalText}
            />
          </Text>
          <Text color="tenantText" fontSize="s">
            <FormattedMessage
              {...messages.participateAnonymouslyModalTextSection2}
            />
          </Text>
          <Warning
            text={
              <Text color="primary" m="0px" fontSize="s">
                {formatMessage(messages.anonymousParticipationWarning)}
              </Text>
            }
          />
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          gap="16px"
        >
          <Button
            width="100%"
            buttonStyle="secondary-outlined"
            onClick={onCloseModal}
          >
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            id="e2e-continue-anonymous-participation-btn"
            width="100%"
            onClick={onConfirmAnonymousParticipation}
          >
            {formatMessage(messages.continue)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

/** @deprecated Use AnonymousParticipationConfirmationModal instead.
 * This requires decoupling the "anonymous check" from the posting flow.
 * See the usage of AnonymousParticipationConfirmationModal for more info.
 */
export default OldAnonymousParticipationConfirmationModal;
