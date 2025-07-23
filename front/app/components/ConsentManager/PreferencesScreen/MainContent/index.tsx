import React from 'react';

import BaseMainContent from 'components/ConsentManager/BaseMainContent';

import { TCategory } from '../../destinations';
import { CategorizedDestinations, IPreferences } from '../../typings';

import CategoryCard from './CategoryCard';

interface Props {
  onChange: (category: TCategory, value: boolean) => void;
  categoryDestinations: CategorizedDestinations;
  preferences: IPreferences;
}

const doNothing = () => {};

const MainContent = ({
  categoryDestinations,
  preferences,
  onChange,
}: Props) => {
  return (
    <BaseMainContent id="e2e-preference-dialog">
      <CategoryCard
        key="functional"
        category="functional"
        destinations={[]}
        checked={true}
        onChange={doNothing}
        disableUncheck={true}
      />
      {Object.keys(categoryDestinations)
        .filter((category: TCategory) => {
          return categoryDestinations[category].length > 0;
        })
        .map((category: TCategory) => {
          return (
            <CategoryCard
              key={category}
              category={category}
              destinations={categoryDestinations[category]}
              checked={!!preferences[category]}
              onChange={onChange}
            />
          );
        })}
    </BaseMainContent>
  );
};

export default MainContent;
