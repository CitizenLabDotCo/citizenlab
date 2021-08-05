import React from 'react';

// components
import { Toggle } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import { LabelHeaderTooltip } from './labels';
import DefaultViewPicker from './DefaultViewPicker';
import SortingPicker from './SortingPicker';
import {
  ToggleRow,
  ToggleLabel,
  BudgetingAmountInput,
  BudgetingAmountInputError,
} from '../styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// typings
import { CLError } from 'typings';
import { IdeaDefaultSortMethod } from 'services/participationContexts';

interface Props {
  min_budget: number | null | undefined;
  max_budget: number | null | undefined;
  commenting_enabled: boolean | null | undefined;
  minBudgetError: string | null;
  maxBudgetError: string | null;
  handleMinBudgetingAmountChange: (newMinBudget: string) => void;
  handleMaxBudgetingAmountChange: (newMaxBudget: string) => void;
  toggleCommentingEnabled: () => void;
  apiErrors?: { [fieldName: string]: CLError[] } | null;
  presentation_mode: 'card' | 'map' | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  ideas_order: IdeaDefaultSortMethod | undefined;
  handleIdeaDefaultSortMethodChange: (
    ideas_order: IdeaDefaultSortMethod
  ) => void;
}

export default ({
  min_budget,
  max_budget,
  commenting_enabled,
  minBudgetError,
  maxBudgetError,
  handleMinBudgetingAmountChange,
  handleMaxBudgetingAmountChange,
  toggleCommentingEnabled,
  apiErrors,
  presentation_mode,
  handleIdeasDisplayChange,
  ideas_order,
  handleIdeaDefaultSortMethodChange,
}: Props) => {
  const minBudgetInputValue =
    // need to check the type because if min_budget is 0,
    // it'll evaluate to null
    typeof min_budget === 'number' ? min_budget.toString() : null;
  const maxBudgetInputValue =
    // maxBudget can't be lower than 1, but it's still a good practice
    // to check for type instead of relying on JS type coercion
    typeof max_budget === 'number' ? max_budget.toString() : null;

  return (
    <>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.totalBudget} />
        </SubSectionTitle>
        <BudgetingAmountInput
          onChange={handleMinBudgetingAmountChange}
          type="number"
          min="0"
          value={minBudgetInputValue}
          label={
            <LabelHeaderTooltip header="minimum" tooltip="minimumTooltip" />
          }
        />
        <BudgetingAmountInputError text={minBudgetError} />
        <BudgetingAmountInputError
          apiErrors={apiErrors && apiErrors.min_budget}
        />
      </SectionField>
      <SectionField>
        <BudgetingAmountInput
          onChange={handleMaxBudgetingAmountChange}
          type="number"
          min="1"
          value={maxBudgetInputValue}
          label={
            <LabelHeaderTooltip header="maximum" tooltip="maximumTooltip" />
          }
        />
        <BudgetingAmountInputError text={maxBudgetError} />
        <BudgetingAmountInputError
          apiErrors={apiErrors && apiErrors.max_budget}
        />
      </SectionField>
      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.phasePermissions} />
        </SubSectionTitle>

        <ToggleRow>
          <ToggleLabel>
            <FormattedMessage {...messages.inputCommentingEnabled} />
          </ToggleLabel>
          <Toggle
            checked={commenting_enabled as boolean}
            onChange={toggleCommentingEnabled}
          />
        </ToggleRow>
        <Error apiErrors={apiErrors && apiErrors.commenting_enabled} />
      </SectionField>

      <DefaultViewPicker
        presentation_mode={presentation_mode}
        apiErrors={apiErrors}
        handleIdeasDisplayChange={handleIdeasDisplayChange}
      />

      <SortingPicker
        ideas_order={ideas_order}
        apiErrors={apiErrors}
        handleIdeaDefaultSortMethodChange={handleIdeaDefaultSortMethodChange}
      />
    </>
  );
};
