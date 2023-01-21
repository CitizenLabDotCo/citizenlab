const mockUser = {
  data: {
    id: 'userId',
  },
};

jest.mock('hooks/useAuthUser', () => {
  return () => mockUser;
});

describe('NotificationMenu', () => {
  it('');
});
