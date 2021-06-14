import messages from '../../messages';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import React, { useState } from 'react';
import { deleteInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';
import { isNilOrError } from 'utils/helperUtils';
import Modal from 'components/UI/Modal';
import { Dropdown, DropdownListItem, IconTooltip } from 'cl2-component-library';
import Button from 'components/UI/Button';
import RenameCategory from '../RenameCategory';

const StyledHeader = styled.h2`
  display: flex;
  align-items: center;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  button {
    margin-left: 20px;
  }
  margin-bottom: 0;
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
        search: stringify({ ...query, category: '' }, { addQueryPrefix: true }),
      });
      setCategoryMenuOpened(false);
    }
  };
  const selectedCategory = categories?.find(
    (category) => category.id === query.category
  );

  return (
    <>
      <StyledHeader data-testid="insightsInputsHeader">
        {selectedCategory ? (
          <>
            {selectedCategory.attributes.name}
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
        ) : (
          <>
            {formatMessage(messages.allInput)}
            <IconTooltip content={formatMessage(messages.allInputTooltip)} />
          </>
        )}
      </StyledHeader>
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
