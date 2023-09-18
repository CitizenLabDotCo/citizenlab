import React, { useState } from 'react';
import styled from 'styled-components';
import { omit } from 'lodash-es';

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

  const filters = useAnalysisFilterParams();

  const { analysisId } = useParams() as { analysisId: string };

  const queryClient = useQueryClient();
  const { data: tags, isLoading: isLoadingTags } = useAnalysisTags({
    analysisId,
    filters: omit(filters, 'tag_ids'),
  });

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
    <Box>
      <Box>
        <Button
          onClick={() => setAutotaggingModalIsOpened(true)}
          icon="flash"
          mb="12px"
          size="s"
          buttonStyle="secondary-outlined"
        >
          {formatMessage(translations.autoTag)}
          {!tags?.data.length && (
            <BlickingIcon
              name={'dot'}
              width="16px"
              height="16px"
              fill={colors.primary}
              ml="8px"
            />
          )}
        </Button>
        <AddTag />
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
        {!isLoadingTags && tags?.data.length === 0 && (
          <Text p="6px" color="grey400">
            {formatMessage(translations.noTags)}
          </Text>
        )}
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
