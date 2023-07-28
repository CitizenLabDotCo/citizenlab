import { IAPIClients } from '../types';

export const data: IAPIClients = {
  data: [
    {
      id: '1',
      type: 'api_client',
      attributes: {
        name: 'Test token',
        created_at: '2021-03-18T09:00:00.000Z',
        last_used_at: '2021-03-19T09:00:00.000Z',
        masked_secret: '*****',
      },
    },
  ],
};
export default jest.fn(() => {
  return { data: { data } };
});
