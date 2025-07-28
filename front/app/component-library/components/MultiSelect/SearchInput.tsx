import React from 'react';

import { colors } from '../../utils/styleUtils';
import Box from '../Box';
import Icon from '../Icon';
import IconButton from '../IconButton';
import Input from '../Input';
import { IconContainer } from '../SearchInput';

interface Props {
  value?: string;
  placeholder?: string;
  onSearch?: (searchTerm: string) => void;
}

const SearchInput = ({ value, placeholder, onSearch }: Props) => {
  return (
    <Box mb="8px" position="relative">
      <Input
        value={value}
        placeholder={placeholder}
        type="text"
        onChange={onSearch}
      />
      <IconContainer>
        {value && value.length > 0 ? (
          <IconButton
            iconName="close"
            onClick={() => onSearch?.('')}
            iconColor={colors.textSecondary}
            iconColorOnHover="#000"
            a11y_buttonActionMessage={''}
            p="0"
          />
        ) : (
          <Icon name="search" fill={colors.textSecondary} />
        )}
      </IconContainer>
    </Box>
  );
};

export default SearchInput;
