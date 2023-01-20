import React, { FormEvent } from 'react';

// components
import Modal from 'components/UI/Modal';
import Footer from './Footer';
import Preferences from './Preferences';
import ContentContainer from './ContentContainer';
import { Title } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { TCategory } from '../destinations';
import { CategorizedDestinations, IPreferences } from '../typings';

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
          <Title variant="h5" as="h1">
            <FormattedMessage {...messages.confirmation} />
          </Title>
        </ContentContainer>
      )}
    </Modal>
  );
};

export default PreferencesModal;
