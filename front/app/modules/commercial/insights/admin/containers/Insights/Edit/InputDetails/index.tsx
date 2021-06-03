import React, { useState, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  IInsightsInputData,
  deleteInsightsInputCategory,
} from 'modules/commercial/insights/services/insightsInputs';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// components
import Tag from 'modules/commercial/insights/admin/components/Tag';
import Idea from './Idea';
import { Button, Label } from 'cl2-component-library';
import Creatable from 'react-select/creatable';
import selectStyles from 'components/UI/MultipleSelect/styles';

// hooks
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';
import useKeyPress from 'hooks/useKeyPress';

// styles
import styled from 'styled-components';
// import { colors, fontSizes } from 'utils/styleUtils';

type InputDetailsProps = {
  initiallySelectedInput: IInsightsInputData;
} & WithRouterProps &
  InjectedIntlProps;

const Container = styled.div`
  padding: 48px;
  padding-right: 100px;
  position: relative;
  height: 100%;
`;

const TagList = styled.div`
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
  intl: { formatMessage },
  params: { viewId },
}: InputDetailsProps) => {
  const [selectedInput, setSelectedInput] = useState(initiallySelectedInput);

  const upArrow = useKeyPress('ArrowUp');
  const downArrow = useKeyPress('ArrowDown');

  const inputs = useInsightsInputs(viewId);

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

  if (isNilOrError(inputs)) {
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

  const handleRemoveCategory = (categoryId: string) => () => {
    const deleteMessage = formatMessage(
      messages.inputsTableDeleteCategoryConfirmation
    );
    if (window.confirm(deleteMessage)) {
      deleteInsightsInputCategory(viewId, selectedInput.id, categoryId);
    }
  };

  return (
    <Container>
      <Label>Add a category</Label>
      <Creatable styles={selectStyles} placeholder="Type a category name..." />
      <TagList>
        {selectedInput.relationships?.categories.data.map((category) => (
          <Tag
            id={category.id}
            label={category.id}
            key={category.id}
            status="approved"
            onIconClick={handleRemoveCategory(category.id)}
          />
        ))}
      </TagList>
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

export default withRouter(injectIntl(InputDetails));
