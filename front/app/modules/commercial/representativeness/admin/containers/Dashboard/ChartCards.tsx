import React from 'react';

// hooks
import useUserCustomFields from 'modules/commercial/user_custom_fields/hooks/useUserCustomFields';

// components
import ChartCard from '../../components/ChartCard';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

// TODO remove this later, generalize for all select fields
const onlyGender = ({ attributes: { code } }: IUserCustomFieldData) =>
  code === 'gender';

const ChartCards = () => {
  const customFields = useUserCustomFields({ inputTypes: ['select'] });
  if (isNilOrError(customFields)) return null;

  return (
    <>
      {customFields.filter(onlyGender).map((customField) => (
        <ChartCard customField={customField} key={customField.id} />
      ))}
    </>
  );
};

export default ChartCards;
