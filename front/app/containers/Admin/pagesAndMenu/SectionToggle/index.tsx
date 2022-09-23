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
import { FormattedMessage } from 'react-intl';
import { MessageDescriptor } from 'react-intl';

export interface Props {
  onChangeSectionToggle: () => void;
  onClickEditButton?: (path: string) => void;
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  checked: boolean;
  disabled: boolean;
  editLinkPath?: string;
  isLastItem: boolean;
  hideToggle?: boolean;
  name?: string;
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
  name,
}: Props) => {
  return (
    <Row isLastItem={isLastItem}>
      <Box
        pt="5px"
        pb="5px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          visibility={hideToggle ? 'hidden' : 'visible'}
          mr="20px"
          mt="7px"
          data-cy={`e2e-admin-section-toggle-${name}`}
        >
          <Toggle
            checked={checked}
            onChange={onChangeSectionToggle}
            disabled={disabled}
          />
        </Box>
        <Box>
          <Title mr="10px">
            <FormattedMessage {...titleMessageDescriptor} />
          </Title>
        </Box>
        <Box>
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
