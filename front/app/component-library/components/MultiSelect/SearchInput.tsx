import React from 'react';

import { colors } from '../../utils/styleUtils';
import Box from '../Box';
import Icon from '../Icon';
import IconButton from '../IconButton';
import Input from '../Input';

interface Props {
  value?: string;
  placeholder?: string;
  onSearch?: (searchTerm: string) => void;
  a11y_clearSearchButtonActionMessage: string;
}

const SearchInput = ({
  value,
  placeholder,
  onSearch,
  a11y_clearSearchButtonActionMessage,
}: Props) => {
  return (
    <Box mb="8px" position="relative">
      <Input
        value={value}
        placeholder={placeholder}
        type="text"
        onChange={onSearch}
      />
      <Box position="absolute" right="8px" top="11px">
        {value && value.length > 0 ? (
          <IconButton
            iconName="close"
            onClick={() => onSearch?.('')}
            iconColor={colors.textSecondary}
            iconColorOnHover="#000"
            a11y_buttonActionMessage={a11y_clearSearchButtonActionMessage}
            p="0"
          />
        ) : (
          <Icon name="search" fill={colors.textSecondary} />
        )}
      </Box>
    </Box>
  );
};

export default SearchInput;
