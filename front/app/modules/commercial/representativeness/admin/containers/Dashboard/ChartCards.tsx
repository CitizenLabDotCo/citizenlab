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

// fake data
import fakeData from './fakeData';

// TODO remove this later, generalize for all select fields
const onlyGender = ({ attributes: { code } }: IUserCustomFieldData) =>
  code === 'gender';

const ChartCards = () => {
  const customFields = useUserCustomFields({ inputTypes: ['select'] });
  if (isNilOrError(customFields)) return null;

  return (
    <>
      {customFields.filter(onlyGender).map((customField) => (
        <ChartCard
          customField={customField}
          key={customField.id}
          data={fakeData.gender.data}
          representativenessScore={fakeData.gender.representativenessScore}
          includedUserPercentage={fakeData.gender.includedUsersPercentage}
          demographicDataDate={fakeData.gender.demographicDataDate}
        />
      ))}

      <EmptyCard titleMultiloc={{ en: 'Test ' }} isComingSoon />
    </>
  );
};

export default ChartCards;
