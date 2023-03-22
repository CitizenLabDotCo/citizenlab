const seatsKeys = {
  all: () => [{ type: 'seats' }],
  items: () => [{ ...seatsKeys.all()[0], operation: 'item' }],
};

export default seatsKeys;
