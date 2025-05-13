import React from 'react';

import { indices } from 'utils/helperUtils';
import { render, screen, fireEvent, waitFor, act } from 'utils/testUtils/rtl';

import Field from '.';

const mockAddReferenceDistribution = jest.fn();

jest.mock('api/reference_distribution/useAddReferenceDistribution', () => {
  return jest.fn(() => ({
    mutateAsync: mockAddReferenceDistribution,
  }));
});

const mockDeleteReferenceDistribution = jest.fn();

jest.mock('api/reference_distribution/useDeleteReferenceDistribution', () => {
  return jest.fn(() => ({
    mutateAsync: mockDeleteReferenceDistribution,
  }));
});

let mockCustomFieldOptions;

const selectCustomFieldOptions = [
  { id: 'option1', attributes: { title_multiloc: { en: 'Option 1' } } },
  { id: 'option2', attributes: { title_multiloc: { en: 'Option 2' } } },
  { id: 'option3', attributes: { title_multiloc: { en: 'Option 3' } } },
];
const birthyearCustomFieldOptions = [];

jest.mock('api/custom_field_options/useCustomFieldOptions', () => () => ({
  data: { data: mockCustomFieldOptions },
}));

let mockReferenceDistribution: any = {
  isFetchedReferenceDistributionData: true,
  referenceDataUploaded: false,
  referenceDistribution: null,
  remoteFormValues: undefined,
};

jest.mock(
  'api/reference_distribution/useReferenceDistributionData',
  () => () => mockReferenceDistribution
);

let mockUserCustomField;

const selectField = {
  id: 'custom_field_id',
  attributes: {
    input_type: 'select',
    key: null,
    code: null,
    title_multiloc: { en: 'Select field' },
  },
};

const birthyearField = {
  id: 'birthyear_field_id',
  attributes: {
    key: 'birthyear',
    code: 'birthyear',
    title_multiloc: { en: 'Age' },
  },
};

jest.mock('api/user_custom_fields/useUserCustomField', () => () => ({
  data: { data: mockUserCustomField },
}));

