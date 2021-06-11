import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import {
  addInsightsInputCategory,
  IInsightsInputData,
} from 'modules/commercial/insights/services/insightsInputs';
import { addInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';

// components
import Category from 'modules/commercial/insights/admin/components/Category';
import Idea from './Idea';
import { Button, Label, Spinner } from 'cl2-component-library';
import Creatable from 'react-select/creatable';
import selectStyles from 'components/UI/MultipleSelect/styles';
import Navigation, { NavigationProps } from './Navigation';

// hooks
import useLocale from 'hooks/useLocale';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

type InputDetailsProps = {
  selectedInput: IInsightsInputData;
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
  margin-top: 50px;
  > * {
    margin-right: 8px;
    margin-bottom: 8px;
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
  params: { viewId },
  intl: { formatMessage },
  selectedInput,
  moveUp,
  moveDown,
  isMoveUpDisabled,
  isMoveDownDisabled,
}: InputDetailsProps) => {
  const locale = useLocale();

  const [selectedOption, setSelectedOption] = useState<null | OptionProps>();
  const [isSelectFocused, setIsSelectFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = useInsightsCategories(viewId);

  if (isNilOrError(categories) || isNilOrError(locale)) {
    return null;
  }

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

  // Keep track of select focus to prevent keyboard navigation from switching inputs while the select is open
  const onSelectFocus = () => setIsSelectFocused(true);
  const onSelectBlur = () => setIsSelectFocused(false);

  return (
    <>
      <Container data-testid="insightsInputDetails">
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
              blurInputOnSelect
              formatCreateLabel={formatCreateLabel}
              onFocus={onSelectFocus}
              onBlur={onSelectBlur}
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
              requiresDeleteConfirmation={false}
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
