import React, { useState, useRef } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import { addInsightsInputCategory } from 'modules/commercial/insights/services/insightsInputs';
import { addInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';

// components
import Category from 'modules/commercial/insights/admin/components/Category';
import Idea from './Idea';
import { Label, Spinner } from 'cl2-component-library';
import Button from 'components/UI/Button';
import Creatable from 'react-select/creatable';
import selectStyles from 'components/UI/MultipleSelect/styles';
import Navigation, { NavigationProps } from './Navigation';

// hooks
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import useInsightsInput from 'modules/commercial/insights/hooks/useInsightsInput';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

type InputDetailsProps = {
  previewedInputId: string;
} & NavigationProps &
  WithRouterProps &
  InjectedIntlProps;

const Container = styled.div`
  padding: 48px;
  padding-right: 100px;
  position: relative;
  height: 100%;
`;

const CategoryList = styled.div`
  margin-bottom: 16px;
  > * {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

const FormContainer = styled.form`
  display: flex;
  align-items: flex-end;
  margin-top: 50px;
  margin-bottom: 50px;
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

const LoadingContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-context: center;
  align-items: center;
`;

type OptionProps = {
  label: string;
  value: string;
};

const InputDetails = ({
  params: { viewId },
  intl: { formatMessage },
  previewedInputId,
  moveUp,
  moveDown,
  isMoveUpDisabled,
  isMoveDownDisabled,
}: InputDetailsProps) => {
  const selectRef = useRef<Creatable<{ label: string; value: string }, false>>(
    null
  );
  const [selectedOption, setSelectedOption] = useState<null | OptionProps>();
  const [isSelectFocused, setIsSelectFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = useInsightsCategories(viewId);
  const previewedInput = useInsightsInput(viewId, previewedInputId);

  // Loading state
  if (previewedInput === undefined) {
    return (
      <LoadingContainer data-testid="insightsEditDetailsLoading">
        <Spinner />
      </LoadingContainer>
    );
  }

  if (isNilOrError(categories) || isNilOrError(previewedInput)) {
    return null;
  }

  const ideaId = previewedInput.relationships?.source.data.id;

  const options = categories
    // Filter out already selected categories
    .filter((category) => {
      const selectedCategoriesIds = previewedInput.relationships?.categories
        ? previewedInput.relationships?.categories.data.map(
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
      await addInsightsInputCategory(viewId, previewedInput.id, result.data.id);
      setSelectedOption(null);
    } catch {
      // Do nothing
    }
    setLoading(false);
  };

  const handleEnterPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (selectedOption) {
        await addInsightsInputCategory(
          viewId,
          previewedInput.id,
          selectedOption.value
        );
        setSelectedOption(null);
        selectRef.current?.blur();
      }
    } catch {
      // Do nothing
    }
    setLoading(false);
  };

  const formatCreateLabel = (value: string) => {
    return `${formatMessage(messages.createCategoryPrompt)} "${value}"`;
  };

  // Keep track of select focus to prevent keyboard navigation from switching inputs while the select is open
  const onSelectFocus = () => setIsSelectFocused(true);
  const onSelectBlur = () => setIsSelectFocused(false);

  return (
    <>
      <Container data-testid="insightsInputDetails">
        <CategoryList>
          {previewedInput.relationships?.suggested_categories.data.map(
            (category) => (
              <Category
                id={category.id}
                key={category.id}
                inputId={previewedInput.id}
                variant="suggested"
                size="large"
              />
            )
          )}
        </CategoryList>
        <FormContainer>
          <div className="categoryInput">
            <Label htmlFor="categorySelect">
              {formatMessage(messages.addCategoryLabel)}
            </Label>
            <Creatable
              inputId="categorySelect"
              styles={selectStyles}
              placeholder={formatMessage(messages.addCategoryPlaceholder)}
              options={options}
              onCreateOption={handleCreate}
              onChange={handleChange}
              value={selectedOption}
              formatCreateLabel={formatCreateLabel}
              onFocus={onSelectFocus}
              onBlur={onSelectBlur}
              onKeyDown={handleEnterPress}
              ref={selectRef}
            />
          </div>
          <Button
            fontSize={`${fontSizes.xxxl}px`}
            bgColor={colors.adminTextColor}
            className="addButton"
            padding="12px 22px"
            size="2"
            onClick={handleSubmit}
            disabled={!selectedOption}
            processing={loading}
          >
            <StyledPlus>+</StyledPlus>
          </Button>
        </FormContainer>
        <CategoryList>
          {previewedInput.relationships?.categories.data.map((category) => (
            <Category
              id={category.id}
              key={category.id}
              inputId={previewedInput.id}
              variant="approved"
            />
          ))}
        </CategoryList>
        {ideaId && <Idea ideaId={ideaId} />}
      </Container>
      <Navigation
        moveDown={moveDown}
        moveUp={moveUp}
        isMoveUpDisabled={isMoveUpDisabled || isSelectFocused}
        isMoveDownDisabled={isMoveDownDisabled || isSelectFocused}
      />
    </>
  );
};

export default withRouter(injectIntl(InputDetails));
