import React, { useState } from 'react';

import {
  Dropdown,
  DropdownListItem,
  Button,
  colors,
  Spinner,
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
      <Button
        icon="dots-horizontal"
        iconColor={colors.textSecondary}
        iconHoverColor={colors.textSecondary}
        boxShadow="none"
        boxShadowHover="none"
        bgColor="transparent"
        bgHoverColor="transparent"
        pr="0"
        onClick={(e) => {
          e.stopPropagation();
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
              Rename
            </DropdownListItem>
            <DropdownListItem
              onClick={(e) => {
                e.stopPropagation();
                handleTagDelete();
              }}
            >
              {deleteIsLoading ? <Spinner size="20px" /> : 'Delete'}
            </DropdownListItem>
            <DropdownListItem
              onClick={(e) => {
                e.stopPropagation();
                createAnalysisBulkTaggings();
              }}
            >
              {bulkTaggingIsLoading ? (
                <Spinner size="20px" />
              ) : (
                'Add inputs to tag'
              )}
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
