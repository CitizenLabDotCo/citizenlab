import React, { useState } from 'react';

// intl
import messages from './messages';

// components
import {
  Title,
  Text,
  Button,
  Box,
  colors,
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
import { isBuiltInField } from 'services/userCustomFields';

type UserFieldSelectionProps = {
  permission: IPermissionData;
};

const UserFieldSelection = ({ permission }: UserFieldSelectionProps) => {
  console.log('permission', permission);
  const registrationFieldList = useUserCustomFields();
  const locale = useLocale();
  const [showSelectionModal, setShowSelectionModal] = useState(false);

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
      <Box display="flex">
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
              registrationFieldList.map((field) => (
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
                    <Button bgColor={colors.primary}>
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
