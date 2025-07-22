import React from 'react';

import {
  colors,
  Icon,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import CookieModalContentContainer from '../../CookieModalContentContainer';
import { TCategory } from '../../destinations';
import messages from '../../messages';
import { CategorizedDestinations, IPreferences } from '../../typings';
import CategoryCard from '../CategoryCard';

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
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <CookieModalContentContainer id="e2e-preference-dialog">
      <Icon name="cookie" fill={colors.primary} />
      <Title fontSize={isSmallerThanPhone ? 'xl' : undefined}>
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
    </CookieModalContentContainer>
  );
};

export default MainContent;
