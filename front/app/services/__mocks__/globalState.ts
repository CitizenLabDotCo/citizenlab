export const globalState = {
  init: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
  })),
};
