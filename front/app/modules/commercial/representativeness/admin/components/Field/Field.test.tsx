import React from 'react';
import Field from '.';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

jest.mock('services/appConfiguration');
jest.mock('services/locale');
jest.mock('hooks/useLocalize');
jest.mock('utils/cl-intl');

let mockUserCustomFieldOptions;
const selectUserCustomFieldOptions = [
  { id: 'option1', attributes: { title_multiloc: { en: 'Option 1' } } },
  { id: 'option2', attributes: { title_multiloc: { en: 'Option 2' } } },
  { id: 'option3', attributes: { title_multiloc: { en: 'Option 3' } } },
];
const birthyearUserCustomFieldOptions = [];

jest.mock(
  'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions',
  () => () => mockUserCustomFieldOptions
);

const mockReferenceDistribution = {
  referenceDataUploaded: false,
  referenceDistribution: null,
};

jest.mock(
  '../../hooks/useReferenceDistribution',
  () => () => mockReferenceDistribution
);

let mockUserCustomField;
const selectField = {
  attributes: {
    key: null,
    code: 'code',
    title_multiloc: { en: 'Select field' },
  },
};
const birthyearField = {
  attributes: {
    key: 'birthyear',
    code: 'birthyear',
    title_multiloc: { en: 'Age' },
  },
};

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

    it('renders', () => {
      render(<Field userCustomFieldId="field1" />);
      expect(screen.getByText('Select field')).toBeInTheDocument();
    });
  });

  describe('birthyear field', () => {
    beforeEach(() => {
      mockUserCustomField = birthyearField;
      mockUserCustomFieldOptions = birthyearUserCustomFieldOptions;
    });

    it('renders', () => {
      render(<Field userCustomFieldId="field1" />);
      expect(screen.getByText('Age')).toBeInTheDocument();
    });

    describe('no data yet', () => {
      it("opens bin modal on click 'set age groups'", () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Age'));
        fireEvent.click(screen.getByText('set age groups'));
        expect(
          container.querySelector('#e2e-modal-container')
        ).toBeInTheDocument();
      });

      it("sets default age groups on opening modal and clicking 'save'", () => {
        render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Age'));
        fireEvent.click(screen.getByText('set age groups'));
        fireEvent.click(screen.getByTestId('bin-save-button'));

        expect(screen.getByText('18-24')).toBeInTheDocument();
        expect(screen.getByText('25-34')).toBeInTheDocument();
        expect(screen.getByText('35-44')).toBeInTheDocument();
        expect(screen.getByText('45-54')).toBeInTheDocument();
        expect(screen.getByText('55-64')).toBeInTheDocument();
        expect(screen.getByText('65 and over')).toBeInTheDocument();
      });
    });
  });
});
