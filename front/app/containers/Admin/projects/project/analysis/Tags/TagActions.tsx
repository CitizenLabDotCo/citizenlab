import React, { useState } from 'react';

import {
  Dropdown,
  DropdownListItem,
  colors,
  Spinner,
  Text,
  Icon,
  Box,
  IconButton,
} from '@citizenlab/cl2-component-library';
import useDeleteAnalysisTag from 'api/analysis_tags/useDeleteAnalysisTag';
import { useIntl } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';
import messages from '../messages';
import RenameTagModal from './RenameTagModal';
import Modal from 'components/UI/Modal';
import { ITagData } from 'api/analysis_tags/types';
import useAddAnalysisBulkTagging from 'api/analysis_taggings/useAnalysisBulkTaggings';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

const TagActions = ({ tag }: { tag: ITagData }) => {
  const [renameTagModalOpenedId, setRenameTagModalOpenedId] = useState('');
  const [isDropdownOpened, setDropdownOpened] = useState(false);

  const { mutate: deleteTag, isLoading: deleteIsLoading } =
    useDeleteAnalysisTag();
  const { mutate: bulkAddTaggings, isLoading: bulkTaggingIsLoading } =
    useAddAnalysisBulkTagging();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();

  const { formatMessage } = useIntl();

  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  const handleTagDelete = () => {
    if (window.confirm(formatMessage(messages.deleteTagConfirmation))) {
      deleteTag(
        {
          analysisId,
          id: tag.id,
        },
        {
          onSuccess: () => {
            closeDropdown();
          },
        }
      );
    }
  };

  const openTagRenameModal = (id: string) => {
    setRenameTagModalOpenedId(id);
    closeDropdown();
  };

  const closeTagRenameModal = () => {
    setRenameTagModalOpenedId('');
  };

  const createAnalysisBulkTaggings = () => {
    bulkAddTaggings(
      {
        analysisId,
        tagId: tag.id,
        filters,
      },
      {
        onSuccess: () => {
          closeDropdown();
        },
      }
    );
  };

  return (
    <div>
      <IconButton
        iconName="dots-horizontal"
        iconColor={colors.textSecondary}
        iconColorOnHover={colors.black}
        a11y_buttonActionMessage="open tag actions dropdown"
        onClick={(e) => {
          e?.stopPropagation();
          toggleDropdown();
        }}
      />
      <Dropdown
        opened={isDropdownOpened}
        onClickOutside={closeDropdown}
        className="dropdown"
        right="0px"
        top="40px"
        content={
          <>
            <DropdownListItem
              onClick={(e) => {
                e.stopPropagation();
                openTagRenameModal(tag.id);
              }}
            >
              <Text textAlign="left" m="0px">
                <Icon name="edit" mr="4px" />
                Rename tag
              </Text>
            </DropdownListItem>
            <DropdownListItem
              onClick={(e) => {
                e.stopPropagation();
                handleTagDelete();
              }}
            >
              <Text textAlign="left" m="0px">
                {deleteIsLoading ? (
                  <Spinner size="20px" />
                ) : (
                  <Box display="flex">
                    <Icon name="delete" mr="4px" />
                    Delete tag
                  </Box>
                )}
              </Text>
            </DropdownListItem>
            <DropdownListItem
              onClick={(e) => {
                e.stopPropagation();
                createAnalysisBulkTaggings();
              }}
            >
              <Text textAlign="left" m="0px">
                {bulkTaggingIsLoading ? (
                  <Spinner size="20px" />
                ) : (
                  <Box display="flex">
                    <Icon name="plus-circle" mr="4px" />
                    Add selected inputs to tag
                  </Box>
                )}
              </Text>
            </DropdownListItem>
          </>
        }
      />
      <Modal
        opened={renameTagModalOpenedId === tag.id}
        close={closeTagRenameModal}
      >
        <RenameTagModal
          closeRenameModal={closeTagRenameModal}
          originalTagName={tag.attributes.name}
          id={tag.id}
          analysisId={analysisId}
        />
      </Modal>
    </div>
  );
};

export default TagActions;
