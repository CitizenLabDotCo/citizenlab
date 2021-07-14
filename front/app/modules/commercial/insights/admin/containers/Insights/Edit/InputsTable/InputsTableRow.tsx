import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

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
  > *:not(:only-of-type) {
    margin-right: 8px;
    margin-top: 4px;
    margin-bottom: 4px;
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
  location: { query },
}: InputsTableRowProps & WithRouterProps) => {
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
      onClick={onPreview}
    >
      <td>
        <Checkbox
          checked={selected}
          onChange={changeSelected}
          stopLabelPropagation
        />
      </td>
      <td>
        <T value={idea.attributes.title_multiloc} maxLength={30} />
      </td>
      <td>
        <CategoryList>
          {input.relationships?.categories.data
            .filter((category) =>
              query.category ? category.id === query.category : category
            )
            .map((category) => (
              <Category
                id={category.id}
                variant="approved"
                inputId={input.id}
                key={category.id}
              />
            ))}
          {input.relationships?.suggested_categories.data
            .filter((category) =>
              query.category ? category.id === query.category : category
            )
            .map((category) => (
              <Category
                id={category.id}
                variant="suggested"
                inputId={input.id}
                key={category.id}
              />
            ))}
        </CategoryList>
      </td>
      {query.category ? (
        <td>
          <CategoryList>
            {input.relationships?.categories.data
              .filter((category) => category.id !== query.category)
              .map((category) => (
                <Category
                  id={category.id}
                  variant="approved"
                  inputId={input.id}
                  key={category.id}
                />
              ))}
            {input.relationships?.suggested_categories.data
              .filter((category) => category.id !== query.category)
              .map((category) => (
                <Category
                  id={category.id}
                  variant="suggested"
                  inputId={input.id}
                  key={category.id}
                />
              ))}
          </CategoryList>
        </td>
      ) : null}
    </tr>
  );
};

export default withRouter(InputsTableRow);
