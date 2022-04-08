// libraries
import React from 'react';

// components
import CustomFieldGraph from './CustomFieldGraph';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useUserCustomFields from '../../../hooks/useUserCustomFields';

const CustomFieldGraphs = ({
  participationMethods,
  startAt,
  endAt,
  project,
}) => {
  const userCustomFields = useUserCustomFields({
    inputTypes: ['select', 'multiselect', 'checkbox', 'number'],
  });

  return (
    participationMethods !== ['information'] &&
    startAt &&
    endAt &&
    !isNilOrError(userCustomFields) &&
    userCustomFields.map(
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
    )
  );
};

export default CustomFieldGraphs;
