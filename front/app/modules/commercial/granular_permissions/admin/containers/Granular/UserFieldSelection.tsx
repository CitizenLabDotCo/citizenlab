import React, { useEffect, useState } from 'react';

// intl
import messages from './messages';

// components
import {
  Title,
  Text,
  Button,
  Box,
  colors,
  Toggle,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// utils
import { FormattedMessage } from 'utils/cl-intl';
import FormattedMessageComponent from 'utils/cl-intl/FormattedMessage';

// services
import { IPermissionData } from 'services/actionPermissions';
import useUserCustomFields from 'hooks/useUserCustomFields';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import {
  isBuiltInField,
  IUserCustomFieldData,
} from 'services/userCustomFields';

type UserFieldSelectionProps = {
  permission: IPermissionData;
};

const UserFieldSelection = ({ permission }: UserFieldSelectionProps) => {
  const registrationFieldList = useUserCustomFields();
  const locale = useLocale();
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState<
    Array<IUserCustomFieldData>
  >([]);

  useEffect(() => {
    // TODO: Update the actual permission once the BE is in place
    console.log('SELECTED FIELDS', selectedFields);
  }, [selectedFields]);

  if (isNilOrError(locale)) {
    return null;
  }

  return (
    <Box>
      <Title variant="h4" color="primary" style={{ fontWeight: 600 }}>
        <FormattedMessage {...messages.userQuestionTitle} />
      </Title>
      <Text fontSize="s" color="coolGrey600" pb="8px">
        <FormattedMessage {...messages.userFieldsSelectionDescription} />
      </Text>
      <Box>
        {selectedFields.map((field) => (
          <Box
            display="flex"
            justifyContent="space-between"
            key={field.id}
            py="0px"
            borderTop="solid"
            borderWidth="1px"
            borderColor={colors.grey300}
          >
            <Text color="primary">
              {field.attributes.title_multiloc[locale]}
            </Text>
            <Box display="flex">
              <Toggle
                checked={true}
                onChange={() => {}}
                label={
                  <Text color="primary" fontSize="s">
                    <FormattedMessage {...messages.required} />
                  </Text>
                }
              />
              <Button
                buttonStyle="text"
                icon="delete"
                onClick={() => {
                  setSelectedFields(
                    selectedFields.filter(
                      (selectedField) => selectedField.id !== field.id
                    )
                  );
                }}
              >
                <FormattedMessage {...messages.delete} />
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
      <Box display="flex" mt="12px">
        <Button
          icon="plus-circle"
          bgColor={colors.primary}
          onClick={() => {
            setShowSelectionModal(true);
          }}
        >
          <FormattedMessageComponent {...messages.addQuestion} />
        </Button>
      </Box>
      <Modal
        opened={showSelectionModal}
        close={() => {
          setShowSelectionModal(false);
        }}
      >
        <Box display="flex" flexDirection="column" width="100%">
          <Box mb="20px">
            <Title variant="h3" color="primary">
              <FormattedMessageComponent {...messages.addQuestion} />
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
    </Box>
  );
};

export default UserFieldSelection;
