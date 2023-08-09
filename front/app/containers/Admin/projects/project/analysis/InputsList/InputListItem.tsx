import React from 'react';
import { isEmpty } from 'lodash-es';
import styled from 'styled-components';

import { IInputsData } from 'api/analysis_inputs/types';
import useUserById from 'api/users/useUserById';

import Taggings from '../Taggings';
import { Box } from '@citizenlab/cl2-component-library';
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
    <Box onClick={() => onSelect()} my="12px">
      <Box display="flex" alignItems="center" gap="8px" mb="5px">
        <Box visibility={selected ? 'visible' : 'hidden'}>✅</Box>
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
      <Taggings inputId={input.id} />
      <Divider />
    </Box>
  );
};

export default InputListItem;
