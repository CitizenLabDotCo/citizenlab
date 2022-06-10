import React from 'react';

// hooks
import useUserCustomFields from 'modules/commercial/user_custom_fields/hooks/useUserCustomFields';

// components
import ChartCard from '../../components/ChartCard';
import EmptyCard from '../../components/ChartCard/EmptyCard';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

interface Props {
  projectFilter?: string;
}

const isSupported = ({ attributes }: IUserCustomFieldData) =>
  attributes.input_type === 'select';

const ChartCards = ({ projectFilter }: Props) => {
  const customFields = useUserCustomFields({ inputTypes: ['select'] });
  if (isNilOrError(customFields)) return null;

  return (
    <>
      {customFields.map((customField) => {
        if (isSupported(customField)) {
          return (
            <ChartCard
              customField={customField}
              key={customField.id}
              projectFilter={projectFilter}
            />
          );
        }

        return (
          <EmptyCard
            titleMultiloc={customField.attributes.title_multiloc}
            key={customField.id}
            isComingSoon
          />
        );
      })}
    </>
  );
};

export default ChartCards;
