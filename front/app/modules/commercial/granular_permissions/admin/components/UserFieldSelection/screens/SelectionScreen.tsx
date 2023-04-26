import React from 'react';

// components
import { Box, Text, Button, colors } from '@citizenlab/cl2-component-library';

// api
import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';

// services
import {
  isBuiltInField,
  IUserCustomFieldData,
} from 'services/userCustomFields';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../containers/Granular/messages';

type SelectionScreenProps = {
  selectedFields: Array<IPermissionsCustomFieldData> | undefined;
  registrationFieldList: Array<IUserCustomFieldData> | null | undefined;
  locale: string;
  handleAddField: (fields: IUserCustomFieldData) => void;
  setShowAddFieldPage: (show: boolean) => void;
  isLoading: boolean;
};

export const SelectionScreen = ({
  registrationFieldList,
  selectedFields,
  locale,
  handleAddField,
  setShowAddFieldPage,
  isLoading,
}: SelectionScreenProps) => {
  const selectedFieldIds = new Set(
    selectedFields?.map((field) => field.relationships.custom_field.data.id)
  );

  return (
    <>
      <Box mb="20px">
        {registrationFieldList
          ?.filter(({ id }) => !selectedFieldIds.has(id))
          .map((field, index) => (
            <Box
              display="flex"
              justifyContent="space-between"
              key={field.id}
              py="4px"
              borderTop={index > 0 ? 'solid' : 'none'}
              borderWidth="1px"
              borderColor={colors.grey300}
            >
              <Box display="flex" px="20px">
                <Text color="primary" mr="12px">
                  {field.attributes.title_multiloc[locale]}
                </Text>
              </Box>

              <Box display="flex">
                {isBuiltInField(field) && (
                  <Text color="primary" fontSize="s" mr="20px" my="auto">
                    <FormattedMessage {...messages.defaultField} />
                  </Text>
                )}
                <Button
                  mr="20px"
                  bgColor={colors.primary}
                  onClick={() => {
                    handleAddField(field);
                  }}
                  processing={isLoading}
                >
                  <FormattedMessage {...messages.select} />
                </Button>
              </Box>
            </Box>
          ))}
      </Box>
      <Box display="flex">
        <Button
          ml="20px"
          mb="20px"
          icon="plus-circle"
          buttonStyle="secondary"
          onClick={() => {
            setShowAddFieldPage(true);
          }}
          type="button"
        >
          <FormattedMessage {...messages.createANewQuestion} />
        </Button>
      </Box>
    </>
  );
};
