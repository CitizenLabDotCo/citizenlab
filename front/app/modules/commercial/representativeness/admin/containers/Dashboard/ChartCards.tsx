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

const isShown = ({
  attributes: { input_type, code },
}: IUserCustomFieldData) => {
  return input_type === 'select' || code === 'birthyear';
};

const isSupported = ({
  attributes: { input_type, code },
}: IUserCustomFieldData) => input_type === 'select' && code !== 'domicile';

const ChartCards = ({ projectFilter }: Props) => {
  const userCustomFields = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });
  if (isNilOrError(userCustomFields)) return null;

  return (
    <>
      {userCustomFields.filter(isShown).map((userCustomField) => {
        if (isSupported(userCustomField)) {
          return (
            <ChartCard
              userCustomField={userCustomField}
              key={userCustomField.id}
              projectFilter={projectFilter}
            />
          );
        }

        return (
          <EmptyCard
            titleMultiloc={userCustomField.attributes.title_multiloc}
            key={userCustomField.id}
            isComingSoon
          />
        );
      })}
    </>
  );
};

export default ChartCards;
