import { colors, IconNames } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';
import { DefaultTheme } from 'styled-components';

import { FrontOfficeSort } from 'api/ideas/types';

import messages from '../messages';

export const getButtonBackgroundColor = (
  isSelected: boolean,
  isHovered: boolean,
  theme: DefaultTheme
) => {
  if (isSelected) {
    return theme.colors.tenantPrimary;
  } else if (isHovered) {
    return theme.colors.grey100;
  }
  return colors.white;
};

export const getLabelForSortingOption = (
  sortType: FrontOfficeSort
): MessageDescriptor => {
  switch (sortType) {
    case 'trending':
      return messages.trending;
    case 'random':
      return messages.random;
    case 'popular':
      return messages.popular;
    case 'new':
      return messages.newest;
    case '-new':
      return messages.oldest;
  }
};

export const getIconNameForSortingOption = (
  sortType: FrontOfficeSort
): IconNames => {
  switch (sortType) {
    case 'trending':
      return 'trendingUp';
    case 'random':
      return 'random';
    case 'popular':
      return 'rocket';
    case 'new':
      return 'new';
    case '-new':
      return 'archive';
  }
};
