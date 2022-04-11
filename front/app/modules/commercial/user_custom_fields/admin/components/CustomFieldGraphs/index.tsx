// libraries
import React from 'react';

// components
import CustomFieldGraph from './CustomFieldGraph';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useUserCustomFields from '../../../hooks/useUserCustomFields';

// typings
import { ParticipationMethod } from 'services/participationContexts';
import { IProjectData } from 'services/projects';

interface Props {
  startAt: string;
  endAt: string;
  participationMethods: ParticipationMethod[];
  project: IProjectData;
}

const CustomFieldGraphs = ({
  participationMethods,
  // startAt,
  // endAt,
  project,
}: Props) => {
  const userCustomFields = useUserCustomFields({
    inputTypes: ['select', 'multiselect', 'checkbox', 'number'],
  });

  if (
    participationMethods !== ['information'] &&
    !isNilOrError(userCustomFields)
  ) {
    return (
      <>
        {userCustomFields.map(
          (customField) =>
            // only show enabled fields, only supported number field is birthyear.
            customField.attributes.enabled &&
            (customField.attributes.input_type === 'number'
              ? customField.attributes.code === 'birthyear'
              : true) && (
              <CustomFieldGraph
                customField={customField}
                currentProject={project.id}
                key={customField.id}
              />
            )
        )}
      </>
    );
  }

  return null;
};

export default CustomFieldGraphs;
