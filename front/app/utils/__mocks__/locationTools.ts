export const geocode = jest
  .fn()
  .mockImplementation(() =>
    Promise.resolve({ type: 'point', coordinates: ['coor', 'dinates'] })
  );
