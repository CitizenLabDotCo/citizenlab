import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import { TCategory } from '../destinations';
import messages from '../messages';
import { CategorizedDestinations, IPreferences } from '../typings';

import CategoryCard from './CategoryCard';
import ContentContainer from './ContentContainer';

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
      <Title>
        <FormattedMessage {...messages.title} />
      </Title>
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
