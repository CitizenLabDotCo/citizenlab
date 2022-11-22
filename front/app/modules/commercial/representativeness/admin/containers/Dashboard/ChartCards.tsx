import React from 'react';

// hooks
import useUserCustomFields from 'hooks/useUserCustomFields';

// components
import ChartCard from '../../components/ChartCard';
import EmptyCard from '../../components/ChartCard/EmptyCard';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isShown, isSupported, sortUserCustomFields } from './utils';

interface Props {
  projectFilter?: string;
}

const ChartCards = ({ projectFilter }: Props) => {
  const userCustomFields = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });

  if (isNilOrError(userCustomFields)) return null;

  const sortedUserCustomFields = sortUserCustomFields(
    userCustomFields.filter(isShown)
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
