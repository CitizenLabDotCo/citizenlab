import React from 'react';

// components
import {
  IconTooltip,
  Toggle,
  Box,
  Title,
} from '@citizenlab/cl2-component-library';
import { Row } from 'components/admin/ResourceList';
import AdminEditButton from './AdminEditButton';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

export interface Props {
  onChangeSectionToggle: () => void;
  onClickEditButton?: (string) => void;
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  checked: boolean;
  disabled: boolean;
  editLinkPath?: string;
  isLastItem: boolean;
  hideToggle?: boolean;
}

const SectionToggle = ({
  onChangeSectionToggle,
  onClickEditButton,
  titleMessageDescriptor,
  tooltipMessageDescriptor,
  editLinkPath,
  checked,
  disabled,
  isLastItem,
  hideToggle = false,
}: Props) => {
  return (
    <Row isLastItem={isLastItem}>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Box visibility={hideToggle ? 'hidden' : 'visible'} mr="20px">
          <Toggle
            checked={checked}
            onChange={onChangeSectionToggle}
            disabled={disabled}
          />
        </Box>
        <Box pb="13px">
          <Title variant="h3" mr="10px">
            <FormattedMessage {...titleMessageDescriptor} />
          </Title>
        </Box>
        <Box pb="15px">
          <IconTooltip
            content={<FormattedMessage {...tooltipMessageDescriptor} />}
          />
        </Box>
      </Box>
      {editLinkPath && onClickEditButton && (
        <AdminEditButton onClick={() => onClickEditButton(editLinkPath)} />
      )}
    </Row>
  );
};

export default SectionToggle;
