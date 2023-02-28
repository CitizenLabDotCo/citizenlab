const ideasKeys = {
  all: () => [{ type: 'idea_status' }],
  lists: () => [{ ...ideasKeys.all()[0], operation: 'list' }],
  items: () => [{ ...ideasKeys.all()[0], operation: 'item' }],
  item: (id: string) => [
    {
      ...ideasKeys.items()[0],
      id,
    },
  ],
} as const;

export default ideasKeys;
