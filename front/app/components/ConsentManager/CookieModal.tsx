import React from 'react';

import {
  Box,
  Text,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

interface Props {
  onAccept: () => void;
  onChangePreferences: () => void;
  onClose: () => void;
}

const StyledModal = styled(Modal)`
  .modalcontent {
    margin-top: 200px;
  }
`;

const CookieModal = ({ onAccept, onChangePreferences, onClose }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <StyledModal
      opened={true}
      close={onClose}
      closeOnClickOutside={false}
      hideCloseButton
    >
      <Box id="e2e-cookie-banner">
        <Title fontSize={isSmallerThanPhone ? 'xl' : undefined}>
          <FormattedMessage {...messages.modalTitle} />
        </Title>
        <Text id="cookie-banner-title">
          <FormattedMessage
            {...messages.modalDescription}
            values={{
              policyLink: (
                <Link to="/pages/cookie-policy">
                  <FormattedMessage {...messages.policyLink} />
                </Link>
              ),
            }}
          />
        </Text>
        <Box display="flex" gap="8px" justifyContent="flex-end" mt="16px">
          <ButtonWithLink
            className="integration-open-modal"
            padding="0px"
            buttonStyle="text"
            onClick={onChangePreferences}
          >
            <FormattedMessage {...messages.manage} />
          </ButtonWithLink>
          <ButtonWithLink buttonStyle="primary" onClick={onClose}>
            <FormattedMessage {...messages.reject} />
          </ButtonWithLink>
          <ButtonWithLink
            className="e2e-accept-cookies-btn"
            buttonStyle="primary"
            onClick={onAccept}
            autoFocus
          >
            <FormattedMessage {...messages.accept} />
          </ButtonWithLink>
        </Box>
      </Box>
    </StyledModal>
  );
};

export default CookieModal;
