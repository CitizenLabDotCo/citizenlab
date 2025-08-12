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
  &:hover {
    svg {
      fill: ${colors.grey700};
    }
  }
`;

export type Props = {
  title: string | JSX.Element;
  selected?: string[];
  options: Option[];
  isLoading?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onChange: (values: string[]) => void;
  onSearch?: (searchTerm: string) => void;
  onClear?: () => void;
  onOpen?: () => void;
  a11y_clearbuttonActionMessage: string;
  a11y_clearSearchButtonActionMessage: string;
  dataCy?: string;
} & BoxMarginProps;

/** @deprecated Please use components/UI/MultiSelect instead */
const MultiSelect = ({
  title,
  selected = [],
  options,
  isLoading = false,
  searchValue,
  searchPlaceholder,
  onChange,
  onSearch,
  onClear,
  onOpen,
  a11y_clearbuttonActionMessage,
  a11y_clearSearchButtonActionMessage,
  dataCy,
  ...boxProps
}: Props) => {
  const [opened, setOpened] = useState(false);
  const [hover, setHover] = useState<'trigger' | 'clear'>();
  const [focused, setFocused] = useState(false);

  const selectorId = useId();

  const showClearButton = onClear && (hover || focused);

  return (
    <Box
      {...boxProps}
      data-cy={dataCy}
      onMouseLeave={() => setHover(undefined)}
    >
      <Box position="relative">
        <InputContainer
          id={selectorId}
          className={opened ? 'focus' : ''}
          onClick={() => {
            if (!opened) {
              onOpen?.();
            }
            setOpened(!opened);
          }}
          onMouseEnter={() => setHover('trigger')}
          onMouseLeave={() => setHover(undefined)}
          onFocus={() => setFocused(true)}
        >
          <TitleMessage title={title} selected={selected} options={options} />
        </InputContainer>
        {showClearButton && (
          <StyledBox
            as="button"
            type="button"
            bgColor={colors.white}
            position="absolute"
            top="calc(50% - 10px)"
            right="8px"
            borderRadius="50%"
            width="20px"
            height="20px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border={`1px solid ${colors.borderLight}`}
            p="0px"
            cursor="pointer"
            aria-label={a11y_clearbuttonActionMessage}
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            onMouseEnter={() => setHover('clear')}
            onMouseLeave={() => setHover('trigger')}
            onBlur={() => {
              setFocused(false);
            }}
          >
            <Icon name="close" fill="black" />
          </StyledBox>
        )}
      </Box>
      <Dropdown
        opened={opened}
        onClickOutside={() => {
          setOpened(false);
          setFocused(false);
        }}
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
