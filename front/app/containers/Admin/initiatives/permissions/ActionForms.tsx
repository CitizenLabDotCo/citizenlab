import React from 'react';

import { IGlobalPermissionData } from 'api/permissions/types';

import { HandlePermissionChangeProps } from 'containers/Admin/projects/project/permissions/components/PhasePermissions/typings';

interface Props {
  permissions: IGlobalPermissionData[];
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
}

const ActionForms = ({ permissions: _permissions }: Props) => {
  return <></>;
};

export default ActionForms;
