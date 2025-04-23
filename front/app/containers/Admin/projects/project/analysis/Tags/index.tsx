import React, { useCallback, useEffect, useState } from 'react';

import {
  Box,
  Button,
  colors,
  stylingConsts,
  Text,
  Icon,
  ListItem,
  Spinner,
  CheckboxWithLabel,
} from '@citizenlab/cl2-component-library';
import { useQueryClient } from '@tanstack/react-query';
import { isEqual, omit, uniq } from 'lodash-es';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import inputsKeys from 'api/analysis_inputs/keys';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';

import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import tracks from '../tracks';

import AddTag from './AddTag';
import AutotaggingModal from './AutoTaggingModal';
import messages from './messages';
import Tag from './Tag';
import TagActions from './TagActions';
import TagAssistance from './TagAssistance';
import TagCount from './TagCount';

const BlickingIcon = styled(Icon)`
  animation-name: blink-animation;
  animation-duration: 1.8s;
  animation-delay: 1s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;

  @keyframes blink-animation {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const TagContainer = styled(ListItem)`
  padding: 8px 4px;
  position: relative;
  border-radius: ${stylingConsts.borderRadius};
  &:hover {
    background-color: ${colors.background};
  }
  &.selected {
    background-color: ${colors.background};
  }
  cursor: pointer;
`;

const Tags = () => {
  const [height, setHeight] = useState(0);

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  const { formatMessage } = useIntl();
  const [autotaggingModalIsOpened, setAutotaggingModalIsOpened] =
    useState(false);
  const [createdTagId, setCreatedTagId] = useState<string | null>(null);
  const [tagAssistanceTagId, setTagAssistanceTagId] = useState<string | null>(
    null
  );

  const filters = useAnalysisFilterParams();

  const { analysisId } = useParams() as { analysisId: string };

  const queryClient = useQueryClient();
  const { data: tags, isLoading: isLoadingTags } = useAnalysisTags({
    analysisId,
    filters: omit(filters, 'tag_ids'),
  });

  useEffect(() => {
    if (
      createdTagId &&
      tags?.data.map((tag) => tag.id).includes(createdTagId)
    ) {
      const tagElement = document.getElementById(`tag-${createdTagId}`);
      if (tagElement) {
        tagElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setCreatedTagId(null);
      setTagAssistanceTagId(createdTagId);
    }
  }, [createdTagId, tags]);

  if (isLoadingTags) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100%">
        <Spinner />
      </Box>
    );
  }

  const inputsTotal = tags?.meta.inputs_total;
  const filteredInputsTotal = tags?.meta.filtered_inputs_total;
  const inputsWithoutTags = tags?.meta.inputs_without_tags;
  const filteredInputsWithoutTags = tags?.meta.filtered_inputs_without_tags;

  // We need `as any[] | undefined` due to known TS limitation in various places
  // below of code using `selectedTags`
  // https://github.com/microsoft/TypeScript/issues/44373
  const selectedTags = filters.tag_ids as any[] | undefined;

  // We show the empty state in case the only tags there are the initial
  // onboarding example tags
  const emptyState =
    tags?.data &&
    isEqual(
      ['onboarding_example'],
      uniq(tags.data.map((tag) => tag.attributes.tag_type))
    );

  const toggleТаgCheckboxClick = (id: string) => {
    const nonNullSelectedTags = selectedTags?.filter((tagId) => tagId !== null);
    if (!selectedTags?.includes(id)) {
      updateSearchParams({ tag_ids: [...(nonNullSelectedTags || []), id] });
    } else {
      updateSearchParams({
        tag_ids: nonNullSelectedTags?.filter((tagId) => tagId !== id),
      });
    }
    queryClient.invalidateQueries(inputsKeys.lists());
    trackEventByName(tracks.tagFilterUsed, {
      tagId: id,
    });
  };

  const toggleTagContainerClick = (id: string) => {
    updateSearchParams({ tag_ids: [id] });
    queryClient.invalidateQueries(inputsKeys.lists());
    trackEventByName(tracks.tagFilterUsed, {
      tagId: id,
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      overflow="auto"
      pb="12px"
      px="12px"
    >
      <TagAssistance
        tagId={tagAssistanceTagId}
        onHide={() => setTagAssistanceTagId(null)}
      />
      <Modal
        opened={autotaggingModalIsOpened}
        close={() => setAutotaggingModalIsOpened(false)}
        width="1000px"
      >
        <AutotaggingModal
          onCloseModal={() => setAutotaggingModalIsOpened(false)}
        />
      </Modal>
      <Box
        position="fixed"
        bgColor={colors.white}
        zIndex="2"
        ref={measuredRef}
        w="265px"
        pt="12px"
      >
        <Box>
          <Button
            id="auto-tag-button"
            onClick={() => setAutotaggingModalIsOpened(true)}
            icon="stars"
            mb="12px"
            size="s"
            buttonStyle="admin-dark"
          >
            {formatMessage(messages.autoTag)}
            {emptyState && (
              <BlickingIcon
                name={'dot'}
                width="16px"
                height="16px"
                fill={colors.white}
                ml="8px"
              />
            )}
          </Button>
          <AddTag onCreateTag={(tagId) => setCreatedTagId(tagId)} />
        </Box>
        <Box>
          <TagContainer
            tabIndex={0}
            onClick={() => removeSearchParams(['tag_ids'])}
            className={!selectedTags ? 'selected' : ''}
            data-cy="e2e-analysis-all-tags"
          >
            {formatMessage(messages.allInputs)}
            <TagCount
              count={inputsTotal}
              totalCount={inputsTotal}
              filteredCount={filteredInputsTotal}
            />
          </TagContainer>
          <TagContainer
            tabIndex={0}
            onClick={() => updateSearchParams({ tag_ids: [null] })}
            className={
              selectedTags && selectedTags[0] === null ? 'selected' : ''
            }
            data-cy="e2e-analysis-inputs-without-tags"
          >
            {formatMessage(messages.inputsWithoutTags)}
            <TagCount
              count={inputsWithoutTags}
              totalCount={inputsTotal}
              filteredCount={filteredInputsWithoutTags}
            />
          </TagContainer>
        </Box>
      </Box>
      <Box flex="1" mt={`${height - 1}px`} w="265px">
        {tags?.data.map((tag) => (
          <TagContainer
            id={`tag-${tag.id}`}
            key={tag.id}
            onClick={() => {
              toggleTagContainerClick(tag.id);
            }}
            className={selectedTags?.includes(tag.id) ? 'selected' : ''}
            data-cy="e2e-analysis-tag-container"
          >
            <Box
              onClick={(e) => {
                e.stopPropagation();
              }}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <CheckboxWithLabel
                checked={!!selectedTags?.includes(tag.id)}
                onChange={() => {
                  toggleТаgCheckboxClick(tag.id);
                }}
                size="20px"
                label={
                  <Tag
                    name={tag.attributes.name}
                    tagType={tag.attributes.tag_type}
                  />
                }
              />
              <TagActions tag={tag} />
            </Box>
            <Box ml={'28px'}>
              <TagCount
                count={tag.attributes.total_input_count}
                totalCount={inputsTotal}
                filteredCount={tag.attributes.filtered_input_count}
              />
            </Box>
          </TagContainer>
        ))}

        {emptyState && (
          <Box>
            <Text p="6px" color="grey600" textAlign="center">
              {formatMessage(messages.noTags)}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Tags;
