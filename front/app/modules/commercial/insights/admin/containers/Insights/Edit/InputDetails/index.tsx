import React, { useState, useRef } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import Category from 'modules/commercial/insights/admin/components/Category';
import Idea from 'modules/commercial/insights/admin/components/Idea';
import { Label, Spinner, Icon, Box } from '@citizenlab/cl2-component-library';
import Creatable from 'react-select/creatable';
import selectStyles from 'components/UI/MultipleSelect/styles';
import Navigation, {
  NavigationProps,
} from 'modules/commercial/insights/admin/components/Navigation';
import Centerer from 'components/UI/Centerer';

// api
import useCategories from 'modules/commercial/insights/api/categories/useCategories';
import useAddCategory from 'modules/commercial/insights/api/categories/useAddCategory';
import useInput from 'modules/commercial/insights/api/inputs/useInput';
import useAddInputCategories from 'modules/commercial/insights/api/inputs/useAddInputCategories';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

type InputDetailsProps = {
  previewedInputId: string;
} & NavigationProps &
  WithRouterProps &
  WrappedComponentProps;

const Container = styled.div`
  padding: 48px;
  padding-right: 100px;
  position: relative;
  height: 100%;
`;

const CategoryList = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
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

const StyledSpinner = styled(Spinner)`
  width: auto;
`;

const StyledCreatable = styled(Creatable)<{ opitons: OptionProps[] }>`
  #react-select-2-option-${({ options }) => options.length} {
    background-color: ${colors.successLight};
  }
`;

const PlusIcon = styled(Icon)``;

const StyledOptionLabel = styled(Box)`
  ${PlusIcon} {
    display: none;
  }
  &:hover {
    ${PlusIcon} {
      display: block;
    }
  }
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
  const selectRef =
    useRef<Creatable<{ label: string; value: string }, false>>(null);
  const [selectedOption, setSelectedOption] = useState<null | OptionProps>();
  const [isSelectFocused, setIsSelectFocused] = useState(false);

  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });
  const { data: categories } = useCategories(viewId);
  const { data: previewedInput } = useInput(viewId, previewedInputId);
  const { mutate: addInputCategories, isLoading: addInputCategoryIsLoading } =
    useAddInputCategories();
  const { mutate: addCategory, isLoading: addCategoryIsLoading } =
    useAddCategory();

  // Loading state
  if (previewedInput === undefined) {
    return (
      <Centerer height="100%" data-testid="insightsEditDetailsLoading">
        <Spinner />
      </Centerer>
    );
  }

  if (isNilOrError(categories) || isNilOrError(previewedInput)) {
    return null;
  }

  const ideaId = previewedInput.data.relationships?.source.data.id;

  const options = categories.data
    // Filter out already selected categories
    .filter((category) => {
      const selectedCategoriesIds = previewedInput.data.relationships
        ?.categories
        ? previewedInput.data.relationships?.categories.data.map(
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
    addInputCategories({
      viewId,
      inputId: previewedInput.data.id,
      categories: [{ id: option.value, type: 'category' }],
    });
    trackEventByName(tracks.addCategoryFromInput);
  };

  const handleCreate = (value: string) => {
    addCategory(
      {
        viewId,
        category: { name: value },
      },
      {
        onSuccess: (category) => {
          addInputCategories(
            {
              viewId,
              inputId: previewedInputId,
              categories: [{ id: category.data.id, type: 'category' }],
            },
            {
              onSuccess: () => {
                setSelectedOption(null);
                selectRef.current?.blur();
              },
            }
          );
        },
      }
    );
    trackEventByName(tracks.createCategoryFromInput);
  };

  const formatCreateLabel = (value: string) => {
    return (
      <div data-testid="insightsCreateCategoryOption">
        {`${formatMessage(messages.createCategoryPrompt)} `}
        <strong>{`"${value}"`}</strong>
      </div>
    );
  };

  const formatOptionLabel = ({ label }: { label: string }) => {
    return (
      <StyledOptionLabel
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        m="-8px"
        p="8px"
      >
        <div>{label}</div>
        <PlusIcon name="plus-circle" />
      </StyledOptionLabel>
    );
  };

  // Keep track of select focus to prevent keyboard navigation from switching inputs while the select is open
  const onSelectFocus = () => setIsSelectFocused(true);
  const onSelectBlur = () => setIsSelectFocused(false);

  return (
    <>
      <Container data-testid="insightsInputDetails">
        {nlpFeatureFlag && (
          <CategoryList>
            {previewedInput.data.relationships?.suggested_categories.data.map(
              (category) => (
                <Category
                  id={category.id}
                  key={category.id}
                  inputId={previewedInput.data.id}
                  variant="suggested"
                  size="large"
                />
              )
            )}
          </CategoryList>
        )}
        <FormContainer>
          <div className="categoryInput">
            <Label htmlFor="categorySelect">
              {formatMessage(messages.addCategoryLabel)}
            </Label>
            <StyledCreatable
              inputId="categorySelect"
              styles={selectStyles}
              placeholder={formatMessage(messages.addCategoryPlaceholder)}
              options={options}
              onCreateOption={handleCreate}
              onChange={handleChange}
              value={selectedOption}
              formatCreateLabel={formatCreateLabel}
              formatOptionLabel={formatOptionLabel}
              onFocus={onSelectFocus}
              onBlur={onSelectBlur}
              ref={selectRef}
            />
          </div>
        </FormContainer>
        <CategoryList>
          {previewedInput.data.relationships?.categories.data.map(
            (category) => (
              <Category
                id={category.id}
                key={category.id}
                inputId={previewedInput.data.id}
                variant="approved"
              />
            )
          )}
          {(addInputCategoryIsLoading || addCategoryIsLoading) && (
            <StyledSpinner color={colors.success} size="24px" />
          )}
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
