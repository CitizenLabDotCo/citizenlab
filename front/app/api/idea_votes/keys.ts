const ideaVotesKeys = {
  all: () => [{ type: 'vote', variant: 'idea' }],
  items: () => [{ ...ideaVotesKeys.all()[0], operation: 'item' }],
  item: (id?: string) => [{ ...ideaVotesKeys.items()[0], id }],
};

export default ideaVotesKeys;
