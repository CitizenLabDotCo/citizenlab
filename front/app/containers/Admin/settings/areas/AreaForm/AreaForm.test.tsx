import React from 'react';

import { screen, render, fireEvent, waitFor } from 'utils/testUtils/rtl';

import AreaForm from './';

const titleEN = 'en title';
const newTitleEN = 'new en title';

const descriptionEN = 'en description';

const defaultProps = {
  onSubmit: jest.fn(),
  defaultValues: {
    title_multiloc: { en: titleEN },
    description_multiloc: { en: descriptionEN },
  },
};
describe('AreaForm', () => {
  it('renders', () => {
    render(<AreaForm {...defaultProps} />);
    expect(screen.getByTestId('areaForm')).toBeInTheDocument();
  });
  it('submits correct data', async () => {
    const { container } = render(<AreaForm {...defaultProps} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: newTitleEN,
      },
    });

    fireEvent.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title_multiloc: { en: newTitleEN },
        description_multiloc: { en: descriptionEN },
      });
      expect(screen.getByTestId('feedbackSuccessMessage')).toBeInTheDocument();
    });
  });
  it('shows error summary and error message when title is missing', async () => {
    const { container } = render(<AreaForm {...defaultProps} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '',
      },
    });

    fireEvent.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => {
      expect(screen.getAllByTestId('error-message')).toHaveLength(2);
      expect(screen.getByTestId('feedbackErrorMessage')).toBeInTheDocument();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });
});
