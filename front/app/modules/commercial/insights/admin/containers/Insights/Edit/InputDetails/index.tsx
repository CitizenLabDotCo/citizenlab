import React, { useState, useRef } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services
import { addInsightsInputCategory } from 'modules/commercial/insights/services/insightsInputs';
import { addInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';

// components
import Category from 'modules/commercial/insights/admin/components/Category';
import Idea from 'modules/commercial/insights/admin/components/Idea';
import { Label, Spinner, Icon, Box } from '@citizenlab/cl2-component-library';
import Creatable from 'react-select/creatable';
import selectStyles from 'components/UI/MultipleSelect/styles';
import Navigation, {
  NavigationProps,
} from 'modules/commercial/insights/admin/components/Navigation';

// hooks
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import useInsightsInput from 'modules/commercial/insights/hooks/useInsightsInput';
import useFeatureFlag from 'hooks/useFeatureFlag';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

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

const LoadingContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-context: center;
  align-items: center;
`;

const StyledCreatable = styled(Creatable)<{ opitons: OptionProps[] }>`
  #react-select-2-option-${({ options }) => options.length} {
    background-color: ${colors.clGreenSuccessBackground};
  }
`;

const PlusIcon = styled(Icon)`
  width: 18px;
  height: 18px;
`;

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
  const selectRef = useRef<Creatable<{ label: string; value: string }, false>>(
    null
  );
  const [selectedOption, setSelectedOption] = useState<null | OptionProps>();
  const [isSelectFocused, setIsSelectFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });
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

  const handleChange = async (option: OptionProps) => {
    setSelectedOption(option);
    setLoading(true);

    try {
      await addInsightsInputCategory(viewId, previewedInput.id, option.value);
      setSelectedOption(null);
      selectRef.current?.blur();
    } catch {
      // Do nothing
    }
    setLoading(false);
    trackEventByName(tracks.addCategoryFromInput);
  };

  const handleCreate = async (value: string) => {
    setLoading(true);
    try {
      const result = await addInsightsCategory({
        insightsViewId: viewId,
        name: value,
      });
      await addInsightsInputCategory(viewId, previewedInput.id, result.data.id);
      setSelectedOption(null);
    } catch {
      // Do nothing
    }
    trackEventByName(tracks.createCategoryFromInput);
    setLoading(false);
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
          {previewedInput.relationships?.categories.data.map((category) => (
            <Category
              id={category.id}
              key={category.id}
              inputId={previewedInput.id}
              variant="approved"
            />
          ))}
          {loading && <StyledSpinner color={colors.clGreen} size="24px" />}
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
