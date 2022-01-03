export function makeStatus(id) {
  return {
    id,
    type: 'idea_status',
    attributes: {
      title_multiloc: { en: 'Just a status' },
      color: 'blue',
      code: id,
      ordering: 0,
      description_multiloc: { en: 'The status of an idea that has a status' },
    },
  };
}

export const mockIdeaStatusData = {
  id: 'MockIdeaStatusId',
  type: 'idea_status',
  attributes: {
    title_multiloc: 'A mock idea status title',
    description_multiloc: 'A mock idea status description',
    color: '#687782',
    code: 'proposed',
    ordering: 100,
  },
};
