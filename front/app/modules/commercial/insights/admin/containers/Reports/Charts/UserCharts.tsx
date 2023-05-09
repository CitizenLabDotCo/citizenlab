// libraries
import React from 'react';
import { isEqual } from 'lodash-es';

// components
import CustomFieldGraph from './CustomFieldGraph';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useUserCustomFields from 'hooks/useUserCustomFields';

// typings
import { ParticipationMethod } from 'services/participationContexts';
import { IProjectData } from 'api/projects/types';
import {
  IUserCustomFieldData,
  IUserCustomFieldInputType,
} from 'services/userCustomFields';

interface Props {
  startAt: string;
  endAt: string;
  participationMethods: ParticipationMethod[];
  project: IProjectData;
}

const INPUT_TYPES: IUserCustomFieldInputType[] = [
  'select',
  'multiselect',
  'checkbox',
  'number',
];

const UserCharts = ({
  participationMethods,
  startAt,
  endAt,
  project,
}: Props) => {
  const userCustomFields = useUserCustomFields({
    inputTypes: INPUT_TYPES,
  });

  if (
    isEqual(participationMethods, ['information']) ||
    isNilOrError(userCustomFields)
  ) {
    return null;
  }

  return (
    <>
      {userCustomFields.filter(allowedField).map((customField) => (
        <CustomFieldGraph
          startAt={startAt}
          endAt={endAt}
          customField={customField}
          currentProject={project.id}
          key={customField.id}
        />
      ))}
    </>
  );
};

// Only show enabled fields, only supported number field is birthyear.
const allowedField = ({
  attributes: { enabled, input_type, code },
}: IUserCustomFieldData) => {
  if (!enabled) return false;

  if (input_type === 'number') {
    return code === 'birthyear';
  }

  return true;
};

export default UserCharts;
