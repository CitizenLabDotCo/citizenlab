import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { isEqual, omit, uniq } from 'lodash-es';

import { useParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import {
  Box,
  Button,
  colors,
  stylingConsts,
  Text,
  Icon,
  ListItem,
  Checkbox,
  Spinner,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import Tag from './Tag';
import AutotaggingModal from './AutoTaggingModal';
import TagCount from './TagCount';
import AddTag from './AddTag';
import TagAssistance from './TagAssistance';

import { useQueryClient } from '@tanstack/react-query';
import inputsKeys from 'api/analysis_inputs/keys';
import TagActions from './TagActions';
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';
import translations from './translations';
import { useIntl } from 'utils/cl-intl';

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

  const toggleTagContainerClick = (id: string) => {
    updateSearchParams({ tag_ids: [id] });
    queryClient.invalidateQueries(inputsKeys.lists());
    trackEventByName(tracks.tagFilterUsed.name, {
      extra: { tagId: id },
    });
  };

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
    trackEventByName(tracks.tagFilterUsed.name, {
      extra: { tagId: id },
    });
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <TagAssistance
        tagId={tagAssistanceTagId}
        onHide={() => setTagAssistanceTagId(null)}
      />
      <Modal
        opened={autotaggingModalIsOpened}
        close={() => setAutotaggingModalIsOpened(false)}
      >
        <AutotaggingModal
          onCloseModal={() => setAutotaggingModalIsOpened(false)}
        />
      </Modal>
      <Box>
        <Button
          id="auto-tag-button"
          onClick={() => setAutotaggingModalIsOpened(true)}
          icon="flash"
          mb="12px"
          size="s"
          buttonStyle="admin-dark"
        >
          {formatMessage(translations.autoTag)}
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
        >
          {formatMessage(translations.allInputs)}
          <TagCount
            count={inputsTotal}
            totalCount={inputsTotal}
            filteredCount={filteredInputsTotal}
          />
        </TagContainer>
        <TagContainer
          tabIndex={0}
          onClick={() => updateSearchParams({ tag_ids: [null] })}
          className={selectedTags && selectedTags[0] === null ? 'selected' : ''}
        >
          {formatMessage(translations.inputsWithoutTags)}
          <TagCount
            count={inputsWithoutTags}
            totalCount={inputsTotal}
            filteredCount={filteredInputsWithoutTags}
          />
        </TagContainer>
      </Box>
      <Box flex="1" overflow="auto">
        {tags?.data.map((tag) => (
          <TagContainer
            id={`tag-${tag.id}`}
            key={tag.id}
            tabIndex={0}
            onClick={() => {
              toggleTagContainerClick(tag.id);
            }}
            className={selectedTags?.includes(tag.id) ? 'selected' : ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                toggleTagContainerClick(tag.id);
              }
            }}
          >
            <Box
              position="absolute"
              top="20px"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Checkbox
                checked={!!selectedTags?.includes(tag.id)}
                onChange={() => {
                  toggleТаgCheckboxClick(tag.id);
                }}
                size="20px"
              />
            </Box>
            <Box ml={'28px'}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Tag
                  name={tag.attributes.name}
                  tagType={tag.attributes.tag_type}
                />
                <Box display="flex">
                  <TagActions tag={tag} />
                </Box>
              </Box>
              <TagCount
                count={tag.attributes.total_input_count}
                totalCount={inputsTotal}
                filteredCount={tag.attributes.filtered_input_count}
              />
            </Box>
          </TagContainer>
        ))}
        {!isLoadingTags && emptyState && (
          <Box>
            <Text p="6px" color="grey600" textAlign="center">
              {formatMessage(translations.noTags)}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Tags;
