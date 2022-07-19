import React from 'react';
import BinModal from '.';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');

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

      fireEvent.click(screen.getByText('Save'));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith([18, 25, 37, 45, 55, 65, null]);
    });

    it.only('calls onSave with right data (not blurring input, saving directly)', () => {
      const onSave = jest.fn();

      const { container } = render(
        <BinModal open={true} onClose={jest.fn()} onSave={onSave} />
      );

      const inputs = container.querySelectorAll('input');
      fireEvent.input(inputs[4], { target: { value: 37 } });

      fireEvent.click(screen.getByText('Save'));

      waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith([18, 25, 37, 45, 55, 65, null]);
      });
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

      fireEvent.click(screen.getByText('Save'));

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

      fireEvent.click(screen.getByText('Save'));

      expect(onSave).not.toHaveBeenCalled();
    });
  });
});
