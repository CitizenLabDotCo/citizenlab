import React from 'react';
import {
  Box,
  stylingConsts,
  colors,
  IconButton,
} from '@citizenlab/cl2-component-library';
import { IInputsFilterParams } from 'api/analysis_inputs/types';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import InputFieldFilterItem from './InputFieldFilterItem';
import AuthorFieldFilterItem from './AuthorFieldFilterItem';
import EllipsisFilterValue from './EllipsisFilterValue';
import { useParams } from 'react-router-dom';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import Tag from '../Tags/Tag';

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
};

const translationKeys: Record<
  string,
  { translationKey: string; predicate: '>' | '<' | '=' }
> = {
  search: {
    translationKey: 'Search',
    predicate: '=',
  },
  published_at_from: {
    translationKey: 'Start',
    predicate: '>',
  },
  published_at_to: {
    translationKey: 'End',
    predicate: '<',
  },
  reactions_from: {
    translationKey: 'Reactions',
    predicate: '>',
  },
  reactions_to: {
    translationKey: 'Reactions',
    predicate: '<',
  },
  votes_from: {
    translationKey: 'Votes',
    predicate: '>',
  },
  votes_to: {
    translationKey: 'Votes',
    predicate: '<',
  },
  comments_from: {
    translationKey: 'Comments',
    predicate: '>',
  },
  comments_to: {
    translationKey: 'Comments',
    predicate: '<',
  },
};

const FilterItems = ({ filters, isEditable }: FilterItemsProps) => {
  const { analysisId } = useParams() as { analysisId: string };
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
        } else if (key === 'tag_ids') {
          return (
            <>
              {tags?.data
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
              <Box>{translationKeys[key].translationKey}</Box>
              <Box mx="3px">{translationKeys[key].predicate}</Box>
              <EllipsisFilterValue>{value}</EllipsisFilterValue>
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
                  a11y_buttonActionMessage="Remove filter"
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
