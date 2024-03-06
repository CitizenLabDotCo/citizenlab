import { IIdeaData } from '../types';

import { ideaData } from './_mockServer';

export const getIdea = (id: string, enTitle?: string): IIdeaData => {
  return {
    ...ideaData[0],
    id,
    attributes: {
      ...ideaData[0].attributes,
      title_multiloc: { en: enTitle || 'Idea title' },
    },
  };
};
export default jest.fn(() => {
  return { data: { data: ideaData[0] } };
});
