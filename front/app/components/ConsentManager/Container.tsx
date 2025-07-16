import React from 'react';

import Banner from './Banner';
import { TCategory } from './destinations';
import PreferencesModal from './PreferencesModal';
import { CategorizedDestinations, IPreferences } from './typings';

interface Props {
  preferences: IPreferences;
  categorizedDestinations: CategorizedDestinations;
  updatePreference: (category: TCategory, value: boolean) => void;
  accept: () => void;
  reject: () => void;
  openDialog: () => void;
  closeDialog: () => void;
  isDialogOpen: boolean;
  handleCancel: () => void;
  handleSave: () => void;
}

const Container = ({
  preferences,
  categorizedDestinations,
  updatePreference,
  accept,
  reject,
  openDialog,
  closeDialog,
  isDialogOpen,
  handleCancel,
  handleSave,
}: Props) => {
  return (
    <>
      <Banner
        onAccept={accept}
        onChangePreferences={openDialog}
        onClose={reject}
      />
      <PreferencesModal
        opened={isDialogOpen}
        categorizedDestinations={categorizedDestinations}
        preferences={preferences}
        handleCancel={handleCancel}
        handleSave={handleSave}
        onClose={closeDialog}
        updatePreference={updatePreference}
      />
    </>
  );
};

export default Container;
