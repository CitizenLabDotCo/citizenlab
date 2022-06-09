import React from 'react';

// components
import { Select, SelectProps } from '@citizenlab/cl2-component-library';

interface IYearOption {
  value: number;
  label: string;
}

type OmittedSelectProps = 'onChange' | 'value' | 'options';

interface Props extends Omit<SelectProps, OmittedSelectProps> {
  onChange: (option: IYearOption) => void;
  value?: IYearOption | number;
  minYear: number;
  /* If maxYear is not provided, this will default to the current year */
  maxYear?: number;
}

const generateOptions = (minYear: number, maxYear?: number) => {
  maxYear = maxYear ?? new Date().getFullYear();
  if (maxYear < minYear) return null;

  return new Array(maxYear - minYear + 1).fill(0).map((_, i) => {
    const year = minYear + i;
    return {
      value: year,
      label: year.toString(),
    };
  });
};

const YearSelect = ({ minYear, maxYear, ...otherProps }: Props) => {
  const options = generateOptions(minYear, maxYear);
  if (options === null) return null;

  return <Select options={options} {...otherProps} />;
};

export default YearSelect;