describe('<Field />', () => {
  describe('select field', () => {
    beforeEach(() => {
      mockUserCustomField = selectField;
      mockCustomFieldOptions = selectCustomFieldOptions;
    });

    it('renders', () => {
      render(<Field userCustomFieldId="field1" />);
      expect(screen.getByText('Select field')).toBeInTheDocument();
    });

    describe('no data yet', () => {
      beforeEach(() => {
        mockReferenceDistribution = {
          referenceDataUploaded: false,
          referenceDistribution: null,
          remoteFormValues: undefined,
          isFetchedReferenceDistributionData: true,
        };
      });

      it('saves entered population data', async () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Select field'));
        const populationInputs = container.querySelectorAll(
          '.option-population-input > input'
        );
        expect(populationInputs.length).toBe(3);

        indices(3).forEach((i) => {
          fireEvent.input(populationInputs[i], { target: { value: 100 } });
        });

        await act(async () => {
          fireEvent.click(
            screen.getByTestId('representativeness-field-save-button')
          );
        });

        expect(mockAddReferenceDistribution).toHaveBeenCalledTimes(1);
        expect(mockAddReferenceDistribution).toHaveBeenCalledWith({
          id: selectField.id,
          option1: 100,
          option2: 100,
          option3: 100,
        });
      });

      it('does not allow saving if form incomplete', async () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Select field'));
        const populationInputs = container.querySelectorAll(
          '.option-population-input > input'
        );
        expect(populationInputs.length).toBe(3);

        indices(2).forEach((i) => {
          fireEvent.input(populationInputs[i], { target: { value: 100 } });
        });

        await act(async () => {
          fireEvent.click(
            screen.getByTestId('representativeness-field-save-button')
          );
        });

        expect(mockAddReferenceDistribution).not.toHaveBeenCalled();
      });
    });

    describe('with saved data', () => {
      beforeEach(() => {
        mockReferenceDistribution = {
          isFetchedReferenceDistributionData: true,
          referenceDataUploaded: true,
          referenceDistribution: {
            type: 'categorical_distribution',
          },
          remoteFormValues: {
            option1: 100,
            option2: 100,
          },
        };
      });

      it('shows correct form values', () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Select field'));

        const toggles = container.querySelectorAll(
          '.representativeness-toggle > input'
        );
        expect(toggles[0]).toHaveAttribute('checked', '');
        expect(toggles[1]).toHaveAttribute('checked', '');
        expect(toggles[2]).not.toHaveAttribute('checked', '');

        const populationInputs = container.querySelectorAll(
          '.option-population-input > input'
        );
        expect(populationInputs.length).toBe(2);
        expect(populationInputs[0]).toHaveAttribute('value', '100');
        expect(populationInputs[1]).toHaveAttribute('value', '100');
      });

      it('allows replacing distribution', async () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Select field'));

        const toggles = container.querySelectorAll(
          '.representativeness-toggle > input'
        );
        fireEvent.click(toggles[2]);

        const populationInputs = container.querySelectorAll(
          '.option-population-input > input'
        );
        fireEvent.input(populationInputs[2], { target: { value: 200 } });

        await act(async () => {
          fireEvent.click(
            screen.getByTestId('representativeness-field-save-button')
          );
        });

        expect(mockAddReferenceDistribution).toHaveBeenCalledTimes(1);
        expect(mockAddReferenceDistribution).toHaveBeenCalledWith({
          id: selectField.id,
          option1: 100,
          option2: 100,
          option3: 200,
        });
      });

      it('allows deleting distribution', async () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Select field'));

        const toggles = container.querySelectorAll(
          '.representativeness-toggle > input'
        );
        fireEvent.click(toggles[0]);
        fireEvent.click(toggles[1]);

        await act(async () => {
          fireEvent.click(
            screen.getByTestId('representativeness-field-save-button')
          );
        });

        expect(mockDeleteReferenceDistribution).toHaveBeenCalledTimes(1);
        expect(mockDeleteReferenceDistribution).toHaveBeenCalledWith(
          selectField.id
        );
      });
    });
  });

  describe('birthyear field', () => {
    beforeEach(() => {
      mockUserCustomField = birthyearField;
      mockCustomFieldOptions = birthyearCustomFieldOptions;
    });

    it('renders', () => {
      render(<Field userCustomFieldId="field1" />);
      expect(
        screen.getByText('Age groups (Year of birth)')
      ).toBeInTheDocument();
    });

    describe('no data yet', () => {
      beforeEach(() => {
        mockReferenceDistribution = {
          isFetchedReferenceDistributionData: true,
          referenceDataUploaded: false,
          referenceDistribution: null,
          remoteFormValues: undefined,
        };
      });

      it("opens bin modal on click 'set age groups'", () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Age groups (Year of birth)'));
        fireEvent.click(screen.getByTestId('set-age-groups-button'));
        expect(
          container.querySelector('#e2e-modal-container')
        ).toBeInTheDocument();
      });

      it("sets default age groups on opening modal and clicking 'save'", () => {
        render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Age groups (Year of birth)'));
        fireEvent.click(screen.getByTestId('set-age-groups-button'));
        fireEvent.click(screen.getByTestId('bin-save-button'));

        expect(screen.getByText('18 - 24')).toBeInTheDocument();
        expect(screen.getByText('25 - 34')).toBeInTheDocument();
        expect(screen.getByText('35 - 44')).toBeInTheDocument();
        expect(screen.getByText('45 - 54')).toBeInTheDocument();
        expect(screen.getByText('55 - 64')).toBeInTheDocument();
        expect(screen.getByText('65 and over')).toBeInTheDocument();
      });

      it('saves entered population data', async () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Age groups (Year of birth)'));
        fireEvent.click(screen.getByTestId('set-age-groups-button'));
        fireEvent.click(screen.getByTestId('bin-save-button'));

        const populationInputs = container.querySelectorAll(
          '.option-population-input > input'
        );
        expect(populationInputs.length).toBe(6);

        indices(6).forEach((i) => {
          fireEvent.input(populationInputs[i], { target: { value: 100 } });
        });

        await act(async () => {
          fireEvent.click(
            screen.getByTestId('representativeness-field-save-button')
          );
        });

        expect(mockAddReferenceDistribution).toHaveBeenCalledTimes(1);
        expect(mockAddReferenceDistribution).toHaveBeenCalledWith({
          id: birthyearField.id,
          bins: [18, 25, 35, 45, 55, 65, null],
          counts: [100, 100, 100, 100, 100, 100],
        });
      });

      it('does not allow saving if form incomplete', async () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Age groups (Year of birth)'));
        fireEvent.click(screen.getByTestId('set-age-groups-button'));
        fireEvent.click(screen.getByTestId('bin-save-button'));

        const populationInputs = container.querySelectorAll(
          '.option-population-input > input'
        );
        expect(populationInputs.length).toBe(6);

        indices(5).forEach((i) => {
          fireEvent.input(populationInputs[i], { target: { value: 100 } });
        });

        await act(async () => {
          fireEvent.click(
            screen.getByTestId('representativeness-field-save-button')
          );
        });

        expect(mockAddReferenceDistribution).not.toHaveBeenCalled();
      });

      it.skip('clears correct filled out options after modifying bins', async () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Age groups (Year of birth)'));
        fireEvent.click(screen.getByTestId('set-age-groups-button'));
        fireEvent.click(screen.getByTestId('bin-save-button'));
        const populationInputs = container.querySelectorAll(
          '.option-population-input > input'
        );
        indices(6).forEach((i) => {
          fireEvent.input(populationInputs[i], { target: { value: 100 } });
        });
        indices(6).forEach((i) => {
          expect(populationInputs[i]).toHaveAttribute('value', '100');
        });

        fireEvent.click(screen.getByTestId('edit-age-groups-button'));
        const binInputs = container.querySelectorAll('.bin-input > input');
        fireEvent.input(binInputs[4], { target: { value: 37 } });
        fireEvent.blur(binInputs[4]);
        fireEvent.click(screen.getByTestId('bin-save-button'));

        const populationInputs2 = container.querySelectorAll(
          '.option-population-input > input'
        );

        await waitFor(() => {
          indices(6).forEach((i) => {
            expect(populationInputs2[i]).toHaveAttribute(
              'value',
              i === 1 || i === 2 ? '' : '100'
            );
          });
        });
      });
    });

    describe('with saved data', () => {
      beforeEach(() => {
        mockReferenceDistribution = {
          isFetchedReferenceDistributionData: true,
          referenceDataUploaded: true,
          referenceDistribution: {
            type: 'binned_distribution',
            attributes: {
              distribution: {
                bins: [18, 25, 35, 45, 65, null],
              },
            },
          },
          remoteFormValues: {
            '18 - 24': 100,
            '25 - 34': 100,
            '35 - 44': 100,
            '45 - 64': 100,
            '65+': 100,
          },
        };
      });

      it.skip('shows correct form values', async () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Age groups (Year of birth)'));

        const populationInputs = container.querySelectorAll(
          '.option-population-input > input'
        );

        await waitFor(() => {
          expect(populationInputs.length).toBe(5);
        });

        indices(5).forEach((i) => {
          expect(populationInputs[i]).toHaveAttribute('value', '100');
        });
      });

      it('allows replacing distribution', async () => {
        const { container } = render(<Field userCustomFieldId="field1" />);
        fireEvent.click(screen.getByText('Age groups (Year of birth)'));

        const populationInputs = container.querySelectorAll(
          '.option-population-input > input'
        );

        fireEvent.input(populationInputs[2], { target: { value: 200 } });

        await act(async () => {
          fireEvent.click(
            screen.getByTestId('representativeness-field-save-button')
          );
        });

        expect(mockAddReferenceDistribution).toHaveBeenCalledTimes(1);
        expect(mockAddReferenceDistribution).toHaveBeenCalledWith({
          id: birthyearField.id,
          bins: [18, 25, 35, 45, 65, null],
          counts: [100, 100, 200, 100, 100],
        });
      });
    });
  });
});
