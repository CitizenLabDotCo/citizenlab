import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

// hooks
import useIdea from 'hooks/useIdea';

// styles
import styled from 'styled-components';

// components
import { Checkbox } from 'cl2-component-library';
import T from 'components/T';
import Category from 'modules/commercial/insights/admin/components/Category';

const CategoryList = styled.div`
  > * {
    margin-right: 8px;
  }
`;

type InputsTableRowProps = {
  input: IInsightsInputData;
  selected: boolean;
  changeSelected: () => void;
  onPreview: () => void;
};

const InputsTableRow = ({
  input,
  selected,
  changeSelected,
  onPreview,
}: InputsTableRowProps) => {
  const idea = useIdea({ ideaId: input.relationships?.source.data.id });

  if (isNilOrError(idea)) {
    return null;
  }

  const handleEnterPress = (
    event: React.KeyboardEvent<HTMLTableRowElement>
  ) => {
    if (event.key === 'Enter') {
      onPreview();
    }
  };

  return (
    <tr
      data-testid="insightsInputsTableRow"
      tabIndex={0}
      onKeyPress={handleEnterPress}
    >
      <td>
        <Checkbox checked={selected} onChange={changeSelected} />
      </td>
      <td onClick={onPreview}>
        <T value={idea.attributes.title_multiloc} maxLength={30} />
      </td>
      <td onClick={onPreview}>
        <CategoryList>
          {input.relationships?.categories.data.map((category) => (
            <Category id={category.id} inputId={input.id} key={category.id} />
          ))}
        </CategoryList>
      </td>
    </tr>
  );
};

export default InputsTableRow;
