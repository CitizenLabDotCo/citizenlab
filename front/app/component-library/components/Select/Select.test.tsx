import React from 'react';

import { render, screen, fireEvent } from '../../utils/testUtils/rtl';

import Select from '.';

describe('<Select />', () => {
  it('renders', () => {
    const handleOnChange = jest.fn();
    const options = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];

    render(<Select options={options} onChange={handleOnChange} />);

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('calls onChange when something is selected', () => {
    const handleOnChange = jest.fn();
    const options = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];

    render(<Select options={options} onChange={handleOnChange} />);

    fireEvent.change(screen.getByTestId('select'), { target: { value: 2 } });
    expect(handleOnChange).toHaveBeenCalledWith(options[1]);
  });

  it('renders placeholder', () => {
    const handleOnChange = jest.fn();
    const options = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];
    const placeholder = 'Placeholder';

    render(
      <Select
        options={options}
        onChange={handleOnChange}
        placeholder={placeholder}
      />
    );

    expect(screen.getByDisplayValue(placeholder)).toBeInTheDocument();
  });

  it('does not render placeholder if value is provided', () => {
    const handleOnChange = jest.fn();
    const options = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];
    const placeholder = 'Placeholder';

    render(
      <Select
        options={options}
        onChange={handleOnChange}
        placeholder={placeholder}
        value={1}
      />
    );

    expect(screen.queryByDisplayValue(placeholder)).not.toBeInTheDocument();
  });

  it('selects correctly with placeholder', () => {
    let currentValue;
    const handleOnChange = jest.fn(({ value }) => {
      currentValue = value;
    });

    const options = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];
    const placeholder = 'Placeholder';

    const { rerender } = render(
      <Select
        options={options}
        onChange={handleOnChange}
        placeholder={placeholder}
        value={currentValue}
      />
    );

    expect(screen.getByDisplayValue(placeholder)).toBeInTheDocument();

    // Select second option
    fireEvent.change(screen.getByTestId('select'), { target: { value: 2 } });
    expect(handleOnChange).toHaveBeenCalledWith(options[1]);

    rerender(
      <Select
        options={options}
        onChange={handleOnChange}
        placeholder={placeholder}
        value={currentValue}
      />
    );

    expect(screen.queryByDisplayValue(placeholder)).not.toBeInTheDocument();
    expect(screen.getByDisplayValue(options[1].label)).toBeInTheDocument();
  });
});
