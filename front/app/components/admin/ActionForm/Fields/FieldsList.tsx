import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { Action } from 'api/permissions/types';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';
import useReorderPermissionsPhaseCustomField from 'api/permissions_phase_custom_fields/useReorderPermissionsPhaseCustomField';
import { PermittedBy } from 'api/phase_permissions/types';

import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';

import { FormattedMessage } from 'utils/cl-intl';

import { getNumberOfVerificationLockedItems } from '../utils';

import CustomField from './CustomField';
import messages from './messages';

interface Props {
  userFieldsInForm: boolean;
  permitted_by: PermittedBy;
  phaseId?: string;
  action: Action;
}

const FieldsList = ({ phaseId, action }: Props) => {
  const { data: permissionFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });

  const { mutate: reorderPermissionsCustomField } =
    useReorderPermissionsPhaseCustomField({ phaseId, action });

  if (!permissionFields) {
    return null;
  }

  if (permissionFields.data.length === 0) {
    return (
      <Text mb="24px" mt="0">
        <FormattedMessage {...messages.noDemographicQuestionsYet} />
      </Text>
    );
  }

  // Hack to ignore the first verification-locked custom fields without breaking ordering.
  // It would be better to not return them from the BE at all and adjust the way the ordering is done.
  // Hopefully we can do that later.
  const numberOfVerificatiomLockedItems = getNumberOfVerificationLockedItems(
    permissionFields.data
  );

  if (permissionFields.data.length === numberOfVerificatiomLockedItems) {
    return (
      <Text mb="24px" mt="0">
        <FormattedMessage {...messages.noDemographicQuestions} />
      </Text>
    );
  }

  return (
    <>
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {permissionFields && (
        <SortableList
          items={permissionFields.data}
          lockFirstNItems={numberOfVerificatiomLockedItems}
          onReorder={(permissionFieldId, newOrder) => {
            const permissionsCustomField = permissionFields.data.find(
              (field) => field.id === permissionFieldId
            );

            if (!permissionsCustomField) return;

            // This 'persisted' attribute is used to determine whether
            // this field is 'real' and actually exists in our database.
            // By default, we get back a bunch of 'fake' fields from the API,
            // and only when we edit something for the first time will
            // we get the 'real' persisted ones.
            //
            // So on the first edit, when persisted is still false,
            // we also need to send the permission_id
            // and the custom_field_id, so that the backend can create
            // the 'real' persisted field.
            if (permissionsCustomField.attributes.persisted) {
              reorderPermissionsCustomField({
                id: permissionFieldId,
                ordering: newOrder,
              });
            } else {
              reorderPermissionsCustomField({
                id: permissionFieldId,
                permission_id:
                  permissionsCustomField.relationships.permission.data.id,
                custom_field_id:
                  permissionsCustomField.relationships.custom_field.data.id,
                ordering: newOrder,
              });
            }
          }}
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            <>
              {itemsList.map(
                (field: IPermissionsPhaseCustomFieldData, index: number) => {
                  return (
                    <SortableRow
                      key={field.id}
                      id={field.id}
                      index={index}
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                      isLastItem={index === itemsList.length - 1}
                      disableNestedStyles
                    >
                      <Box ml="20px" w="100%">
                        <CustomField
                          key={field.id}
                          field={field}
                          phaseId={phaseId}
                          action={action}
                        />
                      </Box>
                    </SortableRow>
                  );
                }
              )}
            </>
          )}
        </SortableList>
      )}
    </>
  );
};

export default FieldsList;
