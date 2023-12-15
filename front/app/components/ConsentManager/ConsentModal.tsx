import React, { FormEvent } from 'react';

// styling
import styled from 'styled-components';

// components
import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import {
  Box,
  Text,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import Preferences from './Preferences/Preferences';
import { CategorizedDestinations, IPreferences } from './typings';
import { TCategory } from 'components/ConsentManager/destinations';
import Footer from './Preferences/Footer';
import ContentContainer from './Preferences/ContentContainer';

const StyledLink = styled(Link)`
  text-decoration: underline;

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

interface Props {
  onAccept: () => void;
  onClose: () => void;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  categorizedDestinations: CategorizedDestinations;
  updatePreference: (category: TCategory, value: boolean) => void;
  preferences: IPreferences;
  handleCancelBack: () => void;
  handleCancelConfirm: () => void;
  handleCancel: () => void;
  handleSave: (e: FormEvent) => void;
  mode: 'preferenceForm' | 'noDestinations' | 'cancelling';
  isCancelling: boolean;
  view: 'main' | 'preferences';
  setView: (view: 'main' | 'preferences') => void;
}

const ConsentModal = ({
  onAccept,
  onClose,
  showModal,
  categorizedDestinations,
  updatePreference,
  preferences,
  mode,
  isCancelling,
  handleCancelBack,
  handleCancelConfirm,
  handleCancel,
  handleSave,
  view,
  setView,
}: Props) => {
  const isPhoneOrSmaller = useBreakpoint('phone');

  return (
    <Modal
      opened={showModal}
      header={
        view === 'main' ? (
          <Box mt="8px">
            <FormattedMessage {...messages.cookiesModalTitle} />
          </Box>
        ) : (
          <Box mt="8px">
            <FormattedMessage {...messages.title} />
          </Box>
        )
      }
      closeOnClickOutside={false}
      close={onClose}
      footer={
        view === 'preferences' ? (
          <Footer
            mode={mode}
            handleCancelBack={handleCancelBack}
            handleCancelConfirm={handleCancelConfirm}
            handleCancel={handleCancel}
            handleSave={handleSave}
          />
        ) : undefined
      }
    >
      <Box
        padding={view === 'main' ? '32px' : '4px'}
        tabIndex={0}
        role="dialog"
        id="e2e-cookie-modal"
      >
        {view === 'main' && (
          <>
            <Text mt="0px">
              <FormattedMessage
                {...messages.mainText}
                values={{
                  policyLink: (
                    <StyledLink to="/pages/cookie-policy">
                      <FormattedMessage {...messages.policyLink} />
                    </StyledLink>
                  ),
                }}
              />{' '}
              <FormattedMessage {...messages.subText} />
            </Text>
            <Box
              display="flex"
              gap="12px"
              flexDirection={isPhoneOrSmaller ? 'column' : 'row'}
              justifyContent="center"
              mt="40px"
            >
              <Button className="e2e-accept-cookies-btn" onClick={onAccept}>
                <FormattedMessage {...messages.accept} />
              </Button>
              <Button
                className="e2e-reject-all-cookie-banner"
                onClick={onClose}
              >
                <FormattedMessage {...messages.rejectAll} />
              </Button>
              <Button
                className="integration-open-modal"
                buttonStyle="text"
                onClick={() => setView('preferences')}
                p="0px"
              >
                <FormattedMessage {...messages.manage} />
              </Button>
            </Box>
          </>
        )}

        {view === 'preferences' && (
          <>
            {!isCancelling ? (
              <Preferences
                onChange={updatePreference}
                categoryDestinations={categorizedDestinations}
                preferences={preferences}
              />
            ) : (
              <ContentContainer role="dialog" aria-modal>
                <Title variant="h5" as="h1">
                  <FormattedMessage {...messages.confirmation} />
                </Title>
              </ContentContainer>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ConsentModal;
