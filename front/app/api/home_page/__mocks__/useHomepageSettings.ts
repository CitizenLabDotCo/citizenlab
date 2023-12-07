import { IHomepageSettingsData } from 'api/home_page/types';

export const mockHomepageSettingsData: IHomepageSettingsData = {
  id: '1',
  type: 'home_page',
  attributes: {
    craftjs_json: {},
  },
};

export default jest.fn(() => {
  return { data: { data: mockHomepageSettingsData } };
});
