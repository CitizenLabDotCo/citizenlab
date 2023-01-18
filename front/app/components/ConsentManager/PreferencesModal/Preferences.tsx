import React from 'react';

// components
import CategoryCard from './CategoryCard';
import ContentContainer from './ContentContainer';

// typings
import { CategorizedDestinations, IPreferences } from '../typings';
import { TCategory } from '../destinations';

interface Props {
  onChange: (category: TCategory, value: boolean) => void;
  categoryDestinations: CategorizedDestinations;
  preferences: IPreferences;
}

const doNothing = () => {};

const Preferences = ({
  categoryDestinations,
  preferences,
  onChange,
}: Props) => {
  return (
    <ContentContainer id="e2e-preference-dialog">
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
      <CategoryCard
        key={'required'}
        category={'required'}
        destinations={[]}
        checked={true}
        onChange={doNothing}
        disableUncheck={true}
      />
    </ContentContainer>
  );
};

export default Preferences;
