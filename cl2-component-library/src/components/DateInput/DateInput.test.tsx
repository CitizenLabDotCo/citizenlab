import React from 'react';
import moment from 'moment';
import { render, screen } from '../../utils/testUtils/rtl';
import DateInput from '.';

describe('<DateInput />', () => {
  it('renders', () => {
    const onChange = jest.fn();
    render(
      <DateInput value={moment('20210924', 'YYYYMMDD')} onChange={onChange} />
    );
    expect(screen.getByTestId('wrapper')).toBeInTheDocument();
  });
});
