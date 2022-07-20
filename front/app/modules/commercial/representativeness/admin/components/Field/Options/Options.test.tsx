import React from 'react';
import Options from '.';
import { fireEvent, render, screen, waitFor } from 'utils/testUtils/rtl';
import { indices } from 'utils/helperUtils';

jest.mock('services/appConfiguration');
jest.mock('hooks/useLocalize');
jest.mock('utils/cl-intl');

const generateOptions = (n: number) =>
  indices(n).map((i) => ({
    id: `_${i}`,
    attributes: { title_multiloc: { en: `option ${i}` } },
  }));

let mockOptions;

jest.mock(
  'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions',
  () => () => mockOptions
);

let mockField;

const selectField = { attributes: { key: null } };
const birthyearField = { attributes: { key: 'birthyear' } };

jest.mock(
  'modules/commercial/user_custom_fields/hooks/useUserCustomField',
  () => () => mockField
);

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
        expect(screen.getByText('See 3 more')).toBeInTheDocument();
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
        expect(screen.getByText('See 3 more')).toBeInTheDocument();
        fireEvent.click(screen.getByText('See 3 more'));

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

  describe('birthyear field', () => {
    beforeEach(() => {
      mockField = birthyearField;
    });

    it('TODO', () => {
      expect(2 + 2).toBe(4);
    });
  });
});
