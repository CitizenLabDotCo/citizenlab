import React from 'react';

// Components
import CategoryCard from './CategoryCard';

// Typing
import { CategorizedDestinations, IPreferences } from '.';

// Styling
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';

// services
import { TCategory } from './destinations';

export const ContentContainer = styled.div`
  padding: 30px;
  background: white;

  h1 {
    font-size: ${fontSizes.medium}px;
  }

  h2 {
    font-size: ${fontSizes.large}px;
  }

  ${media.smallerThanMinTablet`
    margin: 0;
    padding: 20px;
  `}
`;

interface Props {
  onChange: (category: TCategory, value) => void;
  categoryDestinations: CategorizedDestinations;
  preferences: IPreferences;
}

const doNothing = () => () => {};

const PreferencesDialog = ({
  categoryDestinations,
  preferences,
  onChange,
}: Props) => {
  const handleChange = (category: TCategory, value: boolean) => (_event) => {
    onChange(category, value);
  };

  return (
    <ContentContainer id="e2e-preference-dialog">
      {Object.keys(categoryDestinations).map((category: TCategory) => {
        const preferenceForCategory = preferences[category];
        if (
          categoryDestinations[category].length > 0 &&
          typeof preferenceForCategory === 'boolean'
        ) {
          return (
            <CategoryCard
              key={category}
              category={category}
              destinations={categoryDestinations[category]}
              checked={preferenceForCategory}
              handleChange={handleChange}
            />
          );
        }
        return;
      })}
      <CategoryCard
        key={'required'}
        category={'required'}
        destinations={[]}
        checked={true}
        handleChange={doNothing}
        disableUncheck={true}
      />
    </ContentContainer>
  );
};

export default PreferencesDialog;
