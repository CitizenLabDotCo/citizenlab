import React from 'react';

import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import ChartCard from 'components/admin/Representativeness/ChartCard';
import EmptyCard from 'components/admin/Representativeness/ChartCard/EmptyCard';

import { isShown, isSupported, sortUserCustomFields } from './utils';

interface Props {
  projectFilter?: string;
}

const ChartCards = ({ projectFilter }: Props) => {
  const { data: userCustomFields } = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });

  if (!userCustomFields) return null;

  const sortedUserCustomFields = sortUserCustomFields(
    userCustomFields.data.filter(isShown)
  );

  return (
    <>
      {sortedUserCustomFields.map((userCustomField) => {
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
