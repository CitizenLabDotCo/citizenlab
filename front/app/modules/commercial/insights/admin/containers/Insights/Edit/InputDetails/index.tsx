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
import { Button, Label, Spinner } from 'cl2-component-library';
import Creatable from 'react-select/creatable';
import selectStyles from 'components/UI/MultipleSelect/styles';

// hooks
import useLocale from 'hooks/useLocale';
import useInsightsInputs from 'modules/commercial/insights/hooks/useInsightsInputs';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import useKeyPress from 'hooks/useKeyPress';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

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

const FormContainer = styled.form`
  display: flex;
  align-items: flex-end;
  margin-bottom: 28px;
  .categoryInput {
    flex: 1;
  }

  .addButton {
    margin-left: 4px;
  }
`;

const StyledPlus = styled.div`
  width: 24px;
  text-align: center;
`;

type OptionProps = {
  label: string;
  value: string;
};

const InputDetails = ({
  initiallySelectedInput,
  params: { viewId },
  intl: { formatMessage },
}: InputDetailsProps) => {
  const locale = useLocale();
  const [selectedInput, setSelectedInput] = useState(initiallySelectedInput);
  const [selectedOption, setSelectedOption] = useState<null | OptionProps>();
  const [loading, setLoading] = useState(false);

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

  if (
    isNilOrError(inputs) ||
    isNilOrError(categories) ||
    isNilOrError(locale)
  ) {
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

  const options = categories
    // Filter out already selected categories
    .filter((category) => {
      const selectedCategoriesIds = selectedInput.relationships?.categories
        ? selectedInput.relationships?.categories.data.map(
            (category) => category.id
          )
        : [];

      return !selectedCategoriesIds.includes(category.id);
    })
    .map((category) => ({
      label: category.attributes.name,
      value: category.id,
    }));

  const handleChange = (option: OptionProps) => {
    setSelectedOption(option);
  };

  const handleCreate = async (value: string) => {
    setLoading(true);
    try {
      const result = await addInsightsCategory(viewId, value);
      await addInsightsInputCategory(viewId, selectedInput.id, result.data.id);
      setSelectedOption(null);
    } catch {
      // Do nothing
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (selectedOption) {
        await addInsightsInputCategory(
          viewId,
          selectedInput.id,
          selectedOption.value
        );
        setSelectedOption(null);
      }
    } catch {
      // Do nothing
    }
    setLoading(false);
  };

  const formatCreateLabel = (value: string) => {
    return `${formatMessage(messages.createCategoryPrompt)} "${value}"`;
  };

  return (
    <Container>
      <FormContainer>
        <div className="categoryInput">
          <Label>{formatMessage(messages.addCategoryLabel)}</Label>
          <Creatable
            styles={selectStyles}
            placeholder={formatMessage(messages.addCategoryPlaceholder)}
            options={options}
            onCreateOption={handleCreate}
            onChange={handleChange}
            value={selectedOption}
            blurInputOnSelect
            formatCreateLabel={formatCreateLabel}
          />
        </div>
        <Button
          locale={locale}
          fontSize={`${fontSizes.xxxl}px`}
          bgColor={colors.adminTextColor}
          className="addButton"
          padding="12px 22px"
          size="2"
          onClick={handleSubmit}
          disabled={!selectedOption || loading}
        >
          {loading ? <Spinner size="24px" /> : <StyledPlus>+</StyledPlus>}
        </Button>
      </FormContainer>
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

export default withRouter(injectIntl(InputDetails));
