import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// services
import { IUserCustomFieldData } from 'services/userCustomFields';

// intl
import { SelectionScreen } from './screens/SelectionScreen';
import { AddFieldScreen } from './screens/AddFieldScreen';
import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../containers/Granular/messages';
import { generateTempId } from 'components/FormBuilder/components/FormBuilderSettings/utils';

type FieldSelectionModalProps = {
  showSelectionModal: boolean;
  setShowSelectionModal: (show: boolean) => void;
  selectedFields: Array<IPermissionsCustomFieldData> | undefined;
  handleAddField: (field: IUserCustomFieldData) => void;
  registrationFieldList: Array<IUserCustomFieldData> | null | undefined;
  locale: string;
  isLoading: boolean;
};

export const FieldSelectionModal = ({
  showSelectionModal,
  setShowSelectionModal,
  selectedFields,
  handleAddField,
  registrationFieldList,
  locale,
  isLoading,
}: FieldSelectionModalProps) => {
  const [showAddFieldPage, setShowAddFieldPage] = React.useState(false);
  const { formatMessage } = useIntl();

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
            locale={locale}
            handleAddField={handleAddField}
            isLoading={isLoading}
            setShowAddFieldPage={setShowAddFieldPage}
          />
        )}
      </Box>
    </Modal>
  );
};
