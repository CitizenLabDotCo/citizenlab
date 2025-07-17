import React from 'react';

import {
  Box,
  Button,
  Text,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import ContentContainer from 'components/ContentContainer';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

interface Props {
  onAccept: () => void;
  onChangePreferences: () => void;
  onClose: () => void;
}

const CookieModal = ({ onAccept, onChangePreferences, onClose }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Modal
      opened
      close={onClose}
      closeOnClickOutside={false}
      hideCloseButton
      footer={
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          gap="8px"
        >
          <Button
            className="integration-open-modal"
            px="4px"
            buttonStyle="text"
            onClick={onChangePreferences}
          >
            <FormattedMessage {...messages.manage} />
          </Button>
          <Button buttonStyle="primary" onClick={onClose}>
            <FormattedMessage {...messages.reject} />
          </Button>
          <Button
            className="e2e-accept-cookies-btn"
            buttonStyle="primary"
            onClick={onAccept}
            autoFocus
          >
            <FormattedMessage {...messages.accept} />
          </Button>
        </Box>
      }
    >
      <ContentContainer id="e2e-cookie-banner">
        <Title fontSize={isSmallerThanPhone ? 'xl' : undefined}>
          <FormattedMessage {...messages.modalTitle} />
        </Title>
        <Text>
          <FormattedMessage
            {...messages.modalDescription}
            values={{
              policyLink: (
                <Link to="/pages/cookie-policy?from=cookie-modal">
                  <FormattedMessage {...messages.policyLink} />
                </Link>
              ),
            }}
          />
        </Text>
      </ContentContainer>
    </Modal>
  );
};

export default CookieModal;
