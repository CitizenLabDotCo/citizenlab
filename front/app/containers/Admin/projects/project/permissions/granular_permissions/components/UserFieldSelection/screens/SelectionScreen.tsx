import React from 'react';

import { Box, Text, Button, colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import useAuthUser from 'api/me/useAuthUser';
import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import { isBuiltInField } from 'api/user_custom_fields/util';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

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
  const { formatMessage } = useIntl();
  const selectedFieldIds = new Set(
    selectedFields?.map((field) => field.relationships.custom_field.data.id)
  );
  const { data: authUser } = useAuthUser();
  const userIsAdmin = authUser && isAdmin(authUser);

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
      <Tippy
        zIndex={9999999}
        disabled={userIsAdmin}
        content={
          <Text my="8px" color="white" fontSize="s">
            {formatMessage(messages.onlyAdminsCreateQuestion)}
          </Text>
        }
      >
        <Box w="fit-content">
          <Button
            ml="20px"
            mb="20px"
            icon="plus-circle"
            buttonStyle="secondary-outlined"
            onClick={() => {
              setShowAddFieldPage(true);
            }}
            type="button"
            disabled={!userIsAdmin}
          >
            <FormattedMessage {...messages.createANewQuestion} />
          </Button>
        </Box>
      </Tippy>
    </>
  );
};
