import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// services
import { IUserCustomFieldData } from 'services/userCustomFields';

// intl
import { SelectionScreen } from './screens/SelectionScreen';
import { AddFieldScreen } from './screens/AddFieldScreen';

type FieldSelectionModalProps = {
  showSelectionModal: boolean;
  setShowSelectionModal: (show: boolean) => void;
  selectedFields: Array<IUserCustomFieldData>;
  setSelectedFields: (fields: Array<IUserCustomFieldData>) => void;
  registrationFieldList: Array<IUserCustomFieldData> | null | undefined;
  locale: string;
};

export const FieldSelectionModal = ({
  showSelectionModal,
  setShowSelectionModal,
  selectedFields,
  setSelectedFields,
  registrationFieldList,
  locale,
}: FieldSelectionModalProps) => {
  const [showAddFieldPage, setShowAddFieldPage] = React.useState(false);
  return (
    <Modal
      opened={showSelectionModal}
      close={() => {
        setShowSelectionModal(false);
      }}
    >
      <Box display="flex" flexDirection="column" width="100%">
        {showAddFieldPage && (
          <AddFieldScreen setShowAddFieldPage={setShowAddFieldPage} />
        )}
        {!showAddFieldPage && (
          <SelectionScreen
            selectedFields={selectedFields}
            registrationFieldList={registrationFieldList}
            locale={locale}
            setSelectedFields={setSelectedFields}
            setShowAddFieldPage={setShowAddFieldPage}
          />
        )}
      </Box>
    </Modal>
  );
};
