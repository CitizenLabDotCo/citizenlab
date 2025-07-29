import React, { useId, useState } from 'react';

import styled from 'styled-components';

import InputContainer from '../../utils/containers/InputContainer';
import { colors } from '../../utils/styleUtils';
import Box, { BoxMarginProps } from '../Box';
import Dropdown from '../Dropdown';
import Icon from '../Icon';

import DropdownContent from './DropdownContent';
import TitleMessage from './TitleMessage';
import { Option } from './typings';

const StyledBox = styled(Box)`
  background-color: ${colors.white};

  &:hover {
    background-color: ${colors.grey200};
  }
`;

type Props = {
  title: string | JSX.Element;
  selected?: string[];
  options: Option[];
  isLoading?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onChange: (values: string[]) => void;
  onSearch?: (searchTerm: string) => void;
  a11y_clearbuttonActionMessage: string;
  a11y_clearSearchButtonActionMessage: string;
} & BoxMarginProps;

const MultiSelect = ({
  title,
  selected = [],
  options,
  isLoading = false,
  searchValue,
  searchPlaceholder,
  onChange,
  onSearch,
  a11y_clearbuttonActionMessage,
  a11y_clearSearchButtonActionMessage,
  ...boxProps
}: Props) => {
  const [opened, setOpened] = useState(false);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);

  const selectorId = useId();

  const showClearButton = selected.length > 0 && (hover || focused);

  return (
    <Box {...boxProps}>
      <Box>
        <InputContainer
          id={selectorId}
          className={opened ? 'focus' : ''}
          onClick={() => setOpened(!opened)}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <Box position="relative">
            <TitleMessage title={title} selected={selected} options={options} />
            {showClearButton && (
              <StyledBox
                as="button"
                position="absolute"
                top="-1px"
                right="0"
                mr="-8px"
                borderRadius="16px"
                border={`1px solid ${colors.borderLight}`}
                p="0px"
                cursor="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
              >
                <Icon
                  name="close"
                  height="14px"
                  width="19px"
                  m="0"
                  mt="-2px"
                  ariaHidden={false}
                  title={a11y_clearbuttonActionMessage}
                />
              </StyledBox>
            )}
          </Box>
        </InputContainer>
      </Box>
      <Dropdown
        opened={opened}
        onClickOutside={() => setOpened(false)}
        content={
          <DropdownContent
            selectorId={selectorId}
            options={options}
            selected={selected}
            isLoading={isLoading}
            searchValue={searchValue}
            searchPlaceholder={searchPlaceholder}
            onChange={onChange}
            onSearch={onSearch}
            a11y_clearSearchButtonActionMessage={
              a11y_clearSearchButtonActionMessage
            }
          />
        }
      />
    </Box>
  );
};

export default MultiSelect;
