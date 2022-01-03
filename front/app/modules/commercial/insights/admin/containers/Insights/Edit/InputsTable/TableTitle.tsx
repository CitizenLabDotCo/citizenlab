import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// intl
import messages from '../../messages';
import { InjectedIntlProps } from 'react-intl';

// hooks
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';

// services
import { deleteInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';
import { isNilOrError } from 'utils/helperUtils';
import { injectIntl } from 'utils/cl-intl';

// components
import Modal from 'components/UI/Modal';
import {
  Dropdown,
  DropdownListItem,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import {
  TooltipContent,
  SectionTitle,
} from 'modules/commercial/insights/admin/components/StyledTextComponents';
import Button from 'components/UI/Button';
import RenameCategory from '../RenameCategory';

import getInputsCategoryFilter from 'modules/commercial/insights/utils/getInputsCategoryFilter';

const DropdownWrapper = styled.div`
  margin-top: 40px;
  margin-left: -40px;
`;

const TitleContainer = styled.div`
  display: flex;
`;

const TableTitle = ({
  intl: { formatMessage },
  params: { viewId },
  location: { query, pathname },
}: InjectedIntlProps & WithRouterProps) => {
  const categories = useInsightsCategories(viewId);

  const [renameCategoryModalOpened, setRenameCategoryModalOpened] = useState(
    false
  );
  const [isCategoryMenuOpened, setCategoryMenuOpened] = useState(false);

  if (isNilOrError(categories)) {
    return null;
  }

  const closeCategoryRenameModal = () => setRenameCategoryModalOpened(false);
  const openCategoryRenameModal = () => setRenameCategoryModalOpened(true);

  const toggleCategoryMenu = () => {
    setCategoryMenuOpened(!isCategoryMenuOpened);
  };

  const closeCategoryMenu = () => {
    setCategoryMenuOpened(false);
  };

  const handleDeleteCategory = async () => {
    {
      const deleteMessage = formatMessage(messages.deleteCategoryConfirmation);
      if (window.confirm(deleteMessage)) {
        try {
          await deleteInsightsCategory(viewId, query.category);
        } catch {
          // Do nothing
        }
      }
      clHistory.push({
        pathname,
        search: stringify(
          { ...query, category: undefined },
          { addQueryPrefix: true }
        ),
      });
      setCategoryMenuOpened(false);
    }
  };

  const selectedCategory = categories?.find(
    (category) => category.id === query.category
  );

  const inputsCategoryFilter = getInputsCategoryFilter(
    query.category,
    query.processed
  );

  return (
    <>
      <SectionTitle data-testid="insightsInputsHeader">
        {inputsCategoryFilter === 'category' && (
          <>
            {selectedCategory?.attributes.name}
            <Button
              icon="more-options"
              iconColor={colors.label}
              iconHoverColor={colors.label}
              boxShadow="none"
              boxShadowHover="none"
              bgColor="transparent"
              bgHoverColor="transparent"
              padding="0px 20px"
              onClick={toggleCategoryMenu}
            />
          </>
        )}
        {inputsCategoryFilter === 'notCategorized' && (
          <TitleContainer data-testid="insightsTableHeaderNotCategorized">
            {formatMessage(messages.notCategorized)}
            <IconTooltip
              ml="8px"
              content={
                <TooltipContent>
                  {formatMessage(messages.notCategorizedTooltip)}
                </TooltipContent>
              }
            />
          </TitleContainer>
        )}
        {inputsCategoryFilter === 'allInput' && (
          <TitleContainer data-testid="insightsTableHeaderAllInput">
            {formatMessage(messages.allInput)}
            <IconTooltip
              ml="8px"
              content={
                <TooltipContent>
                  {formatMessage(messages.allInputTooltip)}
                </TooltipContent>
              }
            />
          </TitleContainer>
        )}
        {inputsCategoryFilter === 'recentlyPosted' && (
          <TitleContainer data-testid="insightsTableHeaderRecentlyPosted">
            {formatMessage(messages.recentlyPosted)}
            <IconTooltip
              ml="8px"
              content={
                <TooltipContent>
                  {formatMessage(messages.recentlyPostedTooltip)}
                </TooltipContent>
              }
            />
          </TitleContainer>
        )}
      </SectionTitle>
      <DropdownWrapper>
        <Dropdown
          opened={isCategoryMenuOpened}
          onClickOutside={closeCategoryMenu}
          className="dropdown"
          content={
            <>
              <DropdownListItem onClick={openCategoryRenameModal}>
                {formatMessage(messages.editCategoryName)}
              </DropdownListItem>
              <DropdownListItem onClick={handleDeleteCategory}>
                {formatMessage(messages.deleteCategory)}
              </DropdownListItem>
            </>
          }
        />
      </DropdownWrapper>
      <Modal
        opened={renameCategoryModalOpened}
        close={closeCategoryRenameModal}
      >
        {selectedCategory && (
          <RenameCategory
            closeRenameModal={closeCategoryRenameModal}
            originalCategoryName={selectedCategory.attributes.name}
          />
        )}
      </Modal>
    </>
  );
};

export default withRouter(injectIntl(TableTitle));
