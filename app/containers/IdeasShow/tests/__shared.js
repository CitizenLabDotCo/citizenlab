// utility functions shared by different test files within the same container

export const generateResourcesVoteValue = (id, allUp, allDown) => {
  let mode;
  if (allUp) {
    mode = 'up';
  } else if (allDown) {
    mode = 'down';
  } else {
    mode = (id % 2 === 0 ? 'up' : 'down');
  }

  return {
    data: {
      id,
      attributes: { mode },
      relationships: {},
    },
  };
};
