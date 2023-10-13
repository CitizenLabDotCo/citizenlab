import React from 'react';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px ${colors.borderDark};

  input {
    width: 100%;
    color: ${colors.grey800};
    font-size: ${fontSizes.base}px;
    padding: 12px;
  }
`;

type Props = {
  id?: string;
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
};

const DateSinglePicker = ({
  id,
  selectedDate,
  onChange,
  disabled = false,
}: Props) => {
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

  return (
    <Container>
      <DatePicker
        id={id}
        selected={selectedDate}
        onChange={onChange}
        disabled={disabled}
        popperModifiers={[
          {
            name: 'preventOverflow',
            options: {
              rootBoundary: 'viewport',
              altAxis: true,
            },
          },
        ]}
        locale={locale}
      />
    </Container>
  );
};

export default DateSinglePicker;
