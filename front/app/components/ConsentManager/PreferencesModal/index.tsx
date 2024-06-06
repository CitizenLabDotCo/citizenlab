import React, { FormEvent } from 'react';

import { Title } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import { TCategory } from '../destinations';
import messages from '../messages';
import { CategorizedDestinations, IPreferences } from '../typings';

import ContentContainer from './ContentContainer';
import Footer from './Footer';
import Preferences from './Preferences';

interface Props {
  opened: boolean;
  mode: 'preferenceForm' | 'noDestinations' | 'cancelling';
  isCancelling: boolean;
  categorizedDestinations: CategorizedDestinations;
  preferences: IPreferences;
  onClose: () => void;
  handleCancelBack: () => void;
  handleCancelConfirm: () => void;
  handleCancel: () => void;
  handleSave: (e: FormEvent) => void;
  updatePreference: (category: TCategory, value: boolean) => void;
}

const PreferencesModal = ({
  opened,
  mode,
  isCancelling,
  categorizedDestinations,
  preferences,
  onClose,
  handleCancelBack,
  handleCancel,
  handleCancelConfirm,
  handleSave,
  updatePreference,
}: Props) => {
  return (
    <Modal
      opened={opened}
      close={onClose}
      header={<FormattedMessage {...messages.title} />}
      footer={
        <Footer
          mode={mode}
          handleCancelBack={handleCancelBack}
          handleCancelConfirm={handleCancelConfirm}
          handleCancel={handleCancel}
          handleSave={handleSave}
        />
      }
    >
      {!isCancelling ? (
        <Preferences
          onChange={updatePreference}
          categoryDestinations={categorizedDestinations}
          preferences={preferences}
        />
      ) : (
        <ContentContainer role="dialog" aria-modal>
          <Title styleVariant="h5" as="h1">
            <FormattedMessage {...messages.confirmation} />
          </Title>
        </ContentContainer>
      )}
    </Modal>
  );
};

export default PreferencesModal;
