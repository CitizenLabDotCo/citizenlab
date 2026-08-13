import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { INavbarDropdownChild, INavbarItem } from 'api/navbar/types';
import useAddNavbarItem from 'api/navbar/useAddNavbarItem';
import useUpsertNavbarDropdown from 'api/navbar/useUpsertNavbarDropdown';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Modal from 'components/UI/Modal';
import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';
import { IItemNotInNavbar } from 'utils/navbar';

import DropdownForm from './DropdownForm';
import messages from './messages';
import SingleItemForm from './SingleItemForm';

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

  const dropdownEnabled = useFeatureFlag({ name: 'configurable_dropdown' });
  const dropdownBlocked = !dropdownEnabled && !isEditing;

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
        isEditing ? messages.dropdown : messages.modalTitle
      )}
    >
      <Box p="24px">
        <Box display="flex" width="100%">
          <Button
            flex="1"
            buttonStyle={activeTab === 'single' ? 'admin-dark' : 'secondary'}
            onClick={() => setActiveTab('single')}
            className="intercom-admin-pages-menu-single-item-tab"
            data-cy="e2e-new-menu-item-single-tab"
            borderRadius="4px 0 0 4px"
          >
            {formatMessage(messages.singleItem)}
          </Button>
          <UpsellTooltip disabled={!dropdownBlocked} width="50%">
            <Button
              width="100%"
              buttonStyle={
                activeTab === 'dropdown' ? 'admin-dark' : 'secondary'
              }
              onClick={() => setActiveTab('dropdown')}
              disabled={dropdownBlocked}
              className="intercom-admin-pages-menu-dropdown-tab"
              data-cy="e2e-new-menu-item-dropdown-tab"
              borderRadius="0 4px 4px 0"
            >
              {formatMessage(messages.dropdown)}
            </Button>
          </UpsellTooltip>
        </Box>

        {activeTab === 'single' ? (
          <SingleItemForm
            onSubmit={onSingleSubmit}
            onCancel={handleClose}
            processing={singleProcessing}
          />
        ) : (
          <DropdownForm
            editItem={editItem}
            onSubmit={onDropdownSubmit}
            onCancel={handleClose}
            processing={dropdownProcessing}
          />
        )}
      </Box>
    </Modal>
  );
};

export default NewMenuItemModal;
