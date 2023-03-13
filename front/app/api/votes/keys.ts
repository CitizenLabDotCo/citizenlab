const votesKeys = {
  all: () => [{ type: 'vote' }],
  items: () => [{ ...votesKeys.all()[0], operation: 'item' }],
  item: (id?: string) => [{ ...votesKeys.items()[0], id }],
};

export default votesKeys;
