// import React from 'react';
// import Field from '.';
// import { render } from 'utils/testUtils/rtl'

jest.mock('services/appConfiguration');
jest.mock('hooks/useLocalize');
jest.mock('utils/cl-intl');

let mockUserCustomFieldOptions;
const selectUserCustomFieldOptions = {
  id: 'field1',
  attributes: {},
};
jest.mock(
  'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions',
  () => () => mockUserCustomFieldOptions
);

let mockReferenceDistribution;
jest.mock(
  '../../hooks/useReferenceDistribution',
  () => () => mockReferenceDistribution
);

let mockUserCustomField;
const selectField = { attributes: { key: null } };
const birthyearField = { attributes: { key: 'birthyear' } };

jest.mock(
  'modules/commercial/user_custom_fields/hooks/useUserCustomField',
  () => () => mockUserCustomField
);

describe('<Field />', () => {
  describe('select field', () => {
    beforeEach(() => {
      mockUserCustomField = selectField;
      mockUserCustomFieldOptions = selectUserCustomFieldOptions;
    });
  });

  describe('birthyear field', () => {
    beforeEach(() => {
      mockUserCustomField = birthyearField;
    });
  });
});
