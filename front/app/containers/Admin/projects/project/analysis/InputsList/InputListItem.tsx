import React from 'react';
import { isEmpty } from 'lodash-es';
import styled from 'styled-components';

import { IInputsData } from 'api/analysis_inputs/types';
import useUserById from 'api/users/useUserById';

import Taggings from '../Taggings';
import { Box, Icon, colors } from '@citizenlab/cl2-component-library';
import Divider from 'components/admin/Divider';

import T from 'components/T';

const AvatarImageBubble = styled.img<{
  size: number;
}>`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  border: solid 2px #fff;
  object-fit: cover;
  object-position: center;
`;

interface Props {
  input: IInputsData;
  onSelect: () => void;
  selected: boolean;
}

const InputListItem = ({ input, onSelect, selected }: Props) => {
  const { data: author } = useUserById(input.relationships.author.data?.id);

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
        <Box display="flex" alignItems="center" gap="8px" mb="5px">
          {!title_multiloc ||
            (isEmpty(title_multiloc) && author && (
              <Box>
                <AvatarImageBubble
                  size={26}
                  src={author?.data.attributes.avatar?.small || undefined}
                />
                {author?.data.attributes.first_name}&nbsp;
                {author?.data.attributes.last_name}
              </Box>
            ))}
          {!title_multiloc ||
            (isEmpty(title_multiloc) && !author && <Box>Anonymous input</Box>)}
          {title_multiloc && <T value={title_multiloc} />}
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
