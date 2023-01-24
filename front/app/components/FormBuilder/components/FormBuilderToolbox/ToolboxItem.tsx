import React from 'react';
import styled from 'styled-components';

// components
import { Box, Icon, IconNames, Text } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// styles
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

// services
import { ICustomFieldInputType } from 'services/formCustomFields';
import { useIntl } from 'utils/cl-intl';

// i18n
import messages from '../messages';

interface Props {
  label: string;
  icon: IconNames;
  onClick: () => void;
  'data-cy'?: string;
  fieldsToExclude?: ICustomFieldInputType[];
  inputType?: ICustomFieldInputType;
  disabled?: boolean;
}

const AddIcon = styled(Icon).attrs({ name: 'plus' })`
  margin-left: auto;
  margin-right: 12px;
  fill: ${colors.textSecondary};
  margin-right: 0;
`;

const StyledBox = styled(Box)<{ disabled: boolean }>`
  text-align: left;
  ${AddIcon} {
    visibility: hidden;
  }
  &:hover {
    background-color: ${({ disabled }) =>
      disabled ? 'white' : colors.grey200};
    transition: background-color 80ms ease-out 0s;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  }
  &:hover ${AddIcon} {
    visibility: ${({ disabled }) => (disabled ? 'hidden' : 'visible')};
  }
`;

const ContentWrapper = styled.div<{ tippytheme: 'light' | undefined }>`
  padding: 5px;

  a {
    color: ${(props) =>
      props.tippytheme === 'light' ? colors.primary : colors.white};
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${(props) =>
        darken(
          0.15,
          props.tippytheme === 'light' ? colors.primary : colors.white
        )};
      text-decoration: underline;
    }
  }
`;

const ToolboxItem = ({
  icon,
  label,
  onClick,
  fieldsToExclude,
  inputType,
  disabled,
  ...rest
}: Props) => {
  const { formatMessage } = useIntl();

  if (fieldsToExclude && inputType && fieldsToExclude.includes(inputType)) {
    return null;
  }

  return (
    <Tippy
      interactive={true}
      placement={'left'}
      disabled={!disabled}
      theme={'dark'}
      content={
        <ContentWrapper id="tooltip-content" tippytheme={'light'}>
          {formatMessage(messages.disabledFieldTooltip)}
        </ContentWrapper>
      }
    >
      <Box
        as="button"
        className={`${''} tooltip-icon`}
        aria-describedby="tooltip-content"
        minWidth={!disabled ? '100%' : '140px'}
        p="0px"
        type="button"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <StyledBox
          display="flex"
          px="18px"
          py="18px"
          onClick={onClick}
          width="100%"
          m="0px"
          alignItems="center"
          // remove the role attribute when we add drag and drop functionality
          role="button"
          data-cy={rest['data-cy']}
          disabled={!!disabled}
        >
          <Icon
            fill={disabled ? colors.coolGrey500 : colors.primary}
            width="20px"
            height="20px"
            name={icon}
          />
          <Text
            fontSize="s"
            ml="12px"
            my="0"
            color={disabled ? 'coolGrey500' : 'textPrimary'}
          >
            {label}
          </Text>
          <AddIcon />
        </StyledBox>
      </Box>
    </Tippy>
  );
};

export default ToolboxItem;
