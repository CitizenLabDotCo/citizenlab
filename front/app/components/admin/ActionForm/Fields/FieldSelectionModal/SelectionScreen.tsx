import React from 'react';

import {
  Box,
  Text,
  Button,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import { isBuiltInField } from 'api/user_custom_fields/util';

import useLocale from 'hooks/useLocale';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

type SelectionScreenProps = {
  selectedFields: Array<IPermissionsPhaseCustomFieldData> | undefined;
  registrationFieldList: Array<IUserCustomFieldData> | null | undefined;
  handleAddField: (fields: IUserCustomFieldData) => void;
  setShowAddFieldPage: (show: boolean) => void;
  isLoading: boolean;
};

export const SelectionScreen = ({
  registrationFieldList,
  selectedFields,
  handleAddField,
  setShowAddFieldPage,
  isLoading,
}: SelectionScreenProps) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();

  const selectedFieldIds = new Set(
    selectedFields // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ?.map((field) => field.relationships.custom_field.data?.id) // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      .filter((id) => id !== null) as string[]
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
                    <FormattedMessage {...messages.defaultQuestion} />
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
      <Tooltip
        zIndex={9999999}
        disabled={userIsAdmin}
        theme="dark"
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
      </Tooltip>
    </>
  );
};
