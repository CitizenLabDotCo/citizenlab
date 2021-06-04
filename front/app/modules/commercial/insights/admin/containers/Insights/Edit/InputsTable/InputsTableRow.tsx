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
  onSelect: () => void;
};

const InputsTableRow = ({ input, onSelect }: InputsTableRowProps) => {
  const idea = useIdea({ ideaId: input.relationships?.source.data.id });

  if (isNilOrError(idea)) {
    return null;
  }

  // TODO: Implement checkbox logic
  const handleCheckboxChange = () => {};

  const handleEnterPress = (
    event: React.KeyboardEvent<HTMLTableRowElement>
  ) => {
    if (event.key === 'Enter') {
      onSelect();
    }
  };

  return (
    <tr
      data-testid="insightsInputsTableRow"
      onClick={onSelect}
      tabIndex={0}
      onKeyPress={handleEnterPress}
    >
      <td>
        <Checkbox checked={false} onChange={handleCheckboxChange} />
      </td>
      <td>
        <T value={idea.attributes.title_multiloc} />
      </td>
      <td>
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
