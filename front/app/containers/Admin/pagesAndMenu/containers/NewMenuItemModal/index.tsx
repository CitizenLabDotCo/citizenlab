import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { INavbarDropdownChild, INavbarItem } from 'api/navbar/types';
import useAddNavbarItem from 'api/navbar/useAddNavbarItem';
import useUpsertNavbarDropdown from 'api/navbar/useUpsertNavbarDropdown';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { IItemNotInNavbar } from 'utils/navbar';

import DropdownForm from './DropdownForm';
import messages from './messages';
import SingleItemForm from './SingleItemForm';

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  cursor: pointer;
  padding: 12px 16px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  background: ${({ active }) => (active ? colors.primary : 'transparent')};
  color: ${({ active }) => (active ? colors.white : colors.textSecondary)};
  transition: all 80ms ease-out;
`;

const TabsBar = styled.div`
  display: flex;
  border: 1px solid ${colors.borderDark};
  border-radius: ${({ theme }) => theme.borderRadius};
  overflow: hidden;
`;

type Props = {
  opened: boolean;
  onClose: () => void;
  // When present, the modal edits this dropdown item.
  editItem?: INavbarItem;
};

const NewMenuItemModal = ({ opened, onClose, editItem }: Props) => {
  const { formatMessage } = useIntl();

  const { mutateAsync: addNavbarItem, isLoading: singleProcessing } =
    useAddNavbarItem();
  const { mutateAsync: upsertDropdown, isLoading: dropdownProcessing } =
    useUpsertNavbarDropdown();

  const isEditing = !!editItem;
  const [activeTab, setActiveTab] = React.useState<'single' | 'dropdown'>(
    isEditing ? 'dropdown' : 'single'
  );

  const handleClose = () => {
    setActiveTab(isEditing ? 'dropdown' : 'single');
    onClose();
  };

  const onSingleSubmit = async (item: IItemNotInNavbar) => {
    await addNavbarItem(item);
    handleClose();
  };

  const onDropdownSubmit = async (values: {
    title_multiloc: Multiloc;
    children: INavbarDropdownChild[];
  }) => {
    await upsertDropdown({ id: editItem?.id, ...values });
    handleClose();
  };

  return (
    <Modal
      opened={opened}
      close={handleClose}
      header={formatMessage(
        isEditing ? messages.dropdownMenu : messages.modalTitle
      )}
    >
      <Box p="24px">
        {!isEditing && (
          <TabsBar>
            <Tab
              type="button"
              active={activeTab === 'single'}
              onClick={() => setActiveTab('single')}
              data-cy="e2e-new-menu-item-single-tab"
            >
              {formatMessage(messages.singleItem)}
            </Tab>
            <Tab
              type="button"
              active={activeTab === 'dropdown'}
              onClick={() => setActiveTab('dropdown')}
              data-cy="e2e-new-menu-item-dropdown-tab"
            >
              {formatMessage(messages.dropdownMenu)}
            </Tab>
          </TabsBar>
        )}

        {activeTab === 'single' && !isEditing ? (
          <SingleItemForm
            onSubmit={onSingleSubmit}
            processing={singleProcessing}
          />
        ) : (
          <DropdownForm
            editItem={editItem}
            onSubmit={onDropdownSubmit}
            processing={dropdownProcessing}
          />
        )}
      </Box>
    </Modal>
  );
};

export default NewMenuItemModal;
