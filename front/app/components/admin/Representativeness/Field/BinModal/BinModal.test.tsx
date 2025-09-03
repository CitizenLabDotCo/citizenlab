import React from 'react';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import BinModal from '.';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (content) => content,
}));

const getElementById = document.getElementById.bind(document);
document.getElementById = (id, ...args) => {
  if (id === 'modal-portal') return true;
  return getElementById(id, ...args);
};

describe('<BinModal />', () => {
  describe('No initial bins', () => {
    it('renders', () => {
      const { container } = render(
        <BinModal open={true} onClose={jest.fn()} onSave={jest.fn()} />
      );

      expect(
        container.querySelector('#e2e-modal-container')
      ).toBeInTheDocument();
      const inputs = container.querySelectorAll('input');
      expect(inputs.length).toBe(12);
    });

    it('calls onSave with right data', () => {
      const onSave = jest.fn();

      const { container } = render(
        <BinModal open={true} onClose={jest.fn()} onSave={onSave} />
      );

      const inputs = container.querySelectorAll('input');
      fireEvent.input(inputs[4], { target: { value: 37 } });
      fireEvent.blur(inputs[4]);

      fireEvent.click(screen.getByTestId('bin-save-button'));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith([18, 25, 37, 45, 55, 65, null]);
    });

    it('calls onSave with right data (not blurring input, saving directly)', () => {
      const onSave = jest.fn();

      const { container } = render(
        <BinModal open={true} onClose={jest.fn()} onSave={onSave} />
      );

      const inputs = container.querySelectorAll('input');
      fireEvent.input(inputs[4], { target: { value: 37 } });

      fireEvent.click(screen.getByTestId('bin-save-button'));

      waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith([18, 25, 37, 45, 55, 65, null]);
      });
    });

    it('if upper bound is one highest than highest lower bound: works correctly', () => {
      const { container } = render(
        <BinModal open={true} onClose={jest.fn()} onSave={jest.fn()} />
      );

      fireEvent.click(screen.getByTestId('add-new-bin-button'));

      const inputs = container.querySelectorAll('input');
      fireEvent.input(inputs[12], { target: { value: 67 } });
      fireEvent.blur(inputs[12]);

      fireEvent.click(screen.getByTestId('remove-bin-button'));
      fireEvent.click(screen.getByTestId('add-new-bin-button'));

      const inputs2 = container.querySelectorAll('input');

      expect(inputs2[11]).toHaveValue(null);
      expect(inputs2[12]).toHaveValue(null);
    });
  });

  describe('With initial bins', () => {
    it('calls onSave if changes to bin data', () => {
      const bins = [18, 25, 33, 42, 57, 65, null];

      const onSave = jest.fn();

      const { container } = render(
        <BinModal bins={bins} open={true} onClose={jest.fn()} onSave={onSave} />
      );

      const inputs = container.querySelectorAll('input');
      fireEvent.input(inputs[4], { target: { value: 37 } });
      fireEvent.blur(inputs[4]);

      fireEvent.click(screen.getByTestId('bin-save-button'));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith([18, 25, 37, 42, 57, 65, null]);
    });

    it('does not call onSave if no changes to bin data', () => {
      const bins = [18, 25, 33, 42, 57, 65, null];

      const onSave = jest.fn();

      const { container } = render(
        <BinModal bins={bins} open={true} onClose={jest.fn()} onSave={onSave} />
      );

      const inputs = container.querySelectorAll('input');
      fireEvent.input(inputs[4], { target: { value: 37 } });
      fireEvent.input(inputs[4], { target: { value: 33 } });
      fireEvent.blur(inputs[4]);

      fireEvent.click(screen.getByTestId('bin-save-button'));

      expect(onSave).not.toHaveBeenCalled();
    });
  });
});
