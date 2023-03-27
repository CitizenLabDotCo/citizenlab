import { QueryParameters } from './types';

const ideaMarkersKeys = {
  all: () => [{ type: 'post_marker', variant: 'idea' }],
  lists: () => [{ ...ideaMarkersKeys.all()[0], operation: 'list' }],
  list: (queryParameters: QueryParameters) => [
    { ...ideaMarkersKeys.all()[0], operation: 'list', ...queryParameters },
  ],
};

export default ideaMarkersKeys;
