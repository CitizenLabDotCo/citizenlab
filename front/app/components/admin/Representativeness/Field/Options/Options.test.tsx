import React from 'react';

import { indices } from 'utils/helperUtils';
import { fireEvent, render, screen, waitFor } from 'utils/testUtils/rtl';

import Options from '.';

const generateOptions = (n: number) =>
  indices(n).map((i) => ({
    id: `_${i}`,
    attributes: { title_multiloc: { en: `option ${i}` } },
  }));

let mockOptions;

jest.mock('api/custom_field_options/useCustomFieldOptions', () => () => ({
  data: { data: mockOptions },
}));

let mockField;

const selectField = { attributes: { key: null } };

jest.mock('api/user_custom_fields/useUserCustomField', () => () => ({
  data: { data: mockField },
}));

describe('<Options />', () => {
  describe('select field', () => {
    beforeEach(() => {
      mockField = selectField;
    });

    it('renders options correctly (all empty)', () => {
      mockOptions = generateOptions(5);

      const formValues = {
        _0: null,
        _1: null,
        _3: null,
        _4: null,
      };

      const { container } = render(
        <Options
          userCustomFieldId="id"
          formValues={formValues}
          onUpdateEnabled={jest.fn()}
          onUpdatePopulation={jest.fn()}
          onEditBins={jest.fn()}
        />
      );

      indices(5).forEach((i) => {
        expect(screen.getByText(`option ${i}`)).toBeInTheDocument();
      });

      const toggles = screen.getAllByTestId('toggle');
      toggles.forEach((toggle: any, i) => {
        expect(toggle.checked).toBe(i !== 2);
      });

      const inputs = container.querySelectorAll('input[type="text"]');
      expect(inputs[0].value).toBe('');
      expect(inputs[1].value).toBe('');
      expect(inputs[2].value).toBe('');
      expect(inputs[3].value).toBe('');
    });

    it('renders options correctly (some empty)', () => {
      mockOptions = generateOptions(5);

      const formValues = {
        _0: 1000,
        _1: null,
        _3: 3000,
        _4: null,
      };

      const { container } = render(
        <Options
          userCustomFieldId="id"
          formValues={formValues}
          onUpdateEnabled={jest.fn()}
          onUpdatePopulation={jest.fn()}
          onEditBins={jest.fn()}
        />
      );

      const inputs = container.querySelectorAll('input[type="text"]');
      expect(inputs[0].value).toBe('1,000');
      expect(inputs[1].value).toBe('');
      expect(inputs[2].value).toBe('3,000');
      expect(inputs[3].value).toBe('');
    });

    it("displays 'see more' button if more than 12 options", () => {
      mockOptions = generateOptions(15);

      const formValues = {
        _0: 1000,
        _1: null,
        _3: 3000,
        _4: null,
      };

      render(
        <Options
          userCustomFieldId="id"
          formValues={formValues}
          onUpdateEnabled={jest.fn()}
          onUpdatePopulation={jest.fn()}
          onEditBins={jest.fn()}
        />
      );

      waitFor(() => {
        expect(
          screen.getByTestId('representativeness-see-more-button')
        ).toBeInTheDocument();
      });
    });

    it("shows all options on click 'see more'", () => {
      mockOptions = generateOptions(15);

      const formValues = {
        _0: 1000,
        _1: null,
        _3: 3000,
        _4: null,
      };

      const { rerender } = render(
        <Options
          userCustomFieldId="id"
          formValues={formValues}
          onUpdateEnabled={jest.fn()}
          onUpdatePopulation={jest.fn()}
          onEditBins={jest.fn()}
        />
      );

      indices(12).forEach((i) => {
        expect(screen.getByText(`option ${i}`)).toBeInTheDocument();
      });
      expect(screen.queryByText('option 12')).not.toBeInTheDocument();
      expect(screen.queryByText('option 13')).not.toBeInTheDocument();

      waitFor(() => {
        expect(
          screen.getByTestId('representativeness-see-more-button')
        ).toBeInTheDocument();
        fireEvent.click(
          screen.getByTestId('representativeness-see-more-button')
        );

        rerender(
          <Options
            userCustomFieldId="id"
            formValues={formValues}
            onUpdateEnabled={jest.fn()}
            onUpdatePopulation={jest.fn()}
            onEditBins={jest.fn()}
          />
        );

        indices(15).forEach((i) => {
          expect(screen.getByText(`option ${i}`)).toBeInTheDocument();
        });
      });
    });

    it('calls onUpdateEnabled on toggle', () => {
      mockOptions = generateOptions(5);

      const formValues = {
        _0: null,
        _1: null,
        _3: null,
        _4: null,
      };

      const onUpdateEnabled = jest.fn();

      render(
        <Options
          userCustomFieldId="id"
          formValues={formValues}
          onUpdateEnabled={onUpdateEnabled}
          onUpdatePopulation={jest.fn()}
          onEditBins={jest.fn()}
        />
      );

      const toggles = screen.getAllByTestId('toggle');
      fireEvent.click(toggles[2]);

      expect(onUpdateEnabled).toHaveBeenCalledTimes(1);
      expect(onUpdateEnabled).toHaveBeenCalledWith('_2', true);
    });

    it('calls onUpdatePopulation when changing population value', () => {
      mockOptions = generateOptions(5);

      const formValues = {
        _0: null,
        _1: null,
        _3: null,
        _4: null,
      };

      const onUpdatePopulation = jest.fn();

      const { container } = render(
        <Options
          userCustomFieldId="id"
          formValues={formValues}
          onUpdateEnabled={jest.fn()}
          onUpdatePopulation={onUpdatePopulation}
          onEditBins={jest.fn()}
        />
      );

      const inputs = container.querySelectorAll('input[type="text"]');
      fireEvent.input(inputs[0], { target: { value: '10,000' } });

      expect(onUpdatePopulation).toHaveBeenCalledTimes(1);
      expect(onUpdatePopulation).toHaveBeenCalledWith('_0', 10000);
    });
  });
});
