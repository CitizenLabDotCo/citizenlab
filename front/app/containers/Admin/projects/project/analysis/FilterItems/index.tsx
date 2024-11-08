import React from 'react';

import {
  Box,
  stylingConsts,
  colors,
  IconButton,
} from '@citizenlab/cl2-component-library';

import { IInputsFilterParams } from 'api/analysis_inputs/types';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import Tag from '../Tags/Tag';

import AuthorFieldFilterItem from './AuthorFieldFilterItem';
import EllipsisFilterValue from './EllipsisFilterValue';
import InputFieldFilterItem from './InputFieldFilterItem';
import messages from './messages';

const clauseToPredicate = (clause?: string): '>' | '<' | '=' => {
  if (clause === 'from') {
    return '>';
  } else if (clause === 'to') {
    return '<';
  } else {
    return '=';
  }
};

type FilterItemsProps = {
  filters: IInputsFilterParams;
  isEditable: boolean;
  analysisId: string;
};

const translationKeys: Record<
  string,
  { translationKey: MessageDescriptor; predicate?: '>' | '<' | '=' }
> = {
  search: {
    translationKey: messages.search,
    predicate: '=',
  },
  published_at_from: {
    translationKey: messages.start,
    predicate: '>',
  },
  published_at_to: {
    translationKey: messages.end,
    predicate: '<',
  },
  reactions_from: {
    translationKey: messages.reactions,
    predicate: '>',
  },
  reactions_to: {
    translationKey: messages.reactions,
    predicate: '<',
  },
  votes_from: {
    translationKey: messages.votes,
    predicate: '>',
  },
  votes_to: {
    translationKey: messages.votes,
    predicate: '<',
  },
  comments_from: {
    translationKey: messages.comments,
    predicate: '>',
  },
  comments_to: {
    translationKey: messages.comments,
    predicate: '<',
  },
  input_custom_field_no_empty_values: {
    translationKey: messages.emptyCustomFields,
  },
  limit: {
    translationKey: messages.limit,
    predicate: '=',
  },
};

const FilterItems = ({ filters, isEditable, analysisId }: FilterItemsProps) => {
  const { formatMessage } = useIntl();

  const { data: tags } = useAnalysisTags({ analysisId });

  return (
    <Box display="flex" flexWrap="wrap" gap="4px">
      {Object.entries(filters).map(([key, value]) => {
        const [_fullKey, subject, customFieldId, _postfix, clause] =
          key.match(/^(author|input)_custom_([a-f0-9-]+)(_(from|to))?$/) || [];
        const predicate = clauseToPredicate(clause);
        if (subject === 'input') {
          return (
            <InputFieldFilterItem
              key={key}
              customFieldId={customFieldId}
              filterKey={key}
              filterValue={value}
              predicate={predicate}
              isEditable={isEditable}
            />
          );
        } else if (subject === 'author') {
          return (
            <AuthorFieldFilterItem
              key={key}
              customFieldId={customFieldId}
              filterKey={key}
              filterValue={value}
              predicate={predicate}
              isEditable={isEditable}
            />
          );
        } else if (
          key === 'tag_ids' &&
          (value as string[] | null[]).length === 1 &&
          (value as string[] | null[])[0] === null
        ) {
          return (
            <Tag
              key={null}
              name={formatMessage(messages.inputsWIthoutTags)}
              tagType={'custom'}
            />
          );
        } else if (key === 'tag_ids') {
          return (
            <>
              {tags?.data // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                .filter((tag) => (value as string[])?.includes(tag.id))
                .map((tag) => (
                  <Tag
                    key={tag.id}
                    name={tag.attributes.name}
                    tagType={tag.attributes.tag_type}
                  />
                ))}
            </>
          );
        } else {
          return (
            <Box
              key={key}
              py="4px"
              px="8px"
              borderRadius={stylingConsts.borderRadius}
              borderColor={colors.success}
              borderWidth="1px"
              borderStyle="solid"
              bgColor={colors.white}
              color={colors.success}
              display="flex"
            >
              <Box>{formatMessage(translationKeys[key].translationKey)}</Box>
              {translationKeys[key].predicate && (
                <>
                  <Box mx="3px">{translationKeys[key].predicate}</Box>
                  <EllipsisFilterValue>{value?.toString()}</EllipsisFilterValue>
                </>
              )}
              {isEditable && (
                <IconButton
                  iconName="close"
                  iconColor={colors.success}
                  iconColorOnHover={colors.success}
                  iconWidth="16px"
                  iconHeight="16px"
                  onClick={() => {
                    removeSearchParams([key]);
                  }}
                  a11y_buttonActionMessage={formatMessage(
                    messages.removeFilter
                  )}
                />
              )}
            </Box>
          );
        }
      })}
    </Box>
  );
};

export default FilterItems;
