export const convertToGeoJson = jest.fn().mockImplementation(() => Promise.resolve({ type: 'point', coordinates: ['coor', 'dinates'] }));
