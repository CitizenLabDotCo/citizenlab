import React from 'react';

// components
import {
  Box,
  Title,
  colors,
  Text,
  Button,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// services
import {
  IUserCustomFieldData,
  isBuiltInField,
} from 'services/userCustomFields';

// intl
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from '../../containers/Granular/messages';

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
  return (
    <Modal
      opened={showSelectionModal}
      close={() => {
        setShowSelectionModal(false);
      }}
    >
      <Box display="flex" flexDirection="column" width="100%">
        <Box mb="20px">
          <Title variant="h3" color="primary">
            <FormattedMessage {...messages.addQuestion} />
          </Title>
          {registrationFieldList &&
            registrationFieldList
              .filter((field) => !selectedFields.includes(field))
              .map((field) => (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  key={field.id}
                  py="4px"
                  borderTop="solid"
                  borderWidth="1px"
                  borderColor={colors.grey300}
                >
                  <Text color="primary">
                    {field.attributes.title_multiloc[locale]}
                  </Text>
                  <Box display="flex">
                    {isBuiltInField(field) && (
                      <Text color="primary" fontSize="s" mr="20px" my="auto">
                        <FormattedMessage {...messages.defaultField} />
                      </Text>
                    )}
                    <Button
                      bgColor={colors.primary}
                      onClick={() => {
                        setSelectedFields(selectedFields.concat([field]));
                      }}
                    >
                      <FormattedMessage {...messages.select} />
                    </Button>
                  </Box>
                </Box>
              ))}
        </Box>
        <Box display="flex">
          <Button icon="plus-circle" buttonStyle="secondary">
            <FormattedMessage {...messages.createNewQuestion} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
