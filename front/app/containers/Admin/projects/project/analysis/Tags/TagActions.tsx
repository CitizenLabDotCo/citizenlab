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
import styled from 'styled-components';

import useAddAnalysisBulkTagging from 'api/analysis_taggings/useAnalysisBulkTaggings';
import { ITagData } from 'api/analysis_tags/types';
import useDeleteAnalysisTag from 'api/analysis_tags/useDeleteAnalysisTag';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import messages from './messages';
import RenameTagModal from './RenameTagModal';

const StyledSpinner = styled(Spinner)`
  margin-right: 8px;
  width: 20px;
`;

const TagActions = ({ tag }: { tag: ITagData }) => {
  const [renameModalOpenedTagId, setRenameModalOpenedTagId] = useState('');
  const [isDropdownOpened, setDropdownOpened] = useState(false);

  const { mutate: deleteTag, isLoading: deleteIsLoading } =
    useDeleteAnalysisTag();
  const { mutate: bulkAddTaggings, isLoading: bulkTaggingIsLoading } =
    useAddAnalysisBulkTagging();
  const { analysisId } = useParams({
    from: '/$locale/admin/projects/$projectId/analysis/$analysisId',
  });
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
            trackEventByName(tracks.tagDeleted, {
              analysisId,
            });
            closeDropdown();
          },
        }
      );
    }
  };

  const openTagRenameModal = (id: string) => {
    setRenameModalOpenedTagId(id);
    closeDropdown();
  };

  const closeTagRenameModal = () => {
    setRenameModalOpenedTagId('');
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
          trackEventByName(tracks.bulkTagAssignmentPerformed, {
            analysisId,
          });
          closeDropdown();
        },
      }
    );
  };

  return (
    <div data-cy="e2e-analysis-tag-action">
      {/* Could be replaced by reusable MoreActionsMenu? */}
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
        top="-150px"
        content={
          <>
            <DropdownListItem
              onClick={(e) => {
                e.stopPropagation();
                createAnalysisBulkTaggings();
              }}
            >
              <Text textAlign="left" m="0px">
                <Box display="flex" gap="8px">
                  {bulkTaggingIsLoading ? (
                    <StyledSpinner size="20px" />
                  ) : (
                    <Icon name="plus-circle" />
                  )}
                  {formatMessage(messages.addInputToTag)}
                </Box>
              </Text>
            </DropdownListItem>
            <DropdownListItem
              onClick={(e) => {
                e.stopPropagation();
                openTagRenameModal(tag.id);
              }}
            >
              <Text textAlign="left" m="0px">
                <Icon name="edit" mr="8px" />
                {formatMessage(messages.renameTag)}
              </Text>
            </DropdownListItem>
            <DropdownListItem
              onClick={(e) => {
                e.stopPropagation();
                handleTagDelete();
              }}
              id="e2e-analysis-delete-tag-button"
            >
              <Text textAlign="left" m="0px">
                <Box display="flex" gap="8px">
                  {deleteIsLoading ? (
                    <StyledSpinner size="20px" />
                  ) : (
                    <Icon name="delete" />
                  )}
                  {formatMessage(messages.deleteTag)}
                </Box>
              </Text>
            </DropdownListItem>
          </>
        }
      />
      <Modal
        opened={renameModalOpenedTagId === tag.id}
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
