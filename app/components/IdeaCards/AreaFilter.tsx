import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Select from 'components/UI/Select';

// resources
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';

// i18n
import messages from './messages';
import localize, { InjectedLocalized } from 'utils/localize';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { IOption } from 'typings';

const Container = styled.div`
  width: 100%;
  padding: 20px;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.04);
`;

const Title = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 15px;
  margin-left: 18px;
`;

interface InputProps {
  onChange: (arg: IOption | null) => void;
  className?: string;
}

interface DataProps {
  areas: GetAreasChildProps;
}

interface Props extends InputProps, DataProps {}

const AreaFilter = memo<Props & InjectedIntlProps & InjectedLocalized>(({ onChange, className, localize, intl, areas }) => {

  const [selectedOption, setSelectedOption] = useState<IOption | null>(null);

  const options = useMemo(() => {
    if (!isNilOrError(areas)) {
      return areas.map((area) => ({
        value: area.id,
        label: localize(area.attributes.title_multiloc)
      }));
    }

    return [];
  }, [areas]);

  const handleOnChange = useCallback((option: IOption) => {
    setSelectedOption(option);
  }, []);

  useEffect(() => {
    console.log(selectedOption);
    onChange(selectedOption);
  }, [selectedOption]);

  const placeholder = intl.formatMessage(messages.selectYourArea);

  return (
    <Container className={className}>
      <Title>
        <FormattedMessage {...messages.filterPerArea} />
      </Title>

      <Select
        value={selectedOption}
        options={options}
        onChange={handleOnChange}
        clearable={false}
        placeholder={placeholder}
      />
    </Container>
  );
});

const AreaFilterWithHoC = injectIntl(localize(AreaFilter));

export default (inputProps) => (
  <GetAreas>
    {(areas) => <AreaFilterWithHoC {...inputProps} areas={areas} />}
  </GetAreas>
);
