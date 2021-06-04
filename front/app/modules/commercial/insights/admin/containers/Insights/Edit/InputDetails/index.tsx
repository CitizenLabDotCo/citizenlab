import React, { useState, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IInsightsInputData,
  addInsightsInputCategory,
} from 'modules/commercial/insights/services/insightsInputs';
import { addInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';

// components
import Category from 'modules/commercial/insights/admin/components/Category';
import Idea from './Idea';
import { Button, Label } from 'cl2-component-library';
import Creatable from 'react-select/creatable';
import selectStyles from 'components/UI/MultipleSelect/styles';

// hooks
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import useKeyPress from 'hooks/useKeyPress';

// styles
import styled from 'styled-components';
// import { colors, fontSizes } from 'utils/styleUtils';

type InputDetailsProps = {
  initiallySelectedInput: IInsightsInputData;
} & WithRouterProps;

const Container = styled.div`
  padding: 48px;
  padding-right: 100px;
  position: relative;
  height: 100%;
`;

const CategoryList = styled.div`
  margin-top: 50px;
  > * {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

const StyledNavigation = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
`;

const StyledChevronButton = styled(Button)`
  max-width: 8px;
  margin: 2px;
  button {
    padding: 8px 12px !important;
  }
`;

const InputDetails = ({
  initiallySelectedInput,
  params: { viewId },
}: InputDetailsProps) => {
  const [selectedInput, setSelectedInput] = useState(initiallySelectedInput);

  const upArrow = useKeyPress('ArrowUp');
  const downArrow = useKeyPress('ArrowDown');

  const inputs = useInsightsInputs(viewId);
  const categories = useInsightsCategories(viewId);

  useEffect(() => {
    if (!isNilOrError(inputs)) {
      const selectedInput = inputs.find(
        (input) => input.id === initiallySelectedInput.id
      );
      selectedInput && setSelectedInput(selectedInput);
    }
  }, [inputs, initiallySelectedInput]);

  // Keyboard navigation
  useEffect(() => {
    if (!isNilOrError(inputs)) {
      const currentInputIndex = inputs.indexOf(selectedInput);
      if (upArrow && currentInputIndex > 0) {
        setSelectedInput(inputs[currentInputIndex - 1]);
      }
      if (downArrow && currentInputIndex < inputs.length - 1) {
        setSelectedInput(inputs[currentInputIndex + 1]);
      }
    }
  }, [upArrow, downArrow, inputs]);

  if (isNilOrError(inputs) || isNilOrError(categories)) {
    return null;
  }

  const currentInputIndex = inputs.indexOf(selectedInput);

  const moveUp = () => {
    if (currentInputIndex > 0) {
      setSelectedInput(inputs[currentInputIndex - 1]);
    }
  };

  const moveDown = () => {
    if (currentInputIndex < inputs.length - 1) {
      setSelectedInput(inputs[currentInputIndex + 1]);
    }
  };

  const ideaId = selectedInput.relationships?.source.data.id;

  const options = categories.map((category) => ({
    label: category.attributes.name,
    value: category.id,
  }));

  const handleCreate = async (value: string) => {
    const result = await addInsightsCategory(viewId, value);
    console.log(result);
    addInsightsInputCategory(viewId, selectedInput.id, result.data.id);
  };

  const handleChange = (option: { label: string; value: string }) => {
    addInsightsInputCategory(viewId, selectedInput.id, option.value);
  };

  return (
    <Container>
      <Label>Add a category</Label>
      <Creatable
        styles={selectStyles}
        placeholder="Type a category name..."
        options={options}
        onCreateOption={handleCreate}
        onChange={handleChange}
      />
      <CategoryList>
        {selectedInput.relationships?.categories.data.map((category) => (
          <Category
            id={category.id}
            key={category.id}
            inputId={selectedInput.id}
          />
        ))}
      </CategoryList>
      {ideaId && <Idea ideaId={ideaId} />}
      <StyledNavigation>
        <StyledChevronButton
          iconSize="8px"
          locale="en"
          icon="chevron-up"
          buttonStyle="secondary-outlined"
          onClick={moveUp}
          disabled={currentInputIndex === 0}
        />
        <StyledChevronButton
          iconSize="8px"
          locale="en"
          icon="chevron-down"
          buttonStyle="secondary-outlined"
          onClick={moveDown}
          disabled={currentInputIndex === inputs.length - 1}
        />
      </StyledNavigation>
    </Container>
  );
};

export default withRouter(InputDetails);
