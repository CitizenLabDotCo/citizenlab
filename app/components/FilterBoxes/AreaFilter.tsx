import React, { memo, useMemo, useCallback } from 'react';
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';

// components
import MultipleSelect from 'components/UI/MultipleSelect';

// resources
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import useTenant from 'hooks/useTenant';

// i18n
import messages from './messages';
import localize, { InjectedLocalized } from 'utils/localize';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { Header, Title } from './styles';

// typings
import { IOption } from 'typings';
import { IAreaData } from 'services/areas';
import T from 'components/T';

const Container = styled.div`
  width: 100%;
  padding: 20px;
  padding-top: 25px;
  padding-bottom: 25px;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 0px 2px 2px -1px rgba(152, 162, 179, 0.3), 0px 1px 5px -2px rgba(152, 162, 179, 0.3);
`;

interface InputProps {
  selectedAreaIds: string[] | null;
  onChange: (arg: string[] | null) => void;
  className?: string;
}

interface DataProps {
  areas: GetAreasChildProps;
}

interface Props extends InputProps, DataProps {}

const AreaFilter = memo<Props & InjectedLocalized>(({ selectedAreaIds, onChange, className, localize, areas }) => {

  const tenant = useTenant();

  const selectedOptions = useMemo(() => {
    if (!isNilOrError(areas) && selectedAreaIds) {
      return selectedAreaIds.map((selectedAreaId) => {
        const area = areas.find(area => area.id === selectedAreaId) as IAreaData;

        return {
          value: selectedAreaId,
          label: localize(area.attributes.title_multiloc)
        };
      });
    }

    return [];
  }, [areas, selectedAreaIds]);

  const options = useMemo(() => {
    if (!isNilOrError(areas)) {
      return areas.map((area) => ({
        value: area.id,
        label: localize(area.attributes.title_multiloc)
      }));
    }

    return [];
  }, [areas]);

  const handleOnChange = useCallback((options: IOption[]) => {
    const output = options.map(area => area.value);
    onChange(output.length > 0 ? output : null);
  }, []);

  const areasTerm = !isNilOrError(tenant) && tenant.data.attributes.settings.core.areas_term;

  return (
    <Container className={className}>
      <Header>
        <Title>
          {areasTerm && !isEmptyMultiloc(areasTerm)
            ? <T value={areasTerm} />
            : <FormattedMessage {...messages.areas} />
          }
        </Title>
      </Header>

      <MultipleSelect
        value={selectedOptions}
        options={options}
        onChange={handleOnChange}
      />
    </Container>
  );
});

const AreaFilterWithHoC = localize(AreaFilter);

export default (inputProps: InputProps) => (
  <GetAreas>
    {(areas) => <AreaFilterWithHoC {...inputProps} areas={areas} />}
  </GetAreas>
);
