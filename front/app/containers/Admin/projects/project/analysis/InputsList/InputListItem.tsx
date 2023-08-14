import React from 'react';
import { isEmpty } from 'lodash-es';

import { IInputsData } from 'api/analysis_inputs/types';
import useUserById from 'api/users/useUserById';

import Taggings from '../Taggings';
import { Box, Icon, colors, Text } from '@citizenlab/cl2-component-library';
import Divider from 'components/admin/Divider';

import T from 'components/T';
import { useIntl } from 'utils/cl-intl';
import Avatar from 'components/Avatar';
import { getFullName } from 'utils/textUtils';

interface Props {
  input: IInputsData;
  onSelect: () => void;
  selected: boolean;
}

const InputListItem = ({ input, onSelect, selected }: Props) => {
  const { data: author } = useUserById(input.relationships.author.data?.id);
  const { formatDate } = useIntl();

  if (!input) return null;

  const { title_multiloc } = input.attributes;

  return (
    <>
      <Box
        onClick={() => onSelect()}
        bg={selected ? colors.background : colors.white}
        p="12px"
        display="flex"
        flexDirection="column"
        gap="8px"
        style={{ cursor: 'pointer' }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap="8px"
          justifyContent="space-between"
        >
          {!title_multiloc ||
            (isEmpty(title_multiloc) && author && (
              <Box display="flex" alignItems="center">
                <Avatar userId={author.data.id} size={24} />
                <Text m="0px">{getFullName(author.data)}</Text>
              </Box>
            ))}
          {!title_multiloc ||
            (isEmpty(title_multiloc) && !author && (
              <Text m="0px">Anonymous input</Text>
            ))}
          {title_multiloc && (
            <Text m="0px">
              <T value={title_multiloc} />
            </Text>
          )}
          <Text color="textSecondary" fontSize="s" m="0px">
            {input.attributes.published_at &&
              formatDate(input.attributes.published_at)}
          </Text>
        </Box>
        <Box display="flex" gap="8px">
          {!!input.attributes.likes_count && (
            <Box display="flex" gap="4px">
              <Icon width="20px" height="20px" name="vote-up" />
              <span> {input.attributes.likes_count}</span>
            </Box>
          )}
          {!!input.attributes.dislikes_count && (
            <Box display="flex" gap="4px">
              <Icon width="20px" height="20px" name="vote-down" />
              <span> {input.attributes.dislikes_count}</span>
            </Box>
          )}
          {!!input.attributes.votes_count && (
            <Box display="flex" gap="4px">
              <Icon width="20px" height="20px" name="vote-ballot" />
              <span> {input.attributes.votes_count}</span>
            </Box>
          )}
          {!!input.attributes.comments_count && (
            <Box display="flex" gap="4px">
              <Icon width="20px" height="20px" name="comments" />
              <span> {input.attributes.comments_count}</span>
            </Box>
          )}
        </Box>

        <Taggings inputId={input.id} />
      </Box>
      <Divider m="0px" />
    </>
  );
};

export default InputListItem;
