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

const onlyDomicile = ({ attributes: { code } }: IUserCustomFieldData) =>
  code === 'domicile';

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

      {customFields.filter(onlyDomicile).map((customField) => (
        <ChartCard
          customField={customField}
          key={customField.id}
          data={fakeData.domicile.data}
          representativenessScore={fakeData.domicile.representativenessScore}
          includedUserPercentage={fakeData.domicile.includedUsersPercentage}
          demographicDataDate={fakeData.domicile.demographicDataDate}
        />
      ))}

      <EmptyCard
        titleMultiloc={{ en: 'Favorite ice cream flavor' }}
        isComingSoon={false}
      />

      <EmptyCard titleMultiloc={{ en: 'Age group' }} isComingSoon />
    </>
  );
};

export default ChartCards;
