const ideasKeys = {
  all: () => [{ type: 'idea' }],
  lists: () => [{ ...ideasKeys.all()[0], operation: 'list' }],
  items: () => [{ ...ideasKeys.all()[0], operation: 'item' }],
  item: (id: string) => [
    {
      ...ideasKeys.items()[0],
      id,
    },
  ],
};

export default ideasKeys;
