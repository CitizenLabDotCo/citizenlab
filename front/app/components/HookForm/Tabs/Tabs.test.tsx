import React from 'react';
import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';
import Tabs from './';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = object({
  selectedTab: string().required('Error message'),
});

jest.mock('utils/cl-intl');
const onSubmit = jest.fn();

const Form = ({
  defaultValues,
}: {
  defaultValues?: undefined | { selectedTab: string };
}) => {
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit((formData) => onSubmit(formData))}>
        <Tabs
          name="selectedTab"
          items={[
            {
              name: 'none',
              label: 'None',
            },
            {
              name: 'tabOne',
              label: 'First Tab',
            },
            {
              name: 'tabTwo',
              label: 'Second Tab',
            },
          ]}
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('Tabs', () => {
  it('renders', () => {
    render(<Form />);
    expect(screen.getByText(/First Tab/i)).toBeInTheDocument();
  });

  it('submits correct data when another tab is selected', async () => {
    render(<Form defaultValues={{ selectedTab: 'none' }} />);

    fireEvent.click(screen.getByText(/Second Tab/i));
    fireEvent.click(screen.getByText(/submit/i));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ selectedTab: 'tabTwo' })
    );
  });

  it('shows front-end validation error when there is one', async () => {
    render(<Form />);
    fireEvent.click(screen.getByText(/submit/i));
    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      // no default value means it won't submit since there's no value
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('shows API validation error when there is one', async () => {
    const FormWithAPIError = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(() =>
              methods.setError('selectedTab', { error: 'blank' } as any)
            )}
          >
            <Tabs name="selectedTab" items={[]} />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<FormWithAPIError />);

    fireEvent.click(screen.getByText(/submit/i));
    await waitFor(() => {
      expect(
        screen.getByText('This field cannot be empty.')
      ).toBeInTheDocument();
    });
  });
});
