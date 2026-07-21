import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useLocale from 'hooks/useLocale';

import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { generateTempId } from 'utils/helperUtils';

import { AddFieldScreen } from './AddFieldScreen';
import messages from './messages';
import { SelectionScreen } from './SelectionScreen';

type FieldSelectionModalProps = {
  showSelectionModal: boolean;
  setShowSelectionModal: (show: boolean) => void;
  selectedFields: Array<IPermissionsPhaseCustomFieldData> | undefined;
  handleAddField: (field: IUserCustomFieldData) => void;
  isLoading: boolean;
};

const FieldSelectionModal = ({
  showSelectionModal,
  setShowSelectionModal,
  selectedFields,
  handleAddField,
  isLoading,
}: FieldSelectionModalProps) => {
  const locale = useLocale();
  const [showAddFieldPage, setShowAddFieldPage] = React.useState(false);
  const { data: globalRegistrationFields } = useUserCustomFields();
  const { formatMessage } = useIntl();

  const registrationFieldList = globalRegistrationFields?.data;

  const defaultFormValues = {
    options: [
      {
        temp_id: generateTempId(),
        title_multiloc: { [locale]: formatMessage(messages.option1) },
      },
    ],
  };

  return (
    <Modal
      opened={showSelectionModal}
      close={() => {
        setShowSelectionModal(false);
      }}
      niceHeader={true}
      header={
        <Title ml="20px" variant="h3" color="primary">
          <FormattedMessage
            {...(showAddFieldPage
              ? messages.createAQuestion
              : messages.addQuestion)}
          />
        </Title>
      }
      closeOnClickOutside={false}
      width={'550px'}
    >
      <Box display="flex" flexDirection="column">
        {showAddFieldPage && (
          <AddFieldScreen
            defaultValues={defaultFormValues}
            setShowAddFieldPage={setShowAddFieldPage}
          />
        )}
        {!showAddFieldPage && (
          <SelectionScreen
            selectedFields={selectedFields}
            registrationFieldList={registrationFieldList}
            handleAddField={handleAddField}
            isLoading={isLoading}
            setShowAddFieldPage={setShowAddFieldPage}
          />
        )}
      </Box>
    </Modal>
  );
};

export default FieldSelectionModal;
