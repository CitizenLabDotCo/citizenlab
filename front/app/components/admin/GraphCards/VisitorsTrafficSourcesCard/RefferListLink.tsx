import React from 'react';

import { Text, Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const TableViewButton = styled.button`
  all: unset;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${colors.black};
  }
`;

interface Props {
  onOpenModal: () => void;
}

const ReferrerListLink = ({ onOpenModal }: Props) => (
  <Text mt="0px" mb="0px" color="coolGrey600" fontSize="s">
    <Icon
      name="info-outline"
      fill={colors.coolGrey600}
      width="14px"
      height="14px"
      transform="translate(0,-1)"
      mr="4px"
    />
    <FormattedMessage
      {...messages.viewReferrerList}
      values={{
        referrerListButton: (
          <TableViewButton onClick={onOpenModal}>
            <FormattedMessage {...messages.referrerListButton} />
          </TableViewButton>
        ),
      }}
    />
  </Text>
);

export default ReferrerListLink;
