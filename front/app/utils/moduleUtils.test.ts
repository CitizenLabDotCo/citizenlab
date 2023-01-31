import { insertConfiguration } from 'utils/moduleUtils';

jest.mock('components/UI/PageLoading', () => ({
  PageLoading: 'PageLoading',
}));

describe('insertConfiguration', () => {
  const scratchItem = {
    name: 'scratch',
    label: 'scratch label',
    icon: 'blank-paper',
  };
  const projectItem = {
    name: 'project',
    label: 'project label',
    icon: 'project',
  };
  const templateItem = {
    name: 'template',
    label: 'template label',
    icon: 'template',
  };

  describe('insertBeforeName', () => {
    it('inserts the configuration before item when specified', () => {
      const module = {
        configuration: templateItem,
        insertBeforeName: 'scratch',
      };
      const result = insertConfiguration(module)([scratchItem]);

      expect(result).toEqual([templateItem, scratchItem]);
    });

    it('returns correct order when item is already in correct order', () => {
      const module = {
        configuration: templateItem,
        insertBeforeName: 'scratch',
      };
      const result = insertConfiguration(module)([templateItem, scratchItem]);

      expect(result).toEqual([templateItem, scratchItem]);
    });

    it('returns correct order when item is present but in the wrong order', () => {
      const module = {
        configuration: templateItem,
        insertBeforeName: 'scratch',
      };
      const result = insertConfiguration(module)([scratchItem, templateItem]);

      expect(result).toEqual([templateItem, scratchItem]);
    });

    it('returns correct order when item is present but in the wrong order even with many elements', () => {
      const module = {
        configuration: templateItem,
        insertBeforeName: 'scratch',
      };
      const result = insertConfiguration(module)([
        scratchItem,
        projectItem,
        templateItem,
      ]);

      expect(result).toEqual([templateItem, scratchItem, projectItem]);
    });
  });

  describe('insertAfterName', () => {
    it('inserts the configuration after item when specified', () => {
      const module = {
        configuration: templateItem,
        insertAfterName: 'scratch',
      };
      const result = insertConfiguration(module)([scratchItem]);

      expect(result).toEqual([scratchItem, templateItem]);
    });

    it('returns correct order when item is already in correct order after', () => {
      const module = {
        configuration: templateItem,
        insertAfterName: 'scratch',
      };
      const result = insertConfiguration(module)([scratchItem, templateItem]);

      expect(result).toEqual([scratchItem, templateItem]);
    });

    it('returns correct order when item is present but in the wrong order after', () => {
      const module = {
        configuration: templateItem,
        insertAfterName: 'scratch',
      };
      const result = insertConfiguration(module)([templateItem, scratchItem]);

      expect(result).toEqual([scratchItem, templateItem]);
    });

    it('returns correct order when item is present but in the wrong order even with many elements', () => {
      const module = {
        configuration: templateItem,
        insertAfterName: 'scratch',
      };
      const result = insertConfiguration(module)([
        templateItem,
        projectItem,
        scratchItem,
      ]);

      expect(result).toEqual([projectItem, scratchItem, templateItem]);
    });
  });
});
