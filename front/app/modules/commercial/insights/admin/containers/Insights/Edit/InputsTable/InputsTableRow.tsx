import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useFeatureFlag from 'hooks/useFeatureFlag';

// styles
import styled from 'styled-components';
import { Checkbox, Td, colors } from '@citizenlab/cl2-component-library';

// components
import T from 'components/T';
import Category from 'modules/commercial/insights/admin/components/Category';
import { IInsightsInputData } from 'modules/commercial/insights/api/inputs/types';

const CategoryList = styled.div`
  > *:not(:only-of-type) {
    margin-right: 8px;
    margin-top: 4px;
    margin-bottom: 4px;
  }
`;

const StyledTableRow = styled.tr`
  cursor: pointer;
  height: 56px;

  .inputTitle {
    color: ${colors.textSecondary};
  }

  &:hover {
    background-color: ${colors.background};
    .inputTitle {
      text-decoration: underline;
    }
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
  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });
  const { data: idea } = useIdeaById(input.relationships.source.data.id);

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

  const categories = input.relationships?.categories.data;
  const suggestedCategories = nlpFeatureFlag
    ? input.relationships?.suggested_categories.data
    : [];

  return (
    <StyledTableRow
      data-testid="insightsInputsTableRow"
      tabIndex={0}
      onKeyPress={handleEnterPress}
      onClick={onPreview}
    >
      <Td px="4px">
        <Checkbox
          checked={selected}
          onChange={changeSelected}
          stopLabelPropagation
        />
      </Td>
      <Td>
        <T
          value={idea.data.attributes.title_multiloc}
          maxLength={30}
          className="inputTitle"
        />
      </Td>
      <Td>
        <CategoryList>
          {(query.category
            ? categories.filter((category) => category.id === query.category)
            : categories
          ).map((category) => (
            <Category
              id={category.id}
              variant="approved"
              inputId={input.id}
              key={category.id}
            />
          ))}

          {(query.category
            ? suggestedCategories.filter(
                (category) => category.id === query.category
              )
            : suggestedCategories
          ).map((category) => (
            <Category
              id={category.id}
              variant="suggested"
              inputId={input.id}
              key={category.id}
            />
          ))}
        </CategoryList>
      </Td>
      {query.category ? (
        <Td>
          <CategoryList>
            {categories
              .filter((category) => category.id !== query.category)
              .map((category) => (
                <Category
                  id={category.id}
                  variant="approved"
                  inputId={input.id}
                  key={category.id}
                />
              ))}
            {suggestedCategories
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
        </Td>
      ) : null}
    </StyledTableRow>
  );
};

export default withRouter(InputsTableRow);
