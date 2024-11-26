import { IconNames } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { IdeaSortMethod } from 'api/phases/types';

import messages from '../messages';

export const getLabelForSortingOption = (
  sortType: IdeaSortMethod
): MessageDescriptor => {
  switch (sortType) {
    case 'trending':
      return messages.trending;
    case 'comments_count':
      return messages.mostDiscussed;
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
  sortType: IdeaSortMethod
): IconNames => {
  switch (sortType) {
    case 'trending':
      return 'trendingUp';
    case 'comments_count':
      return 'comments';
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
