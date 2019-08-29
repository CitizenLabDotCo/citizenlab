export function makeStatus(id) {
  return {
    id,
    type: 'idea_status',
    attributes: {
      title_multiloc: { en: 'Just a status' },
      color: 'blue',
      code: id,
      ordering: 0,
      description_multiloc: { en: 'The status of an idea that has a status' }
    }
  };
}
