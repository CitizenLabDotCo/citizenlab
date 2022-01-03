// Libraries
import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// Components
import { Icon, Dropdown, Checkbox } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// Hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';

// Services
import {
  batchAssignCategories,
  batchUnassignCategories,
} from 'modules/commercial/insights/services/batchAssignment';
import {
  addInsightsInputCategories,
  IInsightsInputData,
} from 'modules/commercial/insights/services/insightsInputs';

// I18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 22px;
  height: 22px;
  margin-right: 10px;
`;

const ActionButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
`;

const DropdownListItemText = styled.div`
  width: 80%;
  flex: 1 1 auto;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  text-align: left;
  margin-right: 10px;
`;

const DropdownList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const DropdownListItem = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  outline: none;
  cursor: pointer;
  transition: all 80ms ease-out;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.clDropdownHoverBackground};

    ${DropdownListItemText} {
      color: #000;
    }
  }
`;

const DropdownFooterButton = styled(Button)`
  .Button {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
`;

// Typings
import { InjectedIntlProps } from 'react-intl';
import { withRouter, WithRouterProps } from 'react-router';

interface Props {
  className?: string;
  selectedInputs: IInsightsInputData[];
}

const Actions = ({
  className,
  selectedInputs,
  params: { viewId },
  location: { query },
  intl: { formatMessage },
}: Props & InjectedIntlProps & WithRouterProps) => {
  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });
  const categories = useInsightsCategories(viewId);
  const selectedInputsIds = selectedInputs.map((input) => input.id);
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const toggleDropdown = () => {
    setDropdownOpened(!dropdownOpened);
  };

  const [categorySelection, setCategorySelection] = useState(new Set<string>());
  const toggleCategory = (categoryId: string) => () => {
    if (categorySelection.has(categoryId)) {
      const newSelection = new Set(categorySelection);
      newSelection.delete(categoryId);
      setCategorySelection(newSelection);
    } else {
      const newSelection = new Set(categorySelection);
      newSelection.add(categoryId);
      setCategorySelection(newSelection);
    }
  };

  const [processing, setProcessing] = useState(false);
  const [processingBulkApprove, setProcessingBulkApprove] = useState(false);
  // assigns selectedCategories to selectedInputs
  const assign = async () => {
    if (selectedInputs.length > 0 && categorySelection.size > 0) {
      try {
        setProcessing(true);
        await batchAssignCategories(
          viewId,
          [...selectedInputsIds],
          [...categorySelection]
        );
        setCategorySelection(new Set());
      } catch {
        // do nothing
      }
      setProcessing(false);
      setDropdownOpened(false);
    }
  };
  const suggestedCategoriesInSelectedInputs = selectedInputs.some(
    (input) => input.relationships.suggested_categories.data.length > 0
  );

  const approveSuggestedCategories = async () => {
    setProcessingBulkApprove(true);

    for (const input of selectedInputs) {
      try {
        await addInsightsInputCategories(
          viewId,
          input.id,
          input.relationships.suggested_categories.data
        );
      } catch {
        // do nothing
      }
    }
    setProcessingBulkApprove(false);
  };

  if (isNilOrError(categories)) {
    return null;
  }

  const selectedCategory = categories?.find(
    (category) => category.id === query.category
  );

  // unassigns categoryFilter from selectedInputs, with confirmation
  const unassign = async () => {
    if (selectedInputs.length > 0 && selectedCategory) {
      const deleteMessage = formatMessage(messages.deleteFromCategories, {
        categoryName: selectedCategory.attributes.name,
        selectedCount: selectedInputs.length,
      });
      if (window.confirm(deleteMessage)) {
        try {
          setProcessing(true);
          await batchUnassignCategories(
            viewId,
            [...selectedInputsIds],
            [selectedCategory.id]
          );
        } catch {
          // do nothing
        }
        setProcessing(false);
        setDropdownOpened(false);
      }
    }
  };

  const otherCategories = categories.filter(
    (category) => category.id !== selectedCategory?.id
  );

  return (
    <ActionButtons className={className} data-testid="insightsTableActions">
      {selectedInputs.length > 0 && (
        <>
          {otherCategories.length > 0 && (
            <ActionButtonWrapper data-testid="insightsTableActionsBulkAssign">
              <Button onClick={toggleDropdown} buttonStyle="admin-dark-text">
                <StyledIcon name="moveFolder" />
                <FormattedMessage {...messages.bulkAssignCategory} />
              </Button>

              <Dropdown
                top="45px"
                opened={dropdownOpened}
                onClickOutside={toggleDropdown}
                content={
                  <DropdownList>
                    {otherCategories.map((category) => (
                      <DropdownListItem
                        key={category.id}
                        className="e2e-dropdown-item"
                      >
                        <DropdownListItemText>
                          {category.attributes.name}
                        </DropdownListItemText>
                        <Checkbox
                          checked={categorySelection.has(category.id)}
                          onChange={toggleCategory(category.id)}
                        />
                      </DropdownListItem>
                    ))}
                  </DropdownList>
                }
                footer={
                  <DropdownFooterButton
                    className="e2e-dropdown-submit"
                    buttonStyle="cl-blue"
                    onClick={assign}
                    processing={processing}
                    fullWidth={true}
                    padding="12px"
                    whiteSpace="normal"
                    disabled={categorySelection.size === 0}
                  >
                    <FormattedMessage {...messages.assignCategoriesButton} />
                  </DropdownFooterButton>
                }
              />
            </ActionButtonWrapper>
          )}
          {nlpFeatureFlag && suggestedCategoriesInSelectedInputs && (
            <Button
              onClick={approveSuggestedCategories}
              className="hasLeftMargin"
              buttonStyle="admin-dark-text"
              processing={processingBulkApprove}
            >
              <StyledIcon name="checkmark-full" />
              <FormattedMessage {...messages.bulkApprove} />
            </Button>
          )}
          {selectedCategory && (
            <Button
              onClick={unassign}
              className="hasLeftMargin"
              buttonStyle="admin-dark-text"
              processing={processing}
            >
              <StyledIcon name="trash" />
              <FormattedMessage {...messages.bulkUnassign} />
            </Button>
          )}
        </>
      )}
    </ActionButtons>
  );
};

export default withRouter<Props>(injectIntl<Props & WithRouterProps>(Actions));
