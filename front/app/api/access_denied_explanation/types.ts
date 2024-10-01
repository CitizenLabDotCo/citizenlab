import { Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import accessDeniedExplanationKeys from './keys';

export type AccessDeniedExplanationKeys = Keys<
  typeof accessDeniedExplanationKeys
>;

export type AccessDeniedExplanationResponse = {
  data: {
    type: 'access_denied_explanation';
    attributes: {
      access_denied_explanation_multiloc: Multiloc;
    };
  };
};
