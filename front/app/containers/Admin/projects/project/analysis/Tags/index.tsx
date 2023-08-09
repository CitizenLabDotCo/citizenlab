import React, { useState } from 'react';
import styled from 'styled-components';
import { max, omit } from 'lodash-es';

import { useParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useAddAnalysisTag from 'api/analysis_tags/useAddAnalysisTag';
import useDeleteAnalysisTag from 'api/analysis_tags/useDeleteAnalysisTag';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import {
  Box,
  Input,
  Button,
  IconButton,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import RenameTagModal from './RenameTagModal';
import Tag from './Tag';
import AutotaggingModal from './AutotaggingModal';
import ProgressBar from 'components/UI/ProgressBar';

import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

const TagContainer = styled.div`
  margin-bottom: 8px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: ${stylingConsts.borderRadius};
  &:hover {
    border: 1px solid ${colors.borderLight};
  }
  &.selected {
    border: 1px solid ${colors.borderLight};
  }
  cursor: pointer;
`;

const StyledProgressBar = styled(ProgressBar)<{ width: number }>`
  height: 5px;
  width: ${({ width }) => width * 100}%;
`;

const Tags = () => {
  const [name, setName] = useState('');
  const [renameTagModalOpenedId, setRenameTagModalOpenedId] = useState('');
  const [autotaggingModalIsOpened, setAutotaggingModalIsOpened] =
    useState(false);

  const filters = useAnalysisFilterParams();

  const { formatMessage } = useIntl();

  const { analysisId } = useParams() as { analysisId: string };

  const { data: tags } = useAnalysisTags({
    analysisId,
    filters: omit(filters, 'tag_ids'),
  });
  const { mutate: addTag, isLoading, error } = useAddAnalysisTag();
  const { mutate: deleteTag } = useDeleteAnalysisTag();

  const onChangeName = (name: string) => {
    setName(name);
  };

  const handleTagSubmit = () => {
    addTag(
      {
        analysisId,
        name,
      },
      {
        onSuccess: () => {
          setName('');
        },
      }
    );
  };

  const handleTagDelete = (id: string) => {
    if (window.confirm(formatMessage(messages.deleteTagConfirmation))) {
      deleteTag({
        analysisId,
        id,
      });
    }
  };

  const closeTagRenameModal = () => {
    setRenameTagModalOpenedId('');
  };

  const selectTag = (id: string) => {
    updateSearchParams({ tag_ids: [id] });
  };

  const maxTotalCount =
    max(tags?.data?.map((t) => t.attributes.total_input_count)) || 1;

  const selectedTags = filters.tag_ids;
  return (
    <Box>
      <Box>
        <Button
          onClick={() => setAutotaggingModalIsOpened(true)}
          icon="flash"
          mb="12px"
          size="s"
          buttonStyle="secondary-outlined"
        >
          Auto-tag
        </Button>
        <Box display="flex" alignItems="center" mb="8px" as="form">
          <Input
            type="text"
            value={name}
            onChange={onChangeName}
            placeholder={formatMessage(messages.addTag)}
            size="small"
          />
          <Button
            ml="4px"
            p="6px"
            onClick={handleTagSubmit}
            disabled={!name || isLoading}
            icon="plus"
          />
        </Box>
        <div>
          {error && (
            <Error apiErrors={error.errors['name']} fieldName="tag_name" />
          )}
        </div>
      </Box>
      <Box>
        <TagContainer
          tabIndex={0}
          onClick={() => removeSearchParams(['tag_ids'])}
          className={!selectedTags ? 'selected' : ''}
        >
          All inputs
        </TagContainer>
        <TagContainer
          tabIndex={0}
          onClick={() => updateSearchParams({ tag_ids: [] })}
          className={selectedTags?.length === 0 ? 'selected' : ''}
        >
          Inputs without tags
        </TagContainer>
        {!isLoading && tags?.data.length === 0 && (
          <Text p="6px" color="grey400">
            <p>You do not have any tags yet.</p>
          </Text>
        )}
        {tags?.data.map((tag) => (
          <TagContainer
            key={tag.id}
            tabIndex={0}
            onClick={() => selectTag(tag.id)}
            className={selectedTags?.includes(tag.id) ? 'selected' : ''}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb="3px"
            >
              <Tag
                name={tag.attributes.name}
                tagType={tag.attributes.tag_type}
              />
              <Box display="flex" gap="0px">
                <IconButton
                  iconName="edit"
                  onClick={() => setRenameTagModalOpenedId(tag.id)}
                  iconColor={colors.grey700}
                  iconColorOnHover={colors.grey700}
                  a11y_buttonActionMessage={formatMessage(messages.editTag)}
                />
                <IconButton
                  iconName="delete"
                  onClick={() => handleTagDelete(tag.id)}
                  iconColor={colors.red600}
                  iconColorOnHover={colors.red600}
                  a11y_buttonActionMessage={formatMessage(messages.deleteTag)}
                />
              </Box>
            </Box>
            <Box display="flex" alignItems="center">
              <StyledProgressBar
                width={tag.attributes.total_input_count / maxTotalCount}
                progress={
                  tag.attributes.filtered_input_count /
                  tag.attributes.total_input_count
                }
                color={colors.blue700}
                bgColor={colors.coolGrey300}
              />
              <Box w="50px" ml="5px">
                {tag.attributes.filtered_input_count ===
                tag.attributes.total_input_count
                  ? tag.attributes.total_input_count
                  : `${tag.attributes.filtered_input_count}/${tag.attributes.total_input_count}`}
              </Box>
            </Box>
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
          </TagContainer>
        ))}
      </Box>
      <Modal
        opened={autotaggingModalIsOpened}
        close={() => setAutotaggingModalIsOpened(false)}
      >
        <AutotaggingModal
          onCloseModal={() => setAutotaggingModalIsOpened(false)}
        />
      </Modal>
    </Box>
  );
};

export default Tags;
