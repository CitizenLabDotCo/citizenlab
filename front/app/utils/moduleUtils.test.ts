import { insertConfiguration } from 'utils/moduleUtils';

jest.mock('components/UI/PageLoading', () => ({
  PageLoading: 'PageLoading',
}));

describe('insertConfiguration', () => {
  const initialTabsWithScratch = [
    {
      name: 'scratch',
      label: 'scratch label',
      icon: 'blank-paper',
    },
  ];
  const templateItemToInsert = {
    name: 'template',
    label: 'template label',
    icon: 'template',
  };

  describe('insertBeforeName', () => {
    it('inserts the configuration before item when specified', () => {
      const module = {
        configuration: templateItemToInsert,
        insertBeforeName: 'scratch',
      };
      const result = insertConfiguration(module)(initialTabsWithScratch);

      expect(result).toEqual([
        {
          name: 'template',
          label: 'template label',
          icon: 'template',
        },
        {
          name: 'scratch',
          label: 'scratch label',
          icon: 'blank-paper',
        },
      ]);
    });

    it('returns correct order when item is already in correct order', () => {
      const module = {
        configuration: templateItemToInsert,
        insertBeforeName: 'scratch',
      };
      const result = insertConfiguration(module)([
        templateItemToInsert,
        ...initialTabsWithScratch,
      ]);

      expect(result).toEqual([
        {
          name: 'template',
          label: 'template label',
          icon: 'template',
        },
        {
          name: 'scratch',
          label: 'scratch label',
          icon: 'blank-paper',
        },
      ]);
    });
  });
});
