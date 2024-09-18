import React from 'react';

import { Title, Accordion } from '@citizenlab/cl2-component-library';

import { IGlobalPermissionData } from 'api/permissions/types';
import useResetPermission from 'api/permissions/useResetPermission';
import useUpdatePermission from 'api/permissions/useUpdatePermission';

import { getPermissionActionSectionSubtitle } from 'containers/Admin/projects/project/permissions/Phase/ActionForms/utils';

import ActionForm from 'components/admin/ActionForm';

import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  permissions: IGlobalPermissionData[];
}

const ActionForms = ({ permissions }: Props) => {
  const { mutateAsync: updatePermission } = useUpdatePermission();
  const { mutate: resetPermission } = useResetPermission();

  return (
    <>
      {permissions.map((permission) => {
        const permissionAction = permission.attributes.action;

        return (
          <Accordion
            className={`e2e-action-accordion-${permissionAction}`}
            key={permission.id}
            timeoutMilliseconds={1000}
            transitionHeightPx={1700}
            isOpenByDefault={false}
            title={
              <Title
                variant="h3"
                color="primary"
                my="20px"
                style={{ fontWeight: 500 }}
              >
                <FormattedMessage
                  {...getPermissionActionSectionSubtitle({
                    permissionAction,
                    postType: 'initiative',
                  })}
                />
              </Title>
            }
          >
            <ActionForm
              permissionData={permission}
              onChange={async ({
                permitted_by,
                group_ids,
                verification_expiry,
                access_denied_explanation_multiloc,
              }) => {
                await updatePermission({
                  id: permission.id,
                  action: permission.attributes.action,
                  permitted_by,
                  group_ids,
                  verification_expiry,
                  access_denied_explanation_multiloc,
                });
              }}
              onReset={() =>
                resetPermission({
                  action: permissionAction,
                  permissionId: permission.id,
                })
              }
            />
          </Accordion>
        );
      })}
    </>
  );
};

export default ActionForms;
